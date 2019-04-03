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

const util = require('util');
const JsonRpcWs = require('json-rpc-ws');
const EventEmitter = require('events');

const INFO = '\x1b[34m[EdgeMgmt]\x1b[0m';
const ERROR  = '\x1b[34m[EdgeMgmt]\x1b[31m';
const SUCCESS  = '\x1b[34m[EdgeMgmt]\x1b[32m';
const WARN = '\x1b[34m[EdgeMgmt]\x1b[33m';

// Timeout time in milliseconds
const TIMEOUT = 10000;

function EdgeMgmtClient(socket_path, api_path, name) {
    EventEmitter.call(this);

    this.socket_path = socket_path;
    this.api_path = api_path;
    this.name = name;

    this._interval = 30000;

    this._is_open = false;
    this.client = JsonRpcWs.createClient();
}

EdgeMgmtClient.prototype = Object.create(EventEmitter.prototype);

EdgeMgmtClient.prototype.is_open = function() {
    return this._is_open;
};

EdgeMgmtClient.prototype.connect = async function() {
    let self = this;
    return new Promise((resolve, reject) => {
        let url = util.format('ws+unix://%s:%s',
                              this.socket_path,
                              this.api_path);
        console.log(INFO, 'Connecting to mbed Cloud Edge WebSocket on ' + url);
        self.client.connect(url, function connected(error, reply) {
            if (!error) {
                resolve(reply);
            } else {
                reject(error);
            }
        });
    });
};

EdgeMgmtClient.prototype.getDevices = async function() {
    let self = this;
    return new Promise((resolve, reject) => {
        if(!self.is_open) {
            reject('Socket not connected')
        }
        let timeout = setTimeout(() => {
            reject('Timeout');
        }, TIMEOUT);

        self.client.send('devices', {}, function(error, response) {
            clearTimeout(timeout);
            if (!error) {
                resolve(response);
            } else {
                reject(error);
            }
        });
    });
};

EdgeMgmtClient.prototype.read_resource = async function(endpointName,uri) {
    let self = this;
    return new Promise((resolve, reject) => {
        let timeout = setTimeout(() => {
            reject('Timeout');
        }, TIMEOUT);

        self.client.send('read_resource', {"endpointName": endpointName, "uri": uri}, function(error, response) {
            clearTimeout(timeout);
            if (!error) {
                resolve(response);
            } else {
                reject(error);
            }
        });
    });
};

EdgeMgmtClient.prototype.write_resource = async function(endpointName,uri,base64Value) {
    let self = this;
    return new Promise((resolve, reject) => {
        let timeout = setTimeout(() => {
            reject('Timeout');
        }, TIMEOUT);

        self.client.send('write_resource', {"endpointName": endpointName, "uri": uri, "base64Value": base64Value}, function(error, response) {
            clearTimeout(timeout);
            if (!error) {
                resolve(response);
            } else {
                reject(error.message);
            }
        });
    });
};

EdgeMgmtClient.prototype.init = async function() {
    await this.connect()
    console.log(SUCCESS, 'Connected to mbed Cloud Edge Websocket')
    this._is_open = true;
};

EdgeMgmtClient.prototype.deinit = async function() {
    var self = this;
    if (!self._is_open) return true;

    console.log(INFO, 'Disconnecting from Mbed Edge WebSocket.');
    self.client.disconnect((error, response) => {
        if (!error) {
            self._is_open = false;
            console.log(SUCCESS, 'Mbed Edge Websocket disconnected succesfully.');
        } else {
            console.log(WARN, 'Mbed Edge Websocket disconnecting failed. Error: ', error);
        }
    });
};

module.exports = EdgeMgmtClient;
