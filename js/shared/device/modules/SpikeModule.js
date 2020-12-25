/**
 * Wheel, copyright (c) 2017 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const spikeModuleConstants = require('../../vm/modules/spikeModuleConstants');
const DeviceModule         = require('./DeviceModule').DeviceModule;

exports.SpikeModule = class extends DeviceModule {
    run(commandId, data) {
        switch (commandId) {
            case spikeModuleConstants.SPIKE_LAYER_CLEAR_LEDS:
                this._device.matrixClearLeds(data.layer);
                break;
            case spikeModuleConstants.SPIKE_LAYER_SET_LED:
                this._device.matrixSetLed(data.layer, data.x, data.y, data.brightness);
                break;
            case spikeModuleConstants.SPIKE_LAYER_SET_TEXT:
                this._device.matrixSetText(data.layer, data.text);
                break;
        }
    }
};
