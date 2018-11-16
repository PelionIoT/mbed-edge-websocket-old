const EventEmitter = require('events');
const Dev = require('./generic_device/controller');

const CON_PR = '\x1b[34m[MgmtClient]\x1b[0m';

var map = {
    '/3303/0/5700': {
        interface: 'Facades/HasTemperature',
        state: 'temperature',
        type: 'float'
    },
    '/3303/0/5701': {
        interface: 'Facades/TemperatureDisplayMode',
        state: 'temperatureDisplayMode',
        type: 'string'
    }
}

function MGMTClient(edgeMgmt, ignoreDevs) {
    EventEmitter.call(this);

    this.edgeMgmt = edgeMgmt;
    this.is_open = () => edgeMgmt.is_open();
    this.ignoreDevs = ignoreDevs;
    this.devices = {};
}

function parse(uri, stringVal) {
    let value;
    var type = map[uri].type;

    if (type === undefined) {
        value = map[uri].parse(stringVal);
    } else if (type === 'int') {
        value = parseInt(stringVal);
    } else if (type === 'float') {
        value = parseFloat(stringVal);
    } else if (type === 'string') {
        value = stringVal;
    } else if (type === 'boolean') {
        if(parseInt(stringVal) == 0) value = false
        else if(parseInt(stringVal) == 1) value = true
    }

    return value;
}

function addResourceType(config) {
    return new Promise(function(resolve, reject) {
        if(config.interfaces.length <1) return reject('No mapped interfaces')
        dev$.addResourceType(config).then(function() {
            resolve(config.name);
        }, function(err) {
            return reject(err);
        });
    });
}

function startDevice(id, initStates, resourceConfig, edgeMgmtClient) {
    return new Promise(function(resolve, reject) {
        dev$.listInterfaceTypes().then(function(interfaceTypes) {
            var devInterfaceStates = [];
            resourceConfig.interfaces.forEach(function(intf) {
                if(typeof interfaceTypes[intf] !== 'undefined' && intf.indexOf("Facades") > -1) {
                    try {
                        devInterfaceStates.push(Object.keys(interfaceTypes[intf]['0.0.1'].state)[0]);
                    } catch(e) {
                        reject('Failed to parse interface ' + e);
                    }
                } else {
                    console.log(CON_PR,'\x1b[33m THIS SHOULD NOT HAVE HAPPENED. FOUND INTERFACE WHICH IS NOT SUPPORTED BY DEVICEJS');
                }
            });
            var Device = dev$.resource(resourceConfig.name, Dev);
            var device = new Device(id);

            device.start({
                id: id,
                supportedStates: devInterfaceStates,
                initStates: initStates || {},
                edgeMgmtClient: edgeMgmtClient
            }).then(function() {
                resolve(device);
            }, function(err) {
                if(typeof err.status !== 'undefined' && err.status == 500 && err.response == 'Already registered') {
                    console.log(CON_PR,"\x1b[33m "+id+" device controller already exists");
                    resolve(device);
                } else reject(err);
            });
        });
    });
}

MGMTClient.prototype = Object.create(EventEmitter.prototype);

