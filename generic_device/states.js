var States = {
    temperature: function(devController){
        return {
            get: function() {
                return Promise.resolve(devController.resources['/3303/0/5700']);
            },
            set: function(value) {
                var self = this;
                if(typeof value != 'number') return Promise.reject('Not a number');
                var buf = Buffer.alloc(8);
                buf.writeDoubleBE(value);
                var base64Val = buf.toString('base64');
                devController._edgeMgmt.write_resource(devController._resourceID, '/3303/0/5700', base64Val).then(resp => {
                    devController.resources['/3303/0/5700'] = value;
                    dev$.publishResourceStateChange(devController._resourceID,'temperature',devController.resources['/3303/0/5700'])
                    return Promise.resolve('Temperature set successfully, Response: '+resp);
                }, err => {
                    return Promise.reject(err)
                })
            }
        }
    },
    temperatureDisplayMode: function(devController){
        return {
            get: function() {
                return Promise.resolve(devController.resources['/3303/0/5701']);
            },
            set: function(value) {
                var self = this;
                if(typeof value !== 'string') return Promise.reject('Not a string');
                var buf = Buffer.from(value);
                var base64Val = buf.toString('base64');
                devController._edgeMgmt.write_resource(devController._resourceID, '/3303/0/5701', base64Val).then(resp => {
                    devController.resources['/3303/0/5701'] = value;
                    dev$.publishResourceStateChange(devController._resourceID,'temperatureDisplayMode',devController.resources['/3303/0/5701'])
                    return Promise.resolve('TemperatureDisplayMode set successfully, Response: '+resp);
                }, err => {
                    return Promise.reject(err)
                })
            }
        }
    }
};

module.exports = States;
