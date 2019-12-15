/**
 * Wheel, copyright (c) 2017 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const lightModuleConstants = require('../../vm/modules/lightModuleConstants');
const BrickModule          = require('./BrickModule').BrickModule;

exports.LightModule = class extends BrickModule {
    run(commandId, data) {
        switch (commandId) {
            case lightModuleConstants.LIGHT_UPDATE:
                this._brick.setLed(data.color);
                break;
        }
    }
};
