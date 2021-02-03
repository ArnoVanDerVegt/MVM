/**
 * Wheel, copyright (c) 2021 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher   = require('../../../js/frontend/lib/dispatcher').dispatcher;
const DefinesState = require('../../../js/frontend/ide/settings/DefinesState').DefinesState;
const MockSettings = require('../../mock/MockSettings').MockSettings;
const assert       = require('assert');

afterEach(() => {
    dispatcher.reset();
});

describe(
    'Test defines',
    () => {
        it(
            'Should create settings',
            () => {
                let definesState = new DefinesState({settings: new MockSettings()});
                assert.deepEqual(definesState.toJSON(), []);
            }
        );
        it(
            'Should add define',
            () => {
                let definesState = new DefinesState({settings: new MockSettings()});
                dispatcher.dispatch('Settings.Define.Add', {key: 'key', value: 'value', active: true});
                assert.deepEqual(
                    definesState.getList(),
                    [{key: 'key', value: 'value', type: 'string', active: true}]
                );
            }
        );
        it(
            'Should add defines',
            () => {
                let definesState = new DefinesState({settings: new MockSettings()});
                dispatcher.dispatch('Settings.Define.Add', {key: 'b', value: 'valueB', active: true});
                dispatcher.dispatch('Settings.Define.Add', {key: 'a', value: 10,       active: false});
                assert.deepEqual(
                    definesState.getList(),
                    [
                        {key: 'a', value: 10,       type: 'number', active: false},
                        {key: 'b', value: 'valueB', type: 'string', active: true}
                    ]
                );
            }
        );
        it(
            'Should get JSON',
            () => {
                let definesState = new DefinesState({settings: new MockSettings()});
                dispatcher.dispatch('Settings.Define.Add', {key: 'b', value: 'valueB', active: true});
                dispatcher.dispatch('Settings.Define.Add', {key: 'a', value: 10,       active: false});
                assert.deepEqual(
                    definesState.toJSON(),
                    [
                        {key: 'a', value: 10,       active: false},
                        {key: 'b', value: 'valueB', active: true}
                    ]
                );
            }
        );
        it(
            'Should update define',
            () => {
                let definesState = new DefinesState({settings: new MockSettings()});
                dispatcher.dispatch('Settings.Define.Add', {key: 'a', value: 'valueA', active: false});
                dispatcher.dispatch('Settings.Define.UpdateByIndex', {key: 'b', value: 'valueB', active: true}, 0);
                assert.deepEqual(
                    definesState.getList(),
                    [{key: 'b', value: 'valueB', type: 'string', active: true}]
                );
            }
        );
        it(
            'Should delete define',
            () => {
                let definesState = new DefinesState({settings: new MockSettings()});
                dispatcher.dispatch('Settings.Define.Add', {key: 'a', value: 'valueA', active: true});
                dispatcher.dispatch('Settings.Define.Add', {key: 'b', value: 'valueB', active: false});
                dispatcher.dispatch('Settings.Define.Add', {key: 'c', value: 'valueC', active: false});
                dispatcher.dispatch('Settings.Define.DeleteByIndex', 1);
                assert.deepEqual(
                    definesState.getList(),
                    [
                        {key: 'a', value: 'valueA', type: 'string', active: true},
                        {key: 'c', value: 'valueC', type: 'string', active: false}
                    ]
                );
            }
        );
    }
);
