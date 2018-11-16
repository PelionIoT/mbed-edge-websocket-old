var States = {
    temperature: function(devController){
        devController.resources['/3303/0/5700'] = 1.0; //default state value
        return {
            get: function() {
                return Promise.resolve(devController.resources['/3303/0/5700']);
            },
            set: function(value) {
                var self = this;
                return new Promise((resolve, reject) => {
                    if(typeof value != 'number') return reject('Not a number');
                    var buf = Buffer.alloc(8);
                    buf.writeDoubleBE(value);
                    var base64Val = buf.toString('base64');
                    devController._edgeMgmt.write_resource(devController._resourceID, '/3303/0/5700', base64Val).then(resp => {
                        devController.resources['/3303/0/5700'] = value;
                        dev$.publishResourceStateChange(devController._resourceID,'temperature',devController.resources['/3303/0/5700'])
                        return resolve('Temperature set successfully, Response: '+resp);
                    }, err => {
                        return reject(err)
                    })
                })
            }
        }
    },
    temperatureDisplayMode: function(devController){
        devController.resources['/3303/0/5701'] = "fahrenheit"; //default state value
        return {
            get: function() {
                return Promise.resolve(devController.resources['/3303/0/5701']);
            },
            set: function(value) {
                var self = this;
                return new Promise((resolve, reject) => {
                    if(typeof value !== 'string') return reject('Not a string');
                    var buf = Buffer.from(value);
                    var base64Val = buf.toString('base64');
                    devController._edgeMgmt.write_resource(devController._resourceID, '/3303/0/5701', base64Val).then(resp => {
                        devController.resources['/3303/0/5701'] = value;
                        dev$.publishResourceStateChange(devController._resourceID,'temperatureDisplayMode',devController.resources['/3303/0/5701'])
                        return resolve('TemperatureDisplayMode set successfully, Response: '+resp);
                    }, err => {
                        return reject(err)
                    })
                })
            }
        }
    }
};

module.exports = States;
