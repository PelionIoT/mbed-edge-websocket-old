//const promisify = require('es6-promisify');
const EventEmitter = require('events');

/**
 * RPCClient for mbed Cloud Edge
 * @param {*} edgeRpc Instance of edge-rpc-client
 */
function RPCClient(edgeRpc, id) {
    EventEmitter.call(this);

    this.edgeRpc = edgeRpc;
    this.id = id;
    this.rpcId = id;
    this.is_open = () => edgeRpc.is_open();
    this.routes = {};

    this._onTerminateQueue = [];

    this.is_registered = false;
}

function convertBuffToType(buff, resource_type) {
    const type = resource_type === 'function' ? 'opaque' : resource_type;
    let value;

    if (type === 'int') {
        // This is a bit of a hack. Mbed Cloud sends 8 byte ints,
        // node only knows how to read 4 byte ints.
        value = buff.readInt32BE(4);
    } else if (type === 'float' || type == 'int') {
        value = buff.readDoubleBE(0);
    } else if (type === 'string') {
        value = buff.toString('utf-8');
    } else {
        value = buff;
    }

    return value;
}

RPCClient.prototype = Object.create(EventEmitter.prototype);

/**
 * Open the RPC Channel
 * @return Returns a promise
 */
RPCClient.prototype.open = function() {
    return Promise.resolve();
};

RPCClient.prototype._setValue = function(route, newValue) {
    if (route.indexOf('/') === 0) route = route.substr(1); // should be fixed higher up but f&@ it

    if (!this.is_open) return Promise.reject('RPC Channel is closed');
    if (!this.routes[route]) return Promise.reject(`Unknown route '${route}'`);

    let r = this.routes[route];
    if (r.type === 'function') return Promise.reject('Route type is function, cannot set value');

    r.value = newValue;

    return this.edgeRpc.sendRequest('write', {
        'deviceId': this.rpcId,
        'objects': this._getObjectModel()
    });
};

RPCClient.prototype._createResource = function(type, route, value, opr, observable, callback) {
    let self = this;

    if (!this.is_open()) return Promise.reject('RPC Channel is closed');
    if (!/^(\d)+\/\d\/(\d+)$/.test(route)) return Promise.reject('route should be of format "3200/0/5501"');
    if (typeof value === 'undefined') return Promise.reject('value is required');

    if (typeof opr === 'function') {
        callback = opr;
        opr = undefined;
    }
    else if (typeof observable === 'function') {
        callback = observable;
        observable = undefined;
    }

    if (typeof opr === 'undefined') opr = RPCClient.GET_PUT_ALLOWED;
    if (typeof observable === 'undefined') observable = true;

    let o = this.routes[route] = {
        type: type,
        value: value,
        opr: opr,
        observable: observable,
        callback: callback,
        setValue: newValue => {
            return this._setValue(route, newValue);
        }
    };

    var onUpdated = (deviceId, r_route, buff, responseCB) => {
        if (deviceId !== this.id) return;
        if (route !== r_route) return;

        let value = convertBuffToType(buff, this.routes[route].type);
        o.value = value;
        this.emit('resource-updated', r_route, value, responseCB);
    };

    this.edgeRpc.on('resource-updated', onUpdated);

    this._onTerminateQueue.push(() => {
        this.edgeRpc.removeListener('resource-updated', onUpdated);
    })

    // actual adding happens in register call
    return Promise.resolve(o);
};

RPCClient.prototype.createResourceString = function(route, value, opr, observable, callback) {
    return this._createResource('string', route, value, opr, observable, callback);
};

RPCClient.prototype.createResourceInt = function(route, value, opr, observable, callback) {
    return this._createResource('int', route, value, opr, observable, callback);
};

RPCClient.prototype.createResourceFloat = function(route, value, opr, observable, callback) {
    return this._createResource('float', route, value, opr, observable, callback);
};

