/**
 * Wheel, copyright (c) 2019 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher = require('../../lib/dispatcher').dispatcher;
const Dialog     = require('../../lib/components/Dialog').Dialog;
const Slider     = require('../../lib/components/Slider').Slider;

exports.VolumeDialog = class extends Dialog {
    constructor(opts) {
        super(opts);
        this._dispatchApply = null;
        this.initWindow('volume-dialog', 'Change volume', this.initWindowContent(opts));
        dispatcher.on('Dialog.Volume.Show', this, this.onShow);
    }

    initWindowContent(opts) {
        return [
            {
                className: 'volume-row',
                children: [
                    {
                        ref:       this.setRef('label'),
                        type:      'span',
                        className: 'label',
                        innerHTML: 'Volume'
                    },
                    {
                        id:        this.setVolumeInputElement.bind(this),
                        type:      'input',
                        maxLength: 3,
                        inputType: 'text'
                    },
                    {
                        type:      Slider,
                        ref:       this.setRef('slider'),
                        ui:        this._ui,
                        uiId:      this._uiId,
                        onChange:  this.onChangeSlider.bind(this),
                        maxValue:  100
                    }
                ]
            },
            {
                className: 'buttons',
                children: [
                    this.addButton({
                        ref:      this.setRef('buttonApply'),
                        value:    'Change volume',
                        tabIndex: 128,
                        onClick:  this.onApply.bind(this)
                    }),
                    this.addButton({
                        value:    'Cancel',
                        tabIndex: 129,
                        color:    'dark-green',
                        onClick:  this.hide.bind(this)
                    })
                ]
            }
        ];
    }

    setVolumeInputElement(element) {
        this._volumeInputElement = element;
        element.addEventListener('keyup', this.onVolumeKeyUp.bind(this));
    }

    validate() {
        let value = parseInt(this._volumeInputElement.value, 10);
        let valid = !isNaN(value) && (value >= 0) && (value <= 100);
        this._volumeInputElement.className = valid ? '' : 'invalid';
        if (valid) {
            this._refs.slider.setValue(value);
        }
        return valid;
    }

    onVolumeKeyUp() {
        this.validate();
    }

    onChangeSlider(value) {
        this._volumeInputElement.value = value;
    }

    onApply() {
        if (this.validate()) {
            this._dispatchApply && dispatcher.dispatch(this._dispatchApply, parseInt(this._volumeInputElement.value, 10) / 100);
            this.hide();
        }
    }

    onShow(opts) {
        let refs = this._refs;
        opts                           = opts || {};
        this._dispatchApply            = opts.dispatchApply;
        refs.label.innerHTML           = opts.label || 'Label';
        refs.title.innerHTML           = opts.title || 'Title';
        this._volumeInputElement.value = opts.value || 0;
        refs.slider.setValue(opts.value);
        this.show();
    }
};