MGMTClient.prototype.init = async function() {
    var self = this;
    await self.edgeMgmt.init();
    // Poll edge-core registered devices every 60 secs and for new found device, register it in devicejs

    self.pollInterval = setInterval(function() {
        self.edgeMgmt.getDevices().then(devices => {
            console.log(CON_PR, "Mbed devices: "+JSON.stringify(devices));
            Object.keys(self.devices).forEach(function(endpointName) {
                var mbedDevice = self.devices[endpointName];
                if(devices.data.find(dev => {
                        return dev.endpointName == endpointName;
                    }) == undefined) {
                    console.log(CON_PR, "Removing mbed device: "+endpointName+" from devicejs");
                    self.removeDevice(endpointName);
                } else {
                    Object.keys(mbedDevice.resources).forEach(uri => {
                        self.edgeMgmt.read_resource(endpointName, uri).then(val => {
                            var parsedVal = parse(uri, val.stringValue);
                            if(parsedVal == undefined) {
                                console.log(CON_PR,"\x1b[31m Failed to parse "+endpointName+" resource "+uri+" val "+JSON.stringify(val));
                            } else if((typeof parsedVal == 'object' && JSON.stringify(mbedDevice.resources[uri]) != JSON.stringify(parsedVal)) 
                                || (typeof parsedVal != 'object' && mbedDevice.resources[uri] != parsedVal)) {
                                console.log(CON_PR, "Setting "+endpointName+" "+uri+" value: "+parsedVal);
                                mbedDevice.onResourceChange(uri, parsedVal);
                            }
                        })
                    })
                }
            })
            devices.data.forEach(device => {
                if(self.ignoreDevs.find(dev => {
                        return dev.endpoint == device.endpointName;
                    }) == undefined && self.devices[device.endpointName] == undefined) {
                    console.log(CON_PR, "Found new mbed device: "+device.endpointName);
                    self.addDevice(device).then(devController => {
                        console.log(CON_PR,"\x1b[32m Successfully registered "+device.endpointName+" in devicejs");
                        self.devices[device.endpointName] = devController;
                        device.resources.forEach(resource => {
                            self.edgeMgmt.read_resource(device.endpointName, resource.uri).then(val => {
                                var parsedVal = parse(resource.uri, val.stringValue);
                                if(parsedVal == undefined) {
                                    console.log(CON_PR,"\x1b[31m Failed to parse "+device.endpointName+" resource "+resource.uri+" val "+JSON.stringify(val));
                                } else {
                                    console.log(CON_PR, "Setting "+endpointName+" "+uri+" value: "+parsedVal);
                                    devController.onResourceChange(resource.uri, parse(resource.uri, val.stringValue));
                                }
                            })
                        })
                    },reject => {
                        console.log(CON_PR,"\x1b[31m Failed to add "+device.endpointName+" in devicejs, err - "+reject);
                    })
                }
            })
        })
    }, 60000)
}

MGMTClient.prototype.addDevice = function(mbedDevice) {
    var self = this;
    var id = mbedDevice.endpointName;
    var interfaces = [];
    var initStates = {};

    return new Promise(function(resolve, reject) {
        mbedDevice.resources.forEach(resource => {
            if(map[resource.uri]) {
                interfaces.push(map[resource.uri].interface);
                initStates[map[resource.uri].state] = {'uri' : resource.uri, 'val': resource.val};
            } else {
                console.log("\x1b[33m Not supported resource: "+resource.uri)
            }
        })

        var resourceconfig = {
            "name": "Mbed/Resource-"+id,
            "version": "0.0.1",
            "interfaces": interfaces
        }
        addResourceType(resourceconfig).then(function(res) {
            console.log('\x1b[32 Successfully added resource '+res);
            startDevice(id, initStates, resourceconfig, self.edgeMgmt).then(function(device) {
                ddb.shared.put('WigWagUI:appData.resource.' + id + '.name', id);
                resolve(device);
            }, function(err) {
                reject('Failed to start device controller ' + JSON.stringify(err));
            });
        }, function(err) {
            console.log('\x1b[31m Failed to add resource type ' + JSON.stringify(err));
            reject(err);
        });
    })
}

MGMTClient.prototype.removeDevice = function(id) {
    var self = this;
    if(typeof self.devices[id] === 'undefined') {
        console.log(CON_PR,'\x1b[33m Could not find resource named ' + id);
    } else {
        return self.devices[id].stop().then(function() {
            delete self.devices[endpointName];
            console.log(CON_PR,'\x1b[32m Successfully stopped ' + id);
        }, function(err){
            if(err.status === 404) {
                console.log('\x1b[33m Could not stop resource ' + id + JSON.stringify(err));
                delete self.devices[endpointName];
            } else {
                console.log('\x1b[31m Stop failed with error ' + err + JSON.stringify(err));
            }
        });
    }
}

MGMTClient.prototype.deinit = async function() {
    if(this.pollInterval) {
        clearInterval(this.pollInterval);
    }
    return this.edgeMgmt.deinit();
}

module.exports = MGMTClient;
