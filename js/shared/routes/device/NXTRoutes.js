/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const constants = require('../../device/nxt/constants');

exports.NXTRoutes = class {
    constructor(opts) {
        this._nxt                   = opts.nxt;
        this._serialPortConstructor = opts.serialPortConstructor;
    }

    deviceList(req, res) {
        let nxt = this._nxt;
        new this._serialPortConstructor().getPorts((ports) => {
            let list = [];
            ports.forEach((port) => {
                list.push({
                    title:      port.path,
                    connected:  nxt.getConnected(port.path),
                    connecting: nxt.getConnecting(port.path)
                });
            });
            res.send(JSON.stringify({result: true, list: list}));
        });
    }

    connect(req, res) {
        let deviceName = req.body.deviceName;
        let layerIndex = this._nxt.connect(deviceName);
        res.send(JSON.stringify({
            connecting: (layerIndex !== -1),
            deviceName: deviceName,
            layerIndex: layerIndex
        }));
    }

    disconnect(req, res) {
        this._nxt.disconnect(() => {});
        res.send(JSON.stringify({}));
    }

    connecting(req, res) {
        let connected = this._nxt.getConnected();
        let state     = {};
        if (connected) {
            state = this._nxt.getState();
        }
        res.send(JSON.stringify({
            connected: connected,
            state:     state
        }));
    }

    connected(req, res) {
        res.send(JSON.stringify({connected: this._nxt.getConnected()}));
    }

    update(req, res) {
        let result           = {error: false, connected: true};
        let queue            = (typeof req.body.queue === 'string') ? JSON.parse(req.body.queue) : req.body.queue;
        let messagesReceived = {};
        let nxt              = this._nxt;
        nxt.setActiveLayerCount(req.body.activeLayerCount);
        queue.forEach((params) => {
            nxt.module(params.module, params.command, params.data);
            messagesReceived[params.messageId] = true;
        });
        result.state            = nxt.getState();
        result.messagesReceived = messagesReceived;
        res.send(JSON.stringify(result));
    }

    _createTimeoutCallback(res) {
        let done     = false;
        let timeout  = null;
        let callback = function(success) {
                if (done) {
                    return;
                }
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                done = true;
                res.send(JSON.stringify({error: !success}));
            };
        timeout = setTimeout(callback, 500);
        return callback;
    }

    stopAllMotors(req, res) {
        let result     = {success: true};
        let layerCount = req.body.layerCount;
        let brake      = req.body.brake ? 1 : 0;
        let nxt        = this._nxt;
        for (let i = 0; i < layerCount; i++) {
            for (let j = 0; j < 4; j++) {
                nxt.motorStop(i, j, brake);
            }
        }
        res.send(JSON.stringify(result));
    }

    stopPolling(req, res) {
        this._nxt.stopPolling();
        res.send(JSON.stringify({success: true}));
    }

    resumePolling(req, res) {
        this._nxt.resumePolling();
        res.send(JSON.stringify({success: true}));
    }

    setMode(req, res) {
        let body = req.body;
        this._nxt.setMode(body.layer, body.port, body.mode);
        res.send(JSON.stringify({success: true}));
    }

    setType(req, res) {
        let body = req.body;
        this._nxt.setType(body.layer, body.port, body.type, body.mode);
        res.send(JSON.stringify({success: true}));
    }
};
