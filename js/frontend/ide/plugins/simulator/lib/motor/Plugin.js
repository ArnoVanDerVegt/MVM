/**
 * Wheel, copyright (c) 2019 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher      = require('../../../../../lib/dispatcher').dispatcher;
const DOMNode         = require('../../../../../lib/dom').DOMNode;
const SimulatorPlugin = require('../../lib/SimulatorPlugin').SimulatorPlugin;

exports.Plugin = class extends SimulatorPlugin {
    constructor(opts) {
        super(opts);
        this._device              = opts.ev3;
        this._baseClassName       = 'motors';
        this._motors              = [];
        this._interval            = null;
        this._disconnectedTimeout = null;
        this._motorConstructor    = opts.motorConstructor;
        this.initDOM(opts.parentNode);
        opts.settings.on('Settings.Plugin', this, this.onPluginSettings);
    }

    initDOM(parentNode) {
        let Motor    = this._motorConstructor;
        let addMotor = this.addMotor.bind(this);
        let children = [];
        for (let i = 0; i < 16; i++) {
            children.push({
                simulator: this._simulator,
                type:      Motor,
                device:    this._device,
                layer:     ~~(i / 4),
                id:        i & 3,
                title:     String.fromCharCode(65 + (i & 3)),
                addMotor:  addMotor,
                hidden:    (i >= 4)
            });
        }
        this.create(
            parentNode,
            {
                ref:       this.setRef('motors'),
                className: this.getClassName(),
                children:  [this.getMainElement() || null].concat(children)
            }
        );
        this._interval = setInterval(this.onInterval.bind(this), 10);
    }

    onDeviceConnected() {
        if (this._disconnectedTimeout) {
            clearTimeout(this._disconnectedTimeout);
            this._disconnectedTimeout = null;
        }
    }

    onDeviceDisconnected() {
    }

    onPluginSettings() {
        this._refs.motors.className = this.getClassName();
    }

    onInterval() {
        let motors = this._motors;
        for (let i = 0; i < motors.length; i++) {
            motors[i].update();
        }
    }

    showLayer(layer) {
        let motors = this._motors;
        for (let i = 0; i < motors.length; i++) {
            motors[i].setHidden(layer !== (i >> 2));
        }
    }

    reset() {
        let motors = this._motors;
        for (let i = 0; i < motors.length; i++) {
            motors[i].reset();
        }
    }

    addMotor(motor) {
        this._motors.push(motor);
    }

    callOnMotor(layer, id, func, param) {
        let motor = this.getMotor(layer, id);
        if (motor && motor[func]) {
            return motor[func](param);
        }
        return false;
    }

    getMainElement() {
        return null;
    }

    getMotor(layer, id) {
        return this._motors[layer * 4 + id] || null;
    }

    getType(opts) {
        return this.callOnMotor(opts.layer, opts.id, 'getType');
    }

    setType(opts) {
        this.callOnMotor(opts.layer, opts.id, 'setType', opts.type);
    }

    setSpeed(opts) {
        this.callOnMotor(opts.layer, opts.id, 'setSpeed', opts.speed);
    }

    setPosition(opts) {
        this.callOnMotor(opts.layer, opts.id, 'setPosition', opts.position || 0);
    }

    moveTo(opts) {
        this.callOnMotor(opts.layer, opts.id, 'moveTo', opts.target);
    }

    on(opts) {
        this.callOnMotor(opts.layer, opts.id, 'on');
    }

    timeOn(opts) {
        this.callOnMotor(opts.layer, opts.id, 'timeOn', opts.time);
    }

    stop(opts) {
        this.callOnMotor(opts.layer, opts.id, 'stop');
    }

    read(opts) {
        return this.callOnMotor(opts.layer, opts.id, 'read');
    }

    ready(opts) {
        return this.callOnMotor(opts.layer, opts.id, 'ready');
    }
};
