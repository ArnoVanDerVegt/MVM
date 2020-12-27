/**
 * Wheel, copyright (c) 2019 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const spikeModuleConstants = require('../../../shared/vm/modules/spikeModuleConstants');
const dispatcher           = require('../../lib/dispatcher').dispatcher;
const getDataProvider      = require('../../lib/dataprovider/dataProvider').getDataProvider;
const BasicDeviceState     = require('../BasicDeviceState').BasicDeviceState;
const LayerState           = require('./LayerState').LayerState;

exports.SpikeState = class extends BasicDeviceState {
    constructor(opts) {
        opts.layerCount       = spikeModuleConstants.LAYER_COUNT;
        opts.LayerState       = LayerState;
        opts.signalPrefix     = 'Spike';
        opts.updateURL        = 'spike/update';
        opts.setModeURL       = 'spike/set-mode';
        opts.stopAllMotorsURL = 'spike/stop-all-motors';
        super(opts);
        this._battery = null;
    }

    getPortsPerLayer() {
        return 6;
    }

    onConnectToDevice(deviceName) {
        if (this.getConnectionCount() >= spikeModuleConstants.POWERED_UP_LAYER_COUNT) {
            return;
        }
        for (let i = 0; i < this._layerState.length; i++) {
            let layerState = this._layerState[i];
            if (layerState.getDeviceName() === deviceName) {
                return;
            }
        }
        this.emit('Spike.Connecting', deviceName);
        this._dataProvider.getData(
            'post',
            'spike/connect',
            {deviceName: deviceName},
            (data) => {
                if (!this._updateTimeout) {
                    this._updateTimeout = setTimeout(this.update.bind(this), 20);
                }
            }
        );
    }

    stopPolling(callback) {
        if (this._connecting || !this._connected) {
            return;
        }
        this._dataProvider.getData(
            'post',
            'spike/stop-polling',
            {},
            this._createResponseHandler(callback)
        );
    }

    resumePolling(callback) {
        if (this._connecting || !this._connected) {
            return;
        }
        this._dataProvider.getData(
            'post',
            'spike/resume-polling',
            {},
            this._createResponseHandler(callback)
        );
    }
};
