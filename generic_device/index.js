var Dev = require("./controller");

var map = {
    '/3303/0/5700': {
        interface: 'Facades/HasTemperature',
        state: 'temperature'
    },
    '/3303/0/5701': {
        interface: 'Facades/TemperatureDisplayMode',
        state: 'temperatureDisplayMode'
    },
    '/3303/1/5700': {
        interface: 'Facades/ThermostatReturnTemperature',
        state: 'returnTemperature'
    },
    '/3303/2/5700': {
        interface: 'Facades/ThermostatSupplyTemperature',
        state: 'supplyTemperature'
    },
    '/3303/3/5700': {
        interface: 'Facades/hasWhiteTemp',
        state: 'K'
    },
    // '/3308/0/5900': {
    //     interface: 'Facades/AutoTemperatureLevel',
    //     state: 'autoTemperatureLevel'
    // },
    '/3308/1/5900': {
        interface: 'Facades/CoolTemperatureLevel',
        state: 'coolTemperatureLevel'
    },
    '/3308/2/5900': {
        interface: 'Facades/HeatTemperatureLevel',
        state: 'heatTemperatureLevel'
    },
    // '/3308/3/5900': {
    //     interface: 'Facades/OccupiedAutoTemperatureLevel',
    //     state: 'occupiedAutoTemperatureLevel'
    // },
    '/3308/4/5900': {
        interface: 'Facades/OccupiedCoolTemperatureLevel',
        state: 'occupiedCoolTemperatureLevel'
    },
    '/3308/5/5900': {
        interface: 'Facades/OccupiedHeatTemperatureLevel',
        state: 'occupiedHeatTemperatureLevel'
    },
    // '/3308/6/5900': {
    //     interface: 'Facades/UnocupiedAutoTemperatureLevel',
    //     state: 'unoccupiedAutoTemperatureLevel'
    // },
    '/3308/7/5900': {
        interface: 'Facades/UnoccupiedCoolTemperatureLevel',
        state: 'unoccupiedCoolTemperatureLevel'
    },
    '/3308/8/5900': {
        interface: 'Facades/UnoccupiedHeatTemperatureLevel',
        state: 'unoccupiedHeatTemperatureLevel'
    },
    '/3308/9/5900': {
        interface: 'Facades/ThermostatDeadband',
        state: 'deadband'
    },
    '/3341/0/5527': {
        interface: 'Facades/ThermostatMode',
        state: 'thermostatMode'
    },
    '/3341/1/5527': {
        interface: 'Facades/OccupancyMode',
        state: 'occupancyMode'
    },
    '/3341/2/5527': {
        interface: 'Facades/ThermostatFanMode',
        state: 'thermostatFanMode'
    },
    '/3341/3/5527': {
        interface: 'Facades/ThermostatOccupiedFanMode',
        state: 'thermostatOccupiedFanMode'
    },
    '/3341/4/5527': {
        interface: 'Facades/ThermostatUnoccupiedFanMode',
        state: 'thermostatUnoccupiedFanMode'
    },
    '/3341/5/5527': {
        interface: 'Facades/ThermostatModeStatus',
        state: 'thermostatModeStatus'
    },
    '/3341/6/5527': {
        interface: 'Facades/ThermostatFanStatus',
        state: 'thermostatFanStatus'
    },
    '/3200/0/5500': {
        interface: 'Facades/ThermostatGStatus',
        state: 'gStatus'
    },
    '/3200/1/5500': {
        interface: 'Facades/ThermostatW1Status',
        state: 'w1Status'
    },
    '/3200/2/5500': {
        interface: 'Facades/ThermostatW2Status',
        state: 'w2Status'
    },
    '/3200/3/5500': {
        interface: 'Facades/ThermostatY1Status',
        state: 'y1Status'
    },
    '/3200/4/5500': {
        interface: 'Facades/ThermostatY2Status',
        state: 'y2Status'
    },
    '/3301/0/5603': {
        interface: 'Facades/HasLuminance',
        state: 'luminance'
    },
    '/3347/0/5850': {
        interface: 'Facades/Button',
        state: 'pressed'
    },
    '/3311/0/5850': {
        interface: 'Facades/Switchable',
        state: 'power'
    },
    '/3311/0/5851': {
        interface: 'Facades/Dimmable',
        state: 'brightness'
    },
    '/3335/0/5706': {
        interface: 'Facades/Colorable',
        state: 'hsl'
    },
    '/3302/0/5500': {
        interface: 'Facades/HasMotion',
        state: 'motion'
    },
    '/3306/0/5850': {
        interface: 'Facades/HasTamper',
        state: 'tamper'
    },
    '/3306/1/5850': {
        interface: 'Facades/Triggerable',
        state: 'triggered'
    },
    '/3306/2/5850': {
        interface: 'Facades/HumidityTrigger',
        state: 'humidityTrigger'
    },
    '/3306/3/5850': {
        interface: 'Facades/TemperatureTrigger',
        state: 'temperatureTrigger'
    },
    '/3338/0/5850': {
        interface: 'Facades/HasVibration',
        state: 'vibration'
    },
    '/11001/0/5527': {
        interface: 'Facades/HasPassCode',
        state: 'passCode'
    },
    '/3332/0/5702': {
        interface: 'Facades/HasPTZ',
        state: 'ptz'
    },
    '/3305/0/5800': {
        interface: 'Facades/HasBattery',
        state: 'battery'
    },
    '/3345/0/5500': {
        interface: 'Facades/HasContact',
        state: 'contact'
    },
    '/3331/0/5805': {
        interface: 'Facades/HasEnergyConsumption',
        state: 'energy'
    },
    '/3337/0/5536': {
        interface: 'Facades/Regulator',
        state: 'regulator'
    },
    '/3342/0/5500': {
        interface: 'Facades/Flipflop',
        state: 'flipflop'
    },
    '/8/0/5500': {
        interface: 'Facades/HasLock',
        state: 'lock'
    },
    '/3304/0/5700': {
        interface: 'Facades/Humidity',
        state: 'humidity'
    },
    '/3340/0/5700': {
        interface: 'Facades/HasSmokeAlarm',
        state: 'smoke'
    },
    '/10272/0/5603': {
        interface: 'Facades/HasWaterLeakDetector',
        state: 'waterleak'
    },
    '/3300/0/5700': {
        interface: 'Facades/Ultraviolet',
        state: 'ultraviolet'
    },
    '/3201/0/5550': {
        interface: 'Facades/Override',
        state: 'override'
    }
}

var devices = {};

function addResourceType(config) {
    return new Promise(function(resolve, reject) {
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
                initStates[map[resource.uri].state] = resource;
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
                resolve(id);
            }, function(err) {
                reject('Failed to start device controller ' + JSON.stringify(err));
            });
        }, function(err) {
            console.log('\x1b[31m Failed to add resource type ' + JSON.stringify(err));
            reject(err);
        });
    })
}

module.exports = {
    create: CreateDevice
};
