/**
 * Wheel, copyright (c) 2019 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const motorModuleConstants = require('../../../../../shared/vm/modules/motorModuleConstants');
const DOMNode              = require('../../../../lib/dom').DOMNode;
const Button               = require('../../../../lib/components/Button').Button;
const Slider               = require('../../../../lib/components/Slider').Slider;

exports.Motor = class extends DOMNode {
    constructor(opts) {
        super(opts);
        this._ui              = opts.ui;
        this._uiId            = opts.uiId;
        this._device          = opts.device;
        this._dialog          = opts.dialog;
        this._speed           = 50;
        this._motorValidator  = opts.motorValidator;
        this._motorId         = opts.motorId;
        this._tabIndex        = opts.tabIndex;
        this._className       = opts.className || '';
        this._assignedTimeout = null;
        this.initDOM(opts.parentNode);
        opts.id(this);
    }

    getUI() {
        return this._ui;
    }

    getUIId() {
        return this._uiId;
    }

    initDOM(parentNode) {
        this.create(
            parentNode,
            {
                id:        this.setElement.bind(this),
                className: 'motor disabled ' + this._className,
                children: [
                    {
                        type:        Button,
                        uiOwner:     this,
                        tabIndex:    this._tabIndex,
                        className:   'up',
                        value:       '↑',
                        onKeyDown:   this.onUpKeyPressed.bind(this),
                        onMouseDown: this.onUpMousePressed.bind(this),
                        onKeyUp:     this.onUpReleased.bind(this),
                        onMouseUp:   this.onUpReleased.bind(this)
                    },
                    {
                        ref:         this.setRef('speed'),
                        className:   'speed',
                        innerHTML:   '50'
                    },
                    {
                        ref:         this.setRef('speedSlider'),
                        type:        Slider,
                        ui:          this._ui,
                        uiId:        this._uiId,
                        tabIndex:    this._tabIndex + 1,
                        maxValue:    100,
                        value:       50,
                        onChange:    this.onChange.bind(this)
                    },
                    {
                        ref:         this.setRef('position'),
                        className:   'position',
                        innerHTML:   '0'
                    },
                    {
                        type:        Button,
                        uiOwner:     this,
                        tabIndex:    this._tabIndex + 2,
                        className:   'down',
                        value:       '↓',
                        onKeyDown:   this.onDownKeyPressed.bind(this),
                        onMouseDown: this.onDownMousePressed.bind(this),
                        onKeyUp:     this.onDownReleased.bind(this),
                        onMouseUp:   this.onDownReleased.bind(this),
                        onMouseOut:  this.onDownReleased.bind(this)
                    }
                ]
            }
        );
    }

    clearAssignedTimeout() {
        if (this._assignedTimeout) {
            clearTimeout(this._assignedTimeout);
            this._assignedTimeout = null;
        }
        return this;
    }

    setElement(element) {
        this._element = element;
    }

    setAssigned(assigned) {
        let element         = this._element;
        let className       = this._className;
        let updateClassName = () => {
                this.clearAssignedTimeout();
                let disabled = !this._motorValidator.valid(assigned);
                element.className = 'motor ' + (disabled ? 'disabled' : '') + ' ' + className;
            };
        this.clearAssignedTimeout();
        if (this._motorValidator.waiting(assigned)) {
            this._assignedTimeout = setTimeout(updateClassName, 3000);
        } else {
            updateClassName();
        }
        return this;
    }

    setPosition(position) {
        this._refs.position.innerHTML = position;
        return this;
    }

    setSpeed(speed) {
        let refs = this._refs;
        this._speed          = speed;
        refs.speed.innerHTML = speed;
        refs.speedSlider.setValue(speed);
        return this;
    }

    getMotorData(speed) {
        return {layer: this._dialog.getLayer(), id: this._motorId, speed: speed, brake: this._dialog.getBrake()};
    }

    onUpKeyPressed(event) {
        if (!this._assignedTimeout && ([13, 32].indexOf(event.keyCode) !== -1)) {
            let motor = {layer: this._dialog.getLayer(), id: this._motorId, speed: this._speed, brake: this._dialog.getBrake()};
            this._device.module(motorModuleConstants.MODULE_MOTOR, motorModuleConstants.MOTOR_ON, this.getMotorData(this._speed));
        }
    }

    onUpMousePressed(event) {
        if (!this._assignedTimeout) {
            this._device.module(motorModuleConstants.MODULE_MOTOR, motorModuleConstants.MOTOR_ON, this.getMotorData(this._speed));
        }
    }

    onUpReleased() {
        this._device.module(motorModuleConstants.MODULE_MOTOR, motorModuleConstants.MOTOR_STOP, this.getMotorData(this._speed));
    }

    onDownKeyPressed(event) {
        if (!this._assignedTimeout && ([13, 32].indexOf(event.keyCode) !== -1)) {
            this._device.module(motorModuleConstants.MODULE_MOTOR, motorModuleConstants.MOTOR_ON, this.getMotorData(-this._speed));
        }
    }

    onDownMousePressed(event) {
        if (!this._assignedTimeout) {
            this._device.module(motorModuleConstants.MODULE_MOTOR, motorModuleConstants.MOTOR_ON, this.getMotorData(-this._speed));
        }
    }

    onDownReleased() {
        this._device.module(motorModuleConstants.MODULE_MOTOR, motorModuleConstants.MOTOR_STOP, this.getMotorData(this._speed));
    }

    onChange(value) {
        value = Math.min(value, 100);
        this._speed                = value;
        this._refs.speed.innerHTML = value;
    }
};
