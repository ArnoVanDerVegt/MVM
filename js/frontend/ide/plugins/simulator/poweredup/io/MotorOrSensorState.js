/**
 * Wheel, copyright (c) 2019 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const MotorState  = require('./../../lib/motor/io/MotorState').MotorState;

const MODE_OFF    = 0;
const MODE_ON     = 1;
const MODE_TARGET = 2;

exports.MotorOrSensorState = class extends MotorState {
    constructor(opts) {
        super(opts);
        this._deviceInfo = opts.deviceInfo;
    }

    setType(type) {
        if ((type in this._deviceInfo) || ([0, 1].indexOf(type) !== -1)) {
            this._type = type;
        } else {
            this._type = -1;
        }
        this._rpm = 272;
        return this._type;
    }
};