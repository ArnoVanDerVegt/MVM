/**
 * Wheel, copyright (c) 2019 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
let dispatcher      = require('../../lib/dispatcher').dispatcher;
let BasicLayerState = require('../BasicLayerState').BasicLayerState;

exports.LayerState = class extends BasicLayerState {
    constructor(opts) {
        opts.signalPrefix = 'PoweredUp.Layer';
        super(opts);
        this._connected = false;
        this._uuid      = null;
        this._uuidTime  = Date.now();
        this._type      = null;
        this._button    = 0;
        this._tilt      = {x: 0, y: 0, z: 0};
        this._accel     = {x: 0, y: 0, z: 0};
    }

    getUUID() {
        return this._uuid || '';
    }

    getTilt() {
        return this._tilt;
    }

    getAccel() {
        return this._accel;
    }

    getConnected() {
        return this._connected;
    }

    getType() {
        return this._type;
    }

    getPortValues(property) {
        let result = [];
        for (let i = 0; i < 4; i++) {
            result.push(this._ports[i][property]);
        }
    }

    getSensors() {
        return this.getPortValues('value');
    }

    getMotors() {
        return this.getPortValues('value');
    }

    getPortAssignments() {
        return this.getPortValues('assigned');
    }

    checkTiltChange(tilt) {
        let changed = false;
        for (let t in tilt) {
            if (this._tilt[t] !== tilt[t]) {
                this._tilt[t] = tilt[t];
                changed = true;
            }
        }
        if (changed) {
            this._device.emit(this._signalPrefix + this._layer + 'Tilt', tilt);
        }
    }

    checkAccelChange(accel) {
        let changed = false;
        for (let a in accel) {
            if (this._accel[a] !== accel[a]) {
                this._accel[a] = accel[a];
                changed = true;
            }
        }
        if (changed) {
            this._device.emit(this._signalPrefix + this._layer + 'Accel', accel);
        }
    }

    setStatus(status) {
        for (let i = 0; i < 4; i++) {
            this._ports[i].ready = status.ready[i];
        }
        let time = Date.now();
        if ((status.uuid && (status.uuid !== this._uuid)) || (time > this._uuidTime + 500)) {
            this._uuid     = status.uuid || '';
            this._uuidTime = time;
            this._device.emit(this._signalPrefix + this._layer + 'Uuid', this._uuid);
        }
        if (status.type && (status.type !== this._type)) {
            this._type = status.type;
            this._device.emit(this._signalPrefix + this._layer + 'Type', this._type);
        }
        if (('button' in status) && (status.button !== this._button)) {
            this._button = status.button;
            this._device.emit(this._signalPrefix + this._layer + 'Button', this._button);
        }
        this.checkSensorChange(status.ports);
        this.checkTiltChange(status.tilt);
        this.checkAccelChange(status.accel);
        this._connected = status.connected;
    }
};
