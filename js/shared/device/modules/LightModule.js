/**
 * Wheel, copyright (c) 2017 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const lightModuleConstants = require('../../vm/modules/lightModuleConstants');
const DeviceModule         = require('./DeviceModule').DeviceModule;

exports.LightModule = class extends DeviceModule {
    run(commandId, data) {
        switch (commandId) {
            case lightModuleConstants.LIGHT_UPDATE:
                this._device.setLed(data.layer, data.mode);
                break;
        }
    }
};
