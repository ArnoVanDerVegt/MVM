/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher        = require('../../../../js/frontend/lib/dispatcher').dispatcher;
const testComponentCall = require('../../../utils').testComponentCall;

afterEach(function() {
    dispatcher.reset();
});

const LIB_FILENAME = 'assets/template/lib/components/poweredUpDevice.whl';

describe(
    'Test PUDevice component module',
    function() {
        testComponentCall(it, {message: 'Should set type',       moduleFile: LIB_FILENAME, procName: 'components.puDevice.setType',      property: 'type',      type: 'number'});
        testComponentCall(it, {message: 'Should set port',       moduleFile: LIB_FILENAME, procName: 'components.puDevice.setPort',      property: 'port',      type: 'number'});
        testComponentCall(it, {message: 'Should set speed',      moduleFile: LIB_FILENAME, procName: 'components.puDevice.setSpeed',     property: 'speed',     type: 'number'});
        testComponentCall(it, {message: 'Should set value',      moduleFile: LIB_FILENAME, procName: 'components.puDevice.setValue',     property: 'value',     type: 'number'});
        testComponentCall(it, {message: 'Should set ready',      moduleFile: LIB_FILENAME, procName: 'components.puDevice.setReady',     property: 'ready',     type: 'number'});
        testComponentCall(it, {message: 'Should set color mode', moduleFile: LIB_FILENAME, procName: 'components.puDevice.setColorMode', property: 'colorMode', type: 'number'});
    }
);