var Dev = require("./controller");

var map = {
    '/3303/0/5700': {
        interface: 'Facades/HasTemperature',
        state: 'temperature'
    },
    '/3303/0/5701': {
        interface: 'Facades/TemperatureDisplayMode',
        state: 'temperatureDisplayMode'
    }
}

var devices = {};

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

function start(id, initStates, resourceConfig, edgeMgmtClient) {
    var self = this;
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
                    console.log('\x1b[33m THIS SHOULD NOT HAVE HAPPENED. FOUND INTERFACE WHICH IS NOT SUPPORTED BY DEVICEJS');
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
                    console.log("\x1b[33m "+id+" device controller already exists");
                    resolve(device);
                } else reject(err);
            });
        });
    });
}

function CreateDevice(mbedDevice,edgeMgmtClient) {
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
            start(id, initStates, resourceconfig, edgeMgmtClient).then(function(device) {
                devices[id] = device;
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

function RemoveDevice(id) {
    return new Promise(function(resolve, reject) {
        if(typeof devices[id] === 'undefined') {
            return reject('Did not find resource named ' + id);
        }
        return devices[id].stop().then(function() {
            delete devices[id];
            resolve('Successfully stopped ' + id);
        }, function(err){
            if(err.status === 404) {
                console.log('\x1b[33m Could not stop resource ' + id + JSON.stringify(err));
                resolve();
            } else {
                console.log('\x1b[31m Stop failed with error ' + err + JSON.stringify(err));
                reject(err);
            }
        });
    })
}

module.exports = {
    create: CreateDevice,
    remove: RemoveDevice
};
