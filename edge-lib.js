const MbedDevice = require('./device');
const EdgeRpc = require('./edge-rpc-client');
const EdgeMgmt = require('./edge-mgmt-client');
const DevJSDevice = require('./generic_device');

const CON_PR = '\x1b[34m[ClientService]\x1b[0m';

function RemoteClientService(socket_path, pt_api_path, mgmt_api_path, name) {
    this.edgeRpc = new EdgeRpc(socket_path, pt_api_path, name);
    this.edgeMgmt = new EdgeMgmt(socket_path, mgmt_api_path, name);

    this.devices = [];
    this.mbedDevices = {};
}

function parse(stringVal,type) {
    let value;

    if (type === 'int') {
        value = parseInt(stringVal);
    } else if (type === 'float') {
        value = parseFloat(stringVal);
    } else if (type === 'string') {
        value = stringVal;
    } else {
        value = 0;
    }

    return value;
}

RemoteClientService.prototype.init = async function() {
    var self = this;
    // Setup client to edge-core websocket api /1/mgmt
    self.edgeMgmt.init();
    // Poll edge-core registered devices every 60 secs and for new found device, register it in devicejs
    setInterval(function() {
        self.edgeMgmt.getDevices().then(devices => {
            var registeredDevices = self.devices.filter(d => d.getRegistrationStatus());
            Object.keys(self.mbedDevices).forEach(function(endpointName) {
                var mbedDevice = self.mbedDevices[endpointName];
                if(devices.data.find(dev => {
                        return dev.endpointName == endpointName;
                    }) == undefined) {
                    DevJSDevice.remove(endpointName);
                    delete self.mbedDevices[endpointName];
                } else {
                    Object.keys(mbedDevice.resources).forEach(uri => {
                        self.edgeMgmt.read_resource(endpointName, uri).then(val => {
                            var parsedVal = parse(val.stringValue, val.type);
                            if(mbedDevice.resources[uri] != parsedVal) {
                                mbedDevice.onResourceChange(uri, parsedVal);
                            }
                        })
                    })
                }
            })
            devices.data.forEach(device => {
                if(registeredDevices.find(dev => {
                        return dev.endpoint == device.endpointName;
                    }) == undefined && self.mbedDevices[device.endpointName] == undefined) {
                    console.log(CON_PR, "Found new mbed device: "+device.endpointName);
                    DevJSDevice.create(device,self.edgeMgmt).then(devController => {
                        console.log(CON_PR,"\x1b[32m Successfully registered "+device.endpointName+" in devicejs");
                        self.mbedDevices[device.endpointName] = devController;
                        device.resources.forEach(resource => {
                        self.edgeMgmt.read_resource(device.endpointName, resource.uri).then(val => {
                            devController.onResourceChange(resource.uri, parse(val.stringValue, val.type));
                        })
                    })
                    },reject => {
                        console.log(CON_PR,"\x1b[31m Failed to add "+device.endpointName+" in devicejs, err - "+reject);
                    })
                }
            })
        })
    }, 60000)
    return self.edgeRpc.init();
};

RemoteClientService.prototype.deinit = async function() {
    this.edgeMgmt.deinit();
    return this.edgeRpc.deinit();
};

/**
 * List all devices registered in the bridge.
 * Returns an array of IDs.
 */
RemoteClientService.prototype.listDevices = async function() {
    return Promise.resolve(this.devices.map(d => d.id));
};

/**
 * Get all devices that are cached in the bridge and are registered with mbed Cloud
 */
RemoteClientService.prototype.getAllRegisteredDevices = function() {
    return this.devices.filter(d => d.getRegistrationStatus());
};

RemoteClientService.prototype.getEndpointForId = function(id) {
    let d = this.devices.find(d => d.id);
    if (!d) return null;

    return d.endpoint; // only returns something when registered though
};

/**
 * Gets the device from the bridge (or from cache if already loaded).
 * Returns an MbedDevice object.
 */
RemoteClientService.prototype.getDevice = async function(id, clientType) {
    let device = this.devices.filter(d => d.id === id)[0];

    if (!device) {
        return this.createCloudDevice(id, clientType);
    }
    return device;
};

RemoteClientService.prototype.createCloudDevice = async function(id, clientType) {
    let sshClient, rpcClient;

    const ID_PR = '[' + id + ']';

    try {
        let device = new MbedDevice(id, clientType, this.edgeRpc);

        this.devices.push(device);

        return device;
    }
    catch (ex) {
        // creating device failed...
        await this.deleteDevice(id);
        throw ex;
    }
};

RemoteClientService.prototype.deleteDevice = async function(id) {
    let device = this.devices.find(d => d.id === id);
    if (device) {
        await device.deregister();
    }

    let cacheIx = this.devices.findIndex(d => d.id === id);
    if (cacheIx > -1) {
        this.devices.splice(cacheIx, 1);
    }
};

module.exports = RemoteClientService;
