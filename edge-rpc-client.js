const util = require('util');
const JsonRpcWs = require('json-rpc-ws');
const EventEmitter = require('events');
//const promisify = require('es6-promisify');

const INFO = '\x1b[34m[ClientService]\x1b[0m';
const ERROR  = '\x1b[34m[ClientService]\x1b[31m';
const SUCCESS  = '\x1b[34m[ClientService]\x1b[32m';
const WARN = '\x1b[34m[ClientService]\x1b[33m';

const OPERATIONS = {
    READ       : 0x01,
    WRITE      : 0x02,
    EXECUTE    : 0x04,
    DELETE     : 0x08
};

// Timeout time in milliseconds
const TIMEOUT = 10000;

function EdgeRpcClient(socket_path, api_path, name) {
    EventEmitter.call(this);

    this.socket_path = socket_path;
    this.api_path = api_path;
    this.name = name;

    this._rpcId = 0;
    this._is_open = false;
    this.client = JsonRpcWs.createClient();
}

EdgeRpcClient.prototype = Object.create(EventEmitter.prototype);

EdgeRpcClient.prototype.is_open = function() {
    return this._is_open;
};

EdgeRpcClient.prototype.connect = async function() {
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

EdgeRpcClient.prototype.registerProtocolTranslator = function() {
    console.log(INFO, 'Registering protocol translator', this.name);
    return new Promise((resolve, reject) => {
        this.client.send('protocol_translator_register', { name: this.name }, function(error, response) {
            if (!error) {
                resolve(response);
            } else {
                reject(error);
            }
        });
    })
}

EdgeRpcClient.prototype.exposeWriteMethod = function() {
    let self = this;
    self.client.expose('write', (params, response) => {
        let valueBuf = new Buffer(params.value, 'base64');
        let route = params.uri.objectId + '/' + params.uri.objectInstanceId + '/' + params.uri.resourceId;
        let deviceId = params.uri.deviceId;

        let operation = '';
        if (params.operation === OPERATIONS.WRITE) {
            operation = 'write';
            this.emit('resource-updated', deviceId, route, valueBuf, response);
        } else if (params.operation === OPERATIONS.EXECUTE) {
            operation = 'execute';
            this.emit('resource-executed', deviceId, route, valueBuf, response);
        } else {
            operation = 'unknown';
            console.log(WARN, 'Unknown "write" operation', params.operation, params);
            response('Unknown operation', null)
        }

        received = {
            raw_params: params,
            deviceId: deviceId,
            route: route,
            operation: operation,
            value: valueBuf
        }
        console.log(INFO, 'Received a write method with data:');
        console.log(received);

        /* Always respond back to Mbed Edge, it is expecting
         * an success response to finish the write/execute action.
         * If an error is returned the value write is discarded
         * also in the Mbed Edge Core.
         */
        //response(/* no error */ null, /* success */ 'ok');
    });
};

EdgeRpcClient.prototype.sendRequest = async function(method, params) {
    let self = this;
    let id = ++this._rpcId;
    let client = self.client;
    
    return new Promise((resolve, reject) => {
        let timeout = setTimeout(() => {
            reject('Timeout');
        }, TIMEOUT);

        try {
            client.send(method, params, function(error, response) {
                clearTimeout(timeout);
                if (!error) {
                    console.log(SUCCESS, method, params.deviceId, 'Response: ', response);
                    resolve(response);
                } else {
                    console.log(ERROR, method, 'failed. Error: ', error);
                    reject(error);
                }
            });
        } catch(ex) {
            reject(ex)
        }
    });
}

EdgeRpcClient.prototype.init = async function() {
    await this.connect()
    console.log(SUCCESS, 'Connected to mbed Cloud Edge Websocket')
    var resp = await this.registerProtocolTranslator()
    console.log(SUCCESS, 'Protocol translator registration successfull. Response: ', resp)
    this.exposeWriteMethod();
    this._is_open = true;
};

EdgeRpcClient.prototype.deinit = async function() {
    if (!this._is_open) return true;

    console.log(INFO, 'Disconnecting from Mbed Edge WebSocket.');
    self.client.disconnect((error, response) => {
        if (!error) {
            this._is_open = false;
            console.log(SUCCESS, 'Mbed Edge Websocket disconnected succesfully.');
        } else {
            console.log(WARN, 'Mbed Edge Websocket disconnecting failed. Error: ', error);
        }
    });
};

module.exports = EdgeRpcClient;
