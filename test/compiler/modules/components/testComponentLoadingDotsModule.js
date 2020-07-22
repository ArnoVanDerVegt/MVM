/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher        = require('../../../../js/frontend/lib/dispatcher').dispatcher;
const testComponentCall = require('../../../utils').testComponentCall;

afterEach(function() {
    dispatcher.reset();
});

const LIB_FILENAME = 'assets/template/lib/components/loadingDots.whl';

describe(
    'Test Loading dots component module',
    function() {
        testComponentCall(it, 'Should set hidden', LIB_FILENAME, 'components.loadingDots.setHidden', 'hidden', 'number');
        testComponentCall(it, 'Should set x',      LIB_FILENAME, 'components.loadingDots.setX',      'x',      'number');
        testComponentCall(it, 'Should set y',      LIB_FILENAME, 'components.loadingDots.setY',      'y',      'number');
    }
);
