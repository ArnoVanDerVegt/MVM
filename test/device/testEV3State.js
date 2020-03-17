/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const EV3State   = require('../../js/frontend/vm/ev3/EV3State').EV3State;
const dispatcher = require('../../js/frontend/lib/dispatcher').dispatcher;
const assert     = require('assert');

afterEach(function() {
    dispatcher.reset();
});

const getMockLayers = function() {
        return [
            [{}, {}, {}, {}, {}, {}, {}, {}],
            [{}, {}, {}, {}, {}, {}, {}, {}],
            [{}, {}, {}, {}, {}, {}, {}, {}],
            [{}, {}, {}, {}, {}, {}, {}, {}]
        ];
    };

class MockDataProvider {
    constructor(opts) {
        this._applyConnecting = opts.applyConnecting;
        this._connected       = false;
    }

    setConnected(connected) {
        this._connected = connected;
    }

    getData(method, route, params, callback) {
        switch (method + ':' + route) {
            case 'post:ev3/connect':
                callback(JSON.stringify({
                    deviceName: params.deviceName,
                    connecting: true
                }));
                break;
            case 'post:ev3/connecting':
                if (!this._applyConnecting) {
                    return;
                }
                callback(JSON.stringify({
                    connected: this._connected,
                    state: {
                        layers: getMockLayers()
                    }
                }));
                break;
            case 'post:ev3/update':
                callback(JSON.stringify({
                    connected: this._connected,
                    state: {
                        layers: getMockLayers()
                    }
                }));
                break;
        }
    }
}

describe(
    'Test EV3 state',
    function() {
        it(
            'Should create EV3State',
            function() {
                let ev3State = new EV3State({dataProvider: new MockDataProvider({}), noTimeout: true});
                assert.equal(ev3State.getConnected(), false);
            }
        );
        it(
            'Should connect',
            function() {
                let ev3State       = new EV3State({dataProvider: new MockDataProvider({}), noTimeout: true});
                let testDeviceName = null;
                ev3State.on(
                    'EV3.Connecting',
                    this,
                    function(deviceName) {
                        testDeviceName = deviceName;
                    }
                );
                dispatcher.dispatch('EV3.ConnectToDevice', 'TestDevice');
                assert.equal(testDeviceName, 'TestDevice');
                assert.equal(ev3State.getConnecting(), true);
            }
        );
        it(
            'Should poll connecting',
            function() {
                let mockDataProvider = new MockDataProvider({applyConnecting: true});
                let ev3State         = new EV3State({dataProvider: mockDataProvider, noTimeout: true});
                dispatcher.dispatch('EV3.ConnectToDevice', 'TestDevice');
                assert.equal(ev3State.getConnecting(), true);
                assert.equal(ev3State.getConnected(), false);
                // The dataProvider should return connected with the following update call...
                mockDataProvider.setConnected(true);
                // The EV3.ConnectToDevice dispatcher signal sets the _connecting value, force it to false
                // to allow the ev3State.connecting() call to be executed...
                ev3State._connecting = false;
                ev3State.connecting();
                ev3State.update();
                assert.equal(ev3State.getConnected(), true);
            }
        );
    }
);
