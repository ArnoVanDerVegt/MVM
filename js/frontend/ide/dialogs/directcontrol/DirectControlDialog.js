/**
 * Wheel, copyright (c) 2019 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher      = require('../../../lib/dispatcher').dispatcher;
const DOMNode         = require('../../../lib/dom').DOMNode;
const Dialog          = require('../../../lib/components/Dialog').Dialog;
const Button          = require('../../../lib/components/input/Button').Button;
const Checkbox        = require('../../../lib/components/input/Checkbox').Checkbox;
const Slider          = require('../../../lib/components/input/Slider').Slider;
const Tabs            = require('../../../lib/components/input/Tabs').Tabs;
const getDataProvider = require('../../../lib/dataprovider/dataProvider').getDataProvider;
const Motors          = require('./components/Motors').Motors;
const Piano           = require('./components/Piano').Piano;

exports.DirectControlDialog = class extends Dialog {
    constructor(opts) {
        super(opts);
        this._device             = opts.device;
        this._layerCount         = opts.layerCount;
        this._portsPerLayer      = opts.portsPerLayer;
        this._withAlias          = opts.withAlias;
        this._hasSound           = opts.hasSound;
        this._hasVolume          = opts.hasVolume;
        this._hasBrake           = opts.hasBrake;
        this._speed              = opts.speed || 50;
        this._layer              = 0;
        this._motorElements      = [];
        this._motorAliasElements = [];
        this
            .initWindow({
                width:          Math.max(64 + (128 + 16) * this._portsPerLayer - 16, 624),
                height:         468,
                className:      'direct-control-dialog',
                title:          opts.title,
                motorValidator: opts.motorValidator
            })
            .initLayerState()
            .initEvents();
    }

    initWindowContent(opts) {
        return [
            {
                ref:       this.setRef('tabs'),
                type:      Tabs,
                ui:        this._ui,
                uiId:      this._uiId,
                tabIndex:  1,
                active:    {title: '1', meta: ''},
                className: 'dialog-l dialog-r dialog-t'
            },
            {
                type:           Motors,
                motorValidator: opts.motorValidator,
                withAlias:      this._withAlias,
                portsPerLayer:  this._portsPerLayer,
                settings:       this._settings,
                speed:          this._speed,
                ui:             this._ui,
                uiId:           this._uiId,
                device:         this._device,
                dialog:         this
            },
            this._hasSound ?
                {
                    type:     Piano,
                    ui:       this._ui,
                    uiId:     this._uiId,
                    device:   this._device,
                    dialog:   this
                } :
                null,
            this._hasBrake ?
                {
                    ref:       this.setRef('brake'),
                    className: 'abs brake',
                    children: [
                        {
                            ref:      this.setRef('brakeCheckbox'),
                            ui:       this._ui,
                            uiId:     this._uiId,
                            type:     Checkbox,
                            tabIndex: 50,
                            checked:  false
                        },
                        {
                            className: 'no-select label',
                            innerHTML: 'Brake motor'
                        }
                    ]
                } :
                null,
            (this._hasSound && this._hasVolume) ?
                {
                    ref:       this.setRef('volume'),
                    className: 'volume hidden',
                    children: [
                        {
                            className: 'no-select label',
                            innerHTML: 'Volume:'
                        },
                        {
                            ref:      this.setRef('volumeSlider'),
                            type:     Slider,
                            ui:       this._ui,
                            uiId:     this._uiId,
                            value:    10,
                            maxValue: 100,
                            tabIndex: 100
                        }
                    ]
                } :
                null,
            this.initButtons([
                {
                    tabIndex: 128,
                    value:     'Close',
                    onClick:   this.hide.bind(this),
                    className: 'right'
                }
            ])
        ];
    }

    initLayerState() {
        this._layerState = [];
        for (let layer = 0; layer < this._layerCount; layer++) {
            let layerOutputs = [];
            for (let output = 0; output < this._portsPerLayer; output++) {
                layerOutputs.push({
                    assigned: null,
                    speed:    50,
                    position: 0
                });
            }
            this._layerState.push(layerOutputs);
        }
        return this;
    }

    initEvents() {
    }

    addMotorElement(element) {
        this._motorElements.push(element);
    }

    addMotorAliasElement(element) {
        this._motorAliasElements.push(element);
    }

    getVolumeSliderElement() {
        return this._refs.volumeSlider;
    }

    getBrake() {
        let refs = this._refs;
        if (!refs.brakeCheckbox) {
            return 0;
        }
        return refs.brakeCheckbox.getChecked() ? 1 : 0;
    }

    getLayer() {
        if (!this._refs.tabs || !this._refs.tabs.getActiveTab()) {
            return 0;
        }
        return parseInt(this._refs.tabs.getActiveTab().title, 10) - 1;
    }

    onOutputAssigned(layer, output, assigned) {
        this._layerState[layer][output].assigned = assigned;
        if (layer === this._layer) {
            this._motorElements[output].setAssigned(assigned);
        }
    }

    onOutputChanged(layer, output, position) {
        this._layerState[layer][output].position = position;
        if (layer === this._layer) {
            this._motorElements[output].setPosition(position);
        }
    }

    onSelectLayer(layer) {
        let motorElements = this._motorElements;
        let layerState    = this._layerState[this._layer];
        let refs          = this._refs;
        for (let i = 0; i < this._portsPerLayer; i++) {
            layerState[i].speed = motorElements[i].getSpeed();
        }
        this._layer           = layer;
        refs.motors.className = 'abs dialog-l dialog-b dialog-r motors';
        if (refs.brake) {
            refs.brake.className = 'abs brake dialog-r';
        }
        if (refs.piano) {
            refs.piano.className = 'piano hidden';
        }
        if (refs.volume) {
            refs.volume.className = 'volume hidden';
        }
        layerState = this._layerState[layer];
        for (let i = 0; i < this._portsPerLayer; i++) {
            let state = layerState[i];
            motorElements[i]
                .clearAssignedTimeout()
                .setAssigned(state.assigned)
                .setPosition(state.position)
                .setSpeed(state.speed);
            if (this._motorAliasElements[i]) {
                this._motorAliasElements[i].update();
            }
        }
    }

    onClickSound() {
        let refs = this._refs;
        refs.motors.className = 'motors hidden';
        refs.piano.className  = 'abs dialog-l dialog-b dialog-r piano';
        if (refs.brake) {
            refs.brake.className = 'brake hidden';
        }
        if (refs.volume) {
            refs.volume.className = 'abs dialog-r volume';
        }
    }

    onShow(opts) {
        this.show();
        let contentElement = this._dialogNode.querySelector('.dialog-content');
        if (opts.withAlias) {
            contentElement.style.height    = '460px';
            contentElement.style.marginTop = '-230px';
        } else {
            contentElement.style.height    = '428px';
            contentElement.style.marginTop = '-215px';
        }
        let tabs = [];
        for (let i = 0; i < opts.deviceCount; i++) {
            (function(index) {
                tabs.push({
                    title: (i + 1).toString(),
                    onClick: (function() {
                        this.onSelectLayer(index);
                    }).bind(this)
                });
            }).call(this, i);
        }
        if (this._hasSound) {
            tabs.push({title: 'Sound', onClick: this.onClickSound.bind(this)});
        }
        this._refs.tabs
            .setTabs(tabs)
            .setActiveTab('1', '')
            .focus();
        this.onSelectLayer(0);
    }
};
