var States = require("./states")

function setStates(supportedStates,Controller) {
    supportedStates.forEach(state => {
        Controller.state[state] = States[state](Controller);
    })
}

var Controller = {
    start: function(options) {
        var self = this;
        this._resourceID = options.id;
        this._supportedStates = options.supportedStates;
        this._edgeMgmt = options.edgeMgmtClient;
        this.resources = {};
        this.resourceMap = {};
        var resources={}
        var resourceMap={}
        options.supportedStates.forEach(function(state) {
            resources[options.initStates[state].uri] = options.initStates[state].val;
            resourceMap[options.initStates[state].uri] = state;
        })
        this.resources = resources;
        this.resourceMap = resourceMap;
        //"reachable" event
        self.emit('reachable');

        setStates(options.supportedStates, this);
        self.onResourceChange = function(uri, val) {
            self.resources[uri] = val;
            dev$.publishResourceStateChange(self._resourceID, self.resourceMap[uri],val);
        }
    },
    stop: function() {
    },
    state: {
    },
    getState: function() {
        var s = {};
        var self = this;
        var p = [];

        var rejected = false;

        return new Promise(function(resolve, reject) {

            self._supportedStates.forEach(function(type) {
                p.push(
                    new Promise(function(resolve, reject) {
                        self.state[type].get().then(function(value) {
                            if(value !== null) {
                                s[type] = value;
                            }
                            resolve();
                        }).catch(function(e) {
                            s[type] = e;
                            rejected = true;
                            resolve();
                        });
                    })
                );
            });

            Promise.all(p).then(function() {
                if(!rejected) {
                    return resolve(s);
                } else {
                    return reject(JSON.stringify(s));
                }
            });
        });
    },
    setState: function(value) {
        var self = this;
        var s = {};
        var p = [];

        var rejected = false;

        return new Promise(function(resolve, reject) {
            Object.keys(value).forEach(function(key) {
                p.push(
                    new Promise(function(resolve, reject) {
                        if(self._supportedStates.indexOf(key) > -1) {
                            self.state[key].set(value[key]).then(function(result) {
                                s[key] = (result === undefined) ? 'Updated successfully to value ' + value[key] : result;
                                resolve();
                            }).catch(function(e) {
                                s[key] = e;
                                rejected = true;
                                resolve();
                            });
                        } else {
                            rejected = true;
                            s[key] = 'This interface is not supported';
                            resolve();
                        }
                    })
                );
            });

            Promise.all(p).then(function(result) {
                if(!rejected) {
                    resolve(s);
                } else {
                    reject(JSON.stringify(s));
                }
            }, function(e) {
                reject(e);
            });
        });
    },
    commands: {
        emit: function() {
            var self = this;
            return this.getState().then(function(states) {
                return self.setState(states);
            });
        },
        reachable: function(value) {
            if(value) {
                this.emit('reachable');
            } else {
                this.emit('unreachable');
            }
        }
    }
};

module.exports = Controller;