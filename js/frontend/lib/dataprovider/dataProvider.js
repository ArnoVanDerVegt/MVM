/**
 * Wheel, copyright (c) 2019 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const HttpDataProvider = require('./HttpDataProvider').HttpDataProvider;
const httpDataProvider = new HttpDataProvider();

let electronDataProvider = null;

exports.getDataProvider = function() {
    if ('electron' in window) {
        if (!electronDataProvider) {
            const ElectronDataProvider = require('./ElectronDataProvider').ElectronDataProvider;
            electronDataProvider = new ElectronDataProvider();
        }
        return electronDataProvider;
    }
    return httpDataProvider;
};