RPCClient.prototype.createFunction = function(route, callback) {
    if (!this.is_open()) return Promise.reject('RPC Channel is closed');
    if (!/^(\d)+\/\d\/(\d+)$/.test(route)) return Promise.reject('route should be of format "3200/0/5501"');

    const type = 'function';

    this.routes[route] = {
        type: type,
        opr: RPCClient.POST_ALLOWED,
        get route() {
            return route;
        },
        callback: callback
    };

    var onExecuted = (deviceId, r_route, buff, responseCB) => {
        if (deviceId !== this.id) return;
        if (route !== r_route) return;

        let value = convertBuffToType(buff, type);

        if (callback) {
            callback(value);
        }

        this.emit('resource-executed', r_route, value, responseCB);
    };

    this.edgeRpc.on('resource-executed', onExecuted);

    this._onTerminateQueue.push(() => {
        this.edgeRpc.removeListener('resource-executed', onExecuted);
    });

    // actual adding happens in register call
    return Promise.resolve();
};

RPCClient.prototype._getObjectModel = function() {
    let objs = [];

    for (let route of Object.keys(this.routes)) {
        // mbed Cloud Edge only supports numbers...
        let [objId, objInstId, resId] = route.split('/').map(Number);

        let obj = objs.find(o => o['objectId'] === objId);
        if (!obj) {
            obj = { 'objectId': objId, 'objectInstances': [] };
            objs.push(obj);
        }

        let objInst = obj['objectInstances'].find(o => o['objectInstanceId'] === objInstId);
        if (!objInst) {
            objInst = { 'objectInstanceId': objInstId, 'resources': [] };
            obj['objectInstances'].push(objInst);
        }

        const type = this.routes[route].type === 'function' ? 'opaque' : this.routes[route].type;
        const valueToWrite = this.routes[route].value || '';
        let value;

        if (type === 'int') {
            value = Buffer.alloc(4);
            value.writeInt32BE(valueToWrite);
        } else if (type === 'float') {
            value = Buffer.alloc(4);
            value.writeFloatBE(valueToWrite);
        } else {
            // Should cover strings and binary data
            value = Buffer.from(valueToWrite);
        }

        objInst.resources.push({
            'resourceId': resId,
            'operations': this.routes[route].opr,
            'type': type,
            'value': value.toString('base64')
        });
    }

    return objs;
}

RPCClient.prototype.register = async function() {
    await this.edgeRpc.sendRequest('device_register', {
        'lifetime': 86400,
        'queuemode': 'Q',
        'deviceId': this.rpcId,
        'objects': this._getObjectModel()
    });

    this.is_registered = true;

    // FIXME: should return the real endpoint... this is a workaround
    return this.rpcId;
};

RPCClient.prototype.unregister = async function() {
    await this.edgeRpc.sendRequest('device_unregister', {
        'deviceId': this.rpcId,
    });

    this.is_registered = false;
};

RPCClient.prototype.terminate = function() {
    clearInterval(this._getQueueIv);

    this.removeAllListeners();

    for (let fn of this._onTerminateQueue) {
        fn();
    }

    return Promise.resolve();
}

RPCClient.NOT_ALLOWED                 = 0x00;
RPCClient.GET_ALLOWED                 = 0x01;
RPCClient.PUT_ALLOWED                 = 0x02;
RPCClient.GET_PUT_ALLOWED             = 0x03;
RPCClient.POST_ALLOWED                = 0x04;
RPCClient.GET_POST_ALLOWED            = 0x05;
RPCClient.PUT_POST_ALLOWED            = 0x06;
RPCClient.GET_PUT_POST_ALLOWED        = 0x07;
RPCClient.DELETE_ALLOWED              = 0x08;
RPCClient.GET_DELETE_ALLOWED          = 0x09;
RPCClient.PUT_DELETE_ALLOWED          = 0x0A;
RPCClient.GET_PUT_DELETE_ALLOWED      = 0x0B;
RPCClient.POST_DELETE_ALLOWED         = 0x0C;
RPCClient.GET_POST_DELETE_ALLOWED     = 0x0D;
RPCClient.PUT_POST_DELETE_ALLOWED     = 0x0E;
RPCClient.GET_PUT_POST_DELETE_ALLOWED = 0x0F;

module.exports = RPCClient;
