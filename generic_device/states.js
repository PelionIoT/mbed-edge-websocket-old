/*
 * Copyright (c) 2018, Arm Limited and affiliates.
 * SPDX-License-Identifier: Apache-2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    },
    pressed: function(devController){
        devController.resources['/3303/0/5700'] = false; //default state value
        return {
            get: function() {
                return Promise.resolve(devController.resources['/3347/0/5850']);
            },
            set: function(value) {
                var self = this;
                if(typeof value !== 'boolean') return Promise.reject('Not a boolean');
                var buf = Buffer.alloc(4);
                buf.writeInt32BE(value?1:0);
                var base64Val = buf.toString('base64');
                devController._edgeMgmt.write_resource(devController._resourceID, '/3347/0/5850', base64Val).then(resp => {
                    devController.resources['/3347/0/5850'] = value;
                    dev$.publishResourceStateChange(devController._resourceID,'pressed',devController.resources['/3347/0/5850'])
                    return Promise.resolve('Pressed set successfully, Response: '+resp);
                }, err => {
                    return Promise.reject(err)
                })
            }
        }
    },
    power: function(devController){
        devController.resources['/3311/0/5850'] = "off"; //default state value
        return {
            get: function() {
                return Promise.resolve(devController.resources['/3311/0/5850']);
            },
            set: function(value) {
                var self = this;
                if(typeof value !== 'string') return Promise.reject('Not a string');
                if(value !== 'on' && value !== 'off') return Promise.reject('Invalid power value');
                var buf = Buffer.alloc(4);
                if(value == 'on') {
                    buf.writeInt32BE(1)
                } else {
                    buf.writeInt32BE(0)
                }
                var base64Val = buf.toString('base64');
                devController._edgeMgmt.write_resource(devController._resourceID, '/3311/0/5850', base64Val).then(resp => {
                    devController.resources['/3311/0/5850'] = value;
                    dev$.publishResourceStateChange(devController._resourceID,'power',devController.resources['/3311/0/5850'])
                    return Promise.resolve('Power set successfully, Response: '+resp);
                }, err => {
                    return Promise.reject(err)
                })
            }
        }
    },
    brightness: function(devController){
        devController.resources['/3311/0/5851'] = 0; //default state value
        return {
            get: function() {
                return Promise.resolve(devController.resources['/3311/0/5851']);
            },
            set: function(value) {
                var self = this;
                if(typeof value !== 'number') return Promise.reject('Not a number');
                if(value < 0 || value >  1) return Promise.reject('Invalid brightness value');
                var buf = Buffer.alloc(4);
                buf.writeInt32BE(parseInt(value*100));
                var base64Val = buf.toString('base64');
                devController._edgeMgmt.write_resource(devController._resourceID, '/3311/0/5851', base64Val).then(resp => {
                    devController.resources['/3311/0/5851'] = value;
                    dev$.publishResourceStateChange(devController._resourceID,'brightness',devController.resources['/3311/0/5851'])
                    return Promise.resolve('Brightness set successfully, Response: '+resp);
                }, err => {
                    return Promise.reject(err)
                })
            }
        }
    },
    hsl: function(devController){
        devController.resources['/3335/0/5706'] = {h:0,s:0,l:0}; //default state value
        return {
            get: function() {
                return Promise.resolve(devController.resources['/3335/0/5706']);
            },
            set: function(value) {
                var self = this;
                if(typeof value !== 'object' || !value.hasOwnProperty('h') || !value.hasOwnProperty('s') || !value.hasOwnProperty('l')) {
                    return Promise.reject('Value should be of type object {h:[0 - 1], s:[0 - 1], l: [0 - 1]');
                }
                if(value.h < 0 || value.h > 1 || value.s < 0 || value.s > 1 || value.l < 0 || value.l > 1) {
                    return Promise.reject('Value of hsl should be within range 0 to 1');
                }
                var valueToWrite = value.h.toString()+','+value.s+','+value.l;
                var buf = Buffer.from(valueToWrite);
                var base64Val = buf.toString('base64');
                devController._edgeMgmt.write_resource(devController._resourceID, '/3335/0/5706', base64Val).then(resp => {
                    devController.resources['/3335/0/5706'] = value;
                    dev$.publishResourceStateChange(devController._resourceID,'hsl',devController.resources['/3335/0/5706'])
                    return Promise.resolve('hsl set successfully, Response: '+resp);
                }, err => {
                    return Promise.reject(err)
                })
            }
        }
    }
};

module.exports = States;
