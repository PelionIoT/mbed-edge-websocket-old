var States = {
    battery: function(initVal,resourceID,edgeMgmt){
        return {
            _battery: initVal,
            get: function() {
                return Promise.resolve(this._battery);
            },
            set: function(value) {
                return Promise.reject('Read only facade');
            }
        }
    },
    pressed: function(initVal,resourceID,edgeMgmt){
        return {
            _buttonState: initVal,
            get: function() {
                return Promise.resolve(this._buttonState);
            },
            set: function(value) {
                this._buttonState = !!value;
                dev$.publishResourceStateChange(resourceID,'pressed',this._buttonState)
                return Promise.resolve();
            }
        }
    },
    contact: function(initVal,resourceID,edgeMgmt){
        return {
            _contact: initVal,
            get: function() {
                return Promise.resolve(this._contact);
            },
            set: function(value) {
                return Promise.reject('Read only facade');
            }
        }
    },
    tamper: function(initVal,resourceID,edgeMgmt){
        return {
            _tamper: initVal,
            get: function() {
                return Promise.resolve(this._tamper);
            },
            set: function(value) {
                return Promise.reject('Read only facade');
            }
        }
    },
    lock: function(initVal,resourceID,edgeMgmt){
        return {
            _lock: initVal,
            get: function() {
                return Promise.resolve(this._lock);
            },
            set: function(value) {
                this._lock = value;
                dev$.publishResourceStateChange(resourceID,'lock',this._lock)
                return Promise.resolve();
            }
        }
    },
    flipflop: function(initVal,resourceID,edgeMgmt){
        return {
            _flipflop: initVal,
            get: function() {
                return Promise.resolve(this._flipflop);
            },
            set: function(value) {
                this._flipflop = value;
                dev$.publishResourceStateChange(resourceID,'flipflop',this._flipflop)
                return Promise.resolve();
            }
        }
    },
    humidity: function(initVal,resourceID,edgeMgmt){
        return {
            _humidityValue: initVal,
            get: function() {
                return Promise.resolve(this._humidityValue);
            },
            set: function(value) {
                return Promise.reject('Read only facade');
            }
        }
    },
    power: function(initVal,resourceID,edgeMgmt){
        return {
            _power: initVal,
            get: function() {
                return Promise.resolve(this._power);
            },
            set: function(value) {
                this._power = value;
                dev$.publishResourceStateChange(resourceID,'power',this._power)
                return Promise.resolve();
            }
        }
    },
    brightness: function(initVal,resourceID,edgeMgmt){
        return {
            _brightness: initVal,
            get: function() {
                return Promise.resolve(this._brightness);
            },
            set: function(value) {
                if(value < 0 || value > 100) {
                    return Promise.reject('Value should be within range 0 to 1');
                }

                if(value < 0) {
                    value = 0;
                } else if(value > 100) {
                    value = 1;
                } else {
                    value = value/100;
                }
                
                this._brightness = value;
                dev$.publishResourceStateChange(resourceID,'brightness',this._brightness)
                return Promise.resolve();
            }
        }
    },
    hsl: function(initVal,resourceID,edgeMgmt){
        return {
            _hsl: initVal,
            get: function() {
                return Promise.resolve(this._hsl);
            },
            set: function(value) {
                if(typeof value !== 'object' || !value.hasOwnProperty('h') || !value.hasOwnProperty('s') || !value.hasOwnProperty('l')) {
                    return Promise.reject('Value should be of type object {h:[0 - 1], s:[0 - 1], l: [0 - 1]');
                }
                if(value.h < 0 || value.h > 1 || value.s < 0 || value.s > 1 || value.l < 0 || value.l > 1) {
                    return Promise.reject('Value of hsl should be within range 0 to 1');
                }

                this._hsl = value;
                dev$.publishResourceStateChange(resourceID,'hsl',this._hsl)
                return Promise.resolve();
            }
        }
    },
    K: function(initVal,resourceID,edgeMgmt){
        return {
            _K: initVal,
            get: function() {
                return Promise.resolve(this._K);
            },
            set: function(value) {
                if(value < 2000 || value > 8000) {
                    return Promise.reject('Value should be within range 2000 to 8000');
                }

                if(value < 2000) {
                    value = 2000;
                } 

                if(value > 8000) {
                    value = 8000;
                }

                this._K = value;
                dev$.publishResourceStateChange(resourceID,'K',this._K)
                return Promise.resolve();
            }
        }
    },
    lastColorCall: function(initVal,resourceID,edgeMgmt){
        return {
            _lastColorCall: initVal,
            get: function() {
                return Promise.resolve(this._lastColorCall);
            },
            set: function(value) {
                return Promise.reject('Read only facade');
            }
        }
    },
    luminance: function(initVal,resourceID,edgeMgmt){
        return {
            _luminance: initVal,
            get: function() {
                return Promise.resolve(this._luminance);
            },
            set: function(value) {
                return Promise.reject('Read only facade');
            }
        }
    },
    motion: function(initVal,resourceID,edgeMgmt){
        return {
            _motion: initVal,
            get: function() {
                return Promise.resolve(this._motion);
            },
            set: function(value) {
                return Promise.reject('Read only facade');
            }
        }
    },
    ultraviolet: function(initVal,resourceID,edgeMgmt){
        return {
            _ultraviolet: initVal,
            get: function() {
                return Promise.resolve(this._ultraviolet);
            },
            set: function(value) {
                return Promise.reject('Read only facade');
            }
        }
    },
    override: function(initVal,resourceID,edgeMgmt){
        return {
            _overrideState: initVal,
            get: function() {
                return Promise.resolve(this._overrideState);
            },
            set: function(value) {
                this._overrideState = !!value;
                dev$.publishResourceStateChange(resourceID,'override',this._overrideState)
                return Promise.resolve();
            }
        }
    },
    regulator: function(initVal,resourceID,edgeMgmt){
        return {
            _regulator: initVal,
            get: function() {
                return Promise.resolve(this._regulator);
            },
            set: function(value) {
                this._regulator = value;
                dev$.publishResourceStateChange(resourceID,'regulator',this._regulator)
                return Promise.resolve();
            }
        }
    },
    smoke: function(initVal,resourceID,edgeMgmt){
        return {
            _smoke: initVal,
            get: function() {
                return Promise.resolve(this._smoke);
            },
            set: function(value) {
                return Promise.reject('Read only facade');
            }
        }
    },
    temperature: function(initVal,resourceID,edgeMgmt){
        return {
            _temperature: initVal,
            get: function() {
                return Promise.resolve(this._temperature);
            },
            set: function(value) {
                this._temperature = value;
                dev$.publishResourceStateChange(resourceID,'temperature',this._temperature)
                return Promise.resolve();
            }
        }
    },
    thermostatMode: function(initVal,resourceID,edgeMgmt){
        return {
            _thermostatMode: initVal,
            get: function() {
                return Promise.resolve(this._thermostatMode);
            },
            set: function(value) {
                if(typeof value !== 'string') {
                    return Promise.reject('Value should be of type string');
                }
                if(!/^(heat|cool|off|auto)$/.test(value)) {
                    return Promise.reject('Value should be one of the following- heat, cool, off, auto');
                }
                this._thermostatMode = value;
                dev$.publishResourceStateChange(resourceID,'thermostatMode',this._thermostatMode)
                return Promise.resolve('Thermostat mode set successfully');
            }
        }
    },
    occupiedCoolTemperatureLevel: function(initVal,resourceID,edgeMgmt){
        return {
            _occupiedCoolTemperatureLevel: initVal,
            get: function() {
                return Promise.resolve(this._occupiedCoolTemperatureLevel);
            },
            set: function(value) {
                if(typeof value !== 'number') {
                    return Promise.reject('Value should be of type number');
                }
                this._occupiedCoolTemperatureLevel = value;
                dev$.publishResourceStateChange(resourceID,'occupiedCoolTemperatureLevel',this._occupiedCoolTemperatureLevel)
                return Promise.resolve('OccupiedCoolTemperatureLevel set successfully');
            }
        }
    },
    occupiedHeatTemperatureLevel: function(initVal,resourceID,edgeMgmt){
        return {
            _occupiedHeatTemperatureLevel: initVal,
            get: function() {
                return Promise.resolve(this._occupiedHeatTemperatureLevel);
            },
            set: function(value) {
                if(typeof value !== 'number') {
                    return Promise.reject('Value should be of type number');
                }
                this._occupiedHeatTemperatureLevel = value;
                dev$.publishResourceStateChange(resourceID,'occupiedHeatTemperatureLevel',this._occupiedHeatTemperatureLevel)
                return Promise.resolve('OccupiedHeatTemperatureLevel set successfully');
            }
        }
    },
    unoccupiedCoolTemperatureLevel: function(initVal,resourceID,edgeMgmt){
        return {
            _unoccupiedCoolTemperatureLevel: initVal,
            get: function() {
                return Promise.resolve(this._unoccupiedCoolTemperatureLevel);
            },
            set: function(value) {
                if(typeof value !== 'number') {
                    return Promise.reject('Value should be of type number');
                }
                this._unoccupiedCoolTemperatureLevel = value;
                dev$.publishResourceStateChange(resourceID,'unoccupiedCoolTemperatureLevel',this._unoccupiedCoolTemperatureLevel)
                return Promise.resolve('UnoccupiedCoolTemperatureLevel set successfully');
            }
        }
    },
    unoccupiedHeatTemperatureLevel: function(initVal,resourceID,edgeMgmt){
        return {
            _unoccupiedHeatTemperatureLevel: initVal,
            get: function() {
                return Promise.resolve(this._unoccupiedHeatTemperatureLevel);
            },
            set: function(value) {
                if(typeof value !== 'number') {
                    return Promise.reject('Value should be of type number');
                }
                this._unoccupiedHeatTemperatureLevel = value;
                dev$.publishResourceStateChange(resourceID,'unoccupiedHeatTemperatureLevel',this._unoccupiedHeatTemperatureLevel)
                return Promise.resolve('UnoccupiedHeatTemperatureLevel set successfully');
            }
        }
    },
    deadband: function(initVal,resourceID,edgeMgmt){
        return {
            _deadband: initVal,
            get: function() {
                return Promise.resolve(this._deadband);
            },
            set: function(value) {
                if(typeof value !== 'number') {
                    return Promise.reject('Value should be of type number');
                }
                this._deadband = value;
                dev$.publishResourceStateChange(resourceID,'deadband',this._deadband)
                return Promise.resolve('Deadband set successfully');
            }
        }
    },
    occupancyMode: function(initVal,resourceID,edgeMgmt){
        return {
            _occupancyMode: initVal,
            get: function() {
                return Promise.resolve(this._occupancyMode);
            },
            set: function(value) {
                if(typeof value !== 'string') {
                    return Promise.reject('Value should be of type string');
                }
                if(!/^(occupied|unoccupied)$/.test(value)) {
                    return Promise.reject('Value should be one of the following- occupied, unoccupied');
                }
                this._occupancyMode = value;
                dev$.publishResourceStateChange(resourceID,'occupancyMode',this._occupancyMode)
                return Promise.resolve('OccupancyMode set successfully');
            }
        }
    },
    keypadLockLevel: function(initVal,resourceID,edgeMgmt){
        return {
            _keypadLockLevel: initVal,
            get: function() {
                return Promise.resolve(this._keypadLockLevel);
            },
            set: function(value) {
                this._keypadLockLevel = value;
                dev$.publishResourceStateChange(resourceID,'keypadLockLevel',this._keypadLockLevel)
                return Promise.resolve();
            }
        }
    },
    temperatureDisplayMode: function(initVal,resourceID,edgeMgmt){
        return {
            _temperatureDisplayMode: initVal,
            get: function() {
                return Promise.resolve(this._temperatureDisplayMode);
            },
            set: function(value) {
                this._temperatureDisplayMode = value;
                dev$.publishResourceStateChange(resourceID,'temperatureDisplayMode',this._temperatureDisplayMode)
                return Promise.resolve();
            }
        }
    },
    w1Status: function(initVal,resourceID,edgeMgmt){
        return {
            _w1Status: initVal,
            get: function() {
                return Promise.resolve(this._w1Status);
            },
            set: function(value) {
                this._w1Status = value;
                dev$.publishResourceStateChange(resourceID,'w1Status',this._w1Status)
                return Promise.resolve();
            }
        }
    },
    w2Status: function(initVal,resourceID,edgeMgmt){
        return {
            _w2Status: initVal,
            get: function() {
                return Promise.resolve(this._w2Status);
            },
            set: function(value) {
                this._w2Status = value;
                dev$.publishResourceStateChange(resourceID,'w2Status',this._w2Status)
                return Promise.resolve();
            }
        }
    },
    y1Status: function(initVal,resourceID,edgeMgmt){
        return {
            _y1Status: initVal,
            get: function() {
                return Promise.resolve(this._y1Status);
            },
            set: function(value) {
                this._y1Status = value;
                dev$.publishResourceStateChange(resourceID,'y1Status',this._y1Status)
                return Promise.resolve();
            }
        }
    },
    y2Status: function(initVal,resourceID,edgeMgmt){
        return {
            _y2Status: initVal,
            get: function() {
                return Promise.resolve(this._y2Status);
            },
            set: function(value) {
                this._y2Status = value;
                dev$.publishResourceStateChange(resourceID,'y2Status',this._y2Status)
                return Promise.resolve();
            }
        }
    },
    gStatus: function(initVal,resourceID,edgeMgmt){
        return {
            _gStatus: initVal,
            get: function() {
                return Promise.resolve(this._gStatus);
            },
            set: function(value) {
                this._gStatus = value;
                dev$.publishResourceStateChange(resourceID,'gStatus',this._gStatus)
                return Promise.resolve();
            }
        }
    },
    supplyTemperature: function(initVal,resourceID,edgeMgmt){
        return {
            _supplyTemp: initVal,
            get: function() {
                return Promise.resolve(this._supplyTemp);
            },
            set: function(value) {
                this._supplyTemp = value;
                dev$.publishResourceStateChange(resourceID,'supplyTemperature',this._supplyTemp)
                return Promise.resolve();
            }
        }
    },
    returnTemperature: function(initVal,resourceID,edgeMgmt){
        return {
            _returnTemp: initVal,
            get: function() {
                return Promise.resolve(this._returnTemp);
            },
            set: function(value) {
                this._returnTemp = value;
                dev$.publishResourceStateChange(resourceID,'returnTemperature',this._returnTemp)
                return Promise.resolve();
            }
        }
    },
    thermostatFanMode: function(initVal,resourceID,edgeMgmt){
        return {
            _thermostatFanMode: initVal,
            get: function() {
                return Promise.resolve(this._thermostatFanMode);
            },
            set: function(value) {
                if(typeof value !== 'string') {
                    return Promise.reject('Value should be of type string');
                }
                if(!/^(off|auto|smart)$/.test(value)) {
                    return Promise.reject('Value should be one of the following- off, auto, smart');
                }
                this._thermostatFanMode = value;
                dev$.publishResourceStateChange(resourceID,'thermostatFanMode',this._thermostatFanMode)
                return Promise.resolve('Thermostat fan mode set successfully');
            }
        }
    },
    thermostatModeStatus: function(initVal,resourceID,edgeMgmt){
        return {
            _thermostatModeStatus: initVal,
            get: function() {
                return Promise.resolve(this._thermostatModeStatus);
            },
            set: function(value) {
                if(typeof value !== 'string') {
                    return Promise.reject('Value should be of type string');
                }
                if(!/^(OFF|STAGE1_HEATING_ON|STAGE2_HEATING_ON|STAGE1_COOLING_ON|STAGE2_COOLING_ON)$/.test(value)) {
                    return Promise.reject('Value should be one of the following- OFF|STAGE1_HEATING_ON|STAGE2_HEATING_ON|STAGE1_COOLING_ON|STAGE2_COOLING_ON');
                }
                this._thermostatModeStatus = value;
                dev$.publishResourceStateChange(resourceID,'thermostatModeStatus',this._thermostatModeStatus)
                return Promise.resolve('Thermostat mode status set successfully!');
            }
        }
    },
    thermostatFanStatus: function(initVal,resourceID,edgeMgmt){
        return {
            _thermostatFanStatus: initVal,
            get: function() {
                return Promise.resolve(this._thermostatFanStatus);
            },
            set: function(value) {
                if(typeof value !== 'string') {
                    return Promise.reject('Value should be of type string');
                }
                if(!/^(on|off)$/.test(value)) {
                    return Promise.reject('Value should be one of the following- on, off');
                }
                this._thermostatFanStatus = value;
                dev$.publishResourceStateChange(resourceID,'thermostatFanStatus',this._thermostatFanStatus)
                return Promise.resolve('Thermostat fan status set successfully!');
            }
        }
    }
};

module.exports = States;