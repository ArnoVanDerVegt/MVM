/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const sensorModuleConstants = require('../../../../../../shared/vm/modules/sensorModuleConstants');
const Checkbox              = require('../../../../../lib/components/Checkbox').Checkbox;
const getImage              = require('../../../../data/images').getImage;
const Sensor                = require('./Sensor').Sensor;

exports.TouchSensor = class extends Sensor {
    initDOM(parentNode) {
        this.initMainDom(
            parentNode,
            'images/ev3/touch.png',
            false, // With mode
            [
                {
                    ref:       this.setRef('touchValue'),
                    className: 'value',
                    children: [
                        {
                            ref:      this.setRef('touchValueInput'),
                            type:     Checkbox,
                            ui:       this._ui,
                            tabIndex: this._tabIndex,
                            onChange: this.onChangeValue.bind(this)
                        }
                    ]
                }
            ]
        );
    }

    setValue(value) {
        this._value = value;
        refs.touchValueInput.setChecked(value);
    }

    onResetTimeout() {
        this._refs.touchValueInput.setChecked(false);
        this._timeoutReset = null;
        this._value        = 0;
    }
};
