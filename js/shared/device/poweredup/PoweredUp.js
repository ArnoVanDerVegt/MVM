/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const sensorModuleConstants    = require('../../vm/modules/sensorModuleConstants');
const poweredUpModuleConstants = require('../../vm/modules/poweredUpModuleConstants');
const BasicDevice              = require('../BasicDevice').BasicDevice;

const PORT_TO_INDEX            = {A: 0, B: 1, C: 2, D: 3};

const REMOTE_BUTTON_MINUS      = 255;
const REMOTE_BUTTON_RED        = 127;
const REMOTE_BUTTON_PLUS       =   1;

const DIRECTION_REVERSE        =  -1;
const DIRECTION_NONE           =   0;
const DIRECTION_FORWARD        =   1;

const FLOAT                    =   0;
const HOLD                     = 126;
const BRAKE                    = 127;

let poweredUpConstants = null; // Set with dependency injection...
let PoweredUP          = null; // Set with dependency injection...

/**
 * Dependency injection for nodejs or browser library...
**/
exports.setLibrary = function(pupConstants, pup) {
    poweredUpConstants = pupConstants;
    PoweredUP          = pup;
};

exports.PoweredUp = class extends BasicDevice {
    constructor(opts) {
        super(opts);
        this._gettingHubs   = false;
        this._layerCount    = 0;
        this._scanning      = false;
        this._connectedHubs = [];
        this._hubs          = [];
        this._hubsByUuid    = {};
        this._changed       = 0;
        this._layers        = [this.initLayer(), this.initLayer(), this.initLayer(), this.initLayer()];
        this._poweredUP     = new PoweredUP.PoweredUP();
        this._poweredUP.on('discover', this._addHub.bind(this));
        setInterval(this.motorMonitor.bind(this), 5);
    }

    initLayer() {
        let result = {
                connected:       false,
                buttonLeft:      0,
                buttonRight:     0,
                button:          0,
                hubLed:          null,
                hubButtons:      [],
                tilt:            {x: 0, y: 0, z: 0},
                accel:           {x: 0, y: 0, z: 0},
                ports:           []
            };
        for (let i = 0; i < 4; i++) {
            result.ports.push({
                value:            0,
                reset:            0,
                assigned:         0,
                mode:             0,
                device:           null,
                moving:           false,
                currentDirection: DIRECTION_NONE,
                degrees:          0,
                startDegrees:     null,
                endDegrees:       null,
                threshold:        45,
                on:               false
            });
        }
        return result;
    }

    scan() {
        this._poweredUP.scan(); // Start scanning for hubs
    }

    _addHub(hub) {
        if ([
                poweredUpConstants.HubType.HUB,
                poweredUpConstants.HubType.MOVE_HUB,
                poweredUpConstants.HubType.REMOTE_CONTROL,
                poweredUpConstants.HubType.TECHNIC_MEDIUM_HUB
            ].indexOf(hub.type) === -1) {
            return;
        }
        let uuid = hub.uuid;
        if (uuid in this._hubsByUuid) {
            return;
        }
        this._hubsByUuid[uuid] = {
            index:      this._hubs.length,
            layer:      null,
            uuid:       uuid,
            type:       hub.type,
            title:      hub.name,
            subTitle:   uuid,
            connecting: false,
            connected:  false
        };
        this._hubs.push(hub);
        this._changed++;
    }

    _attachEvents(index, h, hub) {
        let layer   = this._layers[index];
        let devices = h.getDevices();
        layer.connected = true;
        devices.forEach(this.onAttachDevice.bind(this, layer));
        h.on('disconnect', this.onDisconnect.bind(this, hub));
        h.on('tilt',       this.onTilt.bind(this, layer));
        h.on('accel',      this.onAccel.bind(this, layer));
        h.on('button',     this.onButton.bind(this, layer));
        h.on('rotate',     this.onRotate.bind(this, layer));
        h.on('attach',     this.onAttachDevice.bind(this, layer));
        h.on('detach',     this.onDetachDevice.bind(this, layer));
    }

    onAttachDevice(layer, device) {
        if (device.portName in PORT_TO_INDEX) {
            let port = layer.ports[PORT_TO_INDEX[device.portName]];
            port.assigned = device.type;
            port.device   = device;
            switch (device.type) {
                case poweredUpConstants.DeviceType.COLOR_DISTANCE_SENSOR:
                    device.on('colorAndDistance', this.onColorAndDistance.bind(this, layer, port));
                    break;
            }
        } else {
            switch (device.type) {
                case poweredUpConstants.DeviceType.HUB_LED:
                    layer.hubLed = device;
                    break;
                case poweredUpConstants.DeviceType.REMOTE_CONTROL_BUTTON:
                    let index = layer.hubButtons.length;
                    layer.hubButtons.push(device);
                    device.on('remoteButton', this.onRemoteButton.bind(this, index, layer));
                    break;
                case poweredUpConstants.DeviceType.MOVE_HUB_TILT_SENSOR:
                    device.on('tilt', this.onMoveHubTilt.bind(this, layer));
                    break;
            }
        }
    }

    onDetachDevice(layer, device) {
        if (device.portName in PORT_TO_INDEX) {
            let port = layer.ports[PORT_TO_INDEX[device.portName]];
            port.assigned = 0;
            port.device   = null;
        }
    }

    onDisconnect(hub) {
        hub.connected = false;
    }

    onColorAndDistance(layer, port, event) {
        switch (port.mode) {
            case poweredUpModuleConstants.POWERED_UP_SENSOR_MODE_DISTANCE:
                port.value = event.distance;
                break;
            case poweredUpModuleConstants.POWERED_UP_SENSOR_MODE_COLOR:
                switch (event.color) {
                    case  0: port.value = sensorModuleConstants.COLOR_BLACK;  break;
                    case  3: port.value = sensorModuleConstants.COLOR_BLUE;   break;
                    case  5: port.value = sensorModuleConstants.COLOR_GREEN;  break;
                    case  7: port.value = sensorModuleConstants.COLOR_YELLOW; break;
                    case  9: port.value = sensorModuleConstants.COLOR_RED;    break;
                    case 10: port.value = sensorModuleConstants.COLOR_WHITE;  break;
                    default: port.value = sensorModuleConstants.COLOR_NONE;   break;
                }
                break;
            default:
                port.value = 0;
                break;
        }
    }

    onRotate(layer, device) {
        if (device.portName in PORT_TO_INDEX) {
            let port = layer.ports[PORT_TO_INDEX[device.portName]];
            port.degrees = device.values.rotate.degrees;
            port.value   = device.values.rotate.degrees - port.reset;
        }
    }

    onButton(layer, event) {
        layer.button = event.event ? 0 : 1;
    }

    onTilt(layer, event) {
        let tilt = event.values.tilt;
        layer.tilt.x = tilt.x;
        layer.tilt.y = tilt.y;
        layer.tilt.z = tilt.z || 0;
    }

    onMoveHubTilt(layer, tilt) {
        layer.tilt.x = tilt.x;
        layer.tilt.y = tilt.y;
        layer.tilt.z = 0;
    }

    onAccel(layer, event) {
        let accel = event.values.accel;
        layer.accel.x = accel.x;
        layer.accel.y = accel.y;
        layer.accel.z = accel.z || 0;
    }

    onRemoteButton(index, layer, event) {
        let value = 0;
        switch (event.event) {
            case REMOTE_BUTTON_MINUS: value = 1; break;
            case REMOTE_BUTTON_RED:   value = 2; break;
            case REMOTE_BUTTON_PLUS:  value = 4; break;
        }
        switch (index) {
            case 0: layer.buttonLeft  = value; break;
            case 1: layer.buttonRight = value; break;
        }
        layer.button = (layer.buttonRight << 3) + layer.buttonLeft;
    }

    _updateConnectedHubs() {
        let connectedHubs     = this._connectedHubs;
        let connectedHubUuids = {};
        let hubsByUuid        = this._hubsByUuid;
        connectedHubs.forEach((connectedHub) => {
            connectedHubUuids[connectedHub.uuid] = true;
        });
        this._hubs.forEach(
            function(hub) {
                if (hub.uuid in connectedHubUuids) {
                    return;
                }
                if (hubsByUuid[hub.uuid].connected) {
                    this._attachEvents(connectedHubs.length, hub, hubsByUuid[hub.uuid]);
                    connectedHubs.push(hub);
                }
            },
            this
        );
    }

    /**
     * For the web version...
    **/
    getHubs() {
        if (this._gettingHubs) {
            return;
        }
        this._gettingHubs = true;
        setInterval(() => {
            let hubs = this._poweredUP.getHubs();
            hubs.forEach(this._addHub.bind(this));
        }, 2000);
    }

    getChanged() {
        return this._changed;
    }

    getDeviceList() {
        if (!this._scanning) {
            this._scanning      = true;
            this._connectedHubs = [];
            this._hubs          = [];
            this._hubsByUuid    = {};
            this._poweredUP.scan();
        }
        let list = [];
        this._hubs.forEach(
            function(hub) {
                list.push(this._hubsByUuid[hub.uuid]);
            },
            this
        );
        return list;
    }

    getLayerPort(layer, port) {
        if (this._layers[layer] && this._layers[layer].ports[port]) {
            return this._layers[layer].ports[port];
        }
        return {};
    }

    getDevice(layer, port) {
        const device = this.getLayerPort(layer, port).device;
        if (!device || !device.connected) {
            return null;
        }
        return device;
    }

    getPort() {
        return this._port;
    }

    getConnected() {
        return this._connected;
    }

    getLayerCount() {
        return this._layerCount;
    }

    setLayerCount(layerCount) {
        this._layerCount = layerCount;
    }

    getMotorPosition(layer, port) {
        return this._port[port] || 0;
    }

    connect(uuid, callback) {
        if (uuid in this._hubsByUuid) {
            let hub = this._hubsByUuid[uuid];
            if (!hub) {
                callback(null);
                return;
            }
            if (!hub.connected && !hub.connecting) {
                hub.connecting  = true;
                hub.connectTime = Date.now();
                this._hubs[hub.index].connect();
            }
            callback(hub);
        } else {
            callback(null);
        }
    }

    disconnect() {
    }

    playtone(frequency, duration, volume, callback) {
    }

    getHHubByLayer(layer) {
        let h = this._connectedHubs[layer];
        if (!h) {
            return null;
        }
        let hub = this._hubsByUuid[h.uuid];
        if (!hub || !hub.connected) {
            return null;
        }
        return {h: h, hub: hub};
    }

    getHubConnected(layer) {
        let hHub = this.getHHubByLayer(layer);
        if (!hHub) {
            return false;
        }
        return hHub.hub.connected;
    }

    getConnectedTypes(layer) {
    }

    getDefaultModeForType(type) {
        return 0;
    }

    getPUBrake(brake) {
        return brake ? poweredUpConstants.BrakingStyle.HOLD : poweredUpConstants.BrakingStyle.FLOAT;
    }

    setDirection(port, direction, gain) {
        let motorDevice = port.motorDevice;
        if (!motorDevice) {
            return;
        }
        if (port.currentDirection !== direction) {
            if (motorDevice.setDecelerationTime) {
                motorDevice.setDecelerationTime(0);
            }
            let speed = Math.abs(port.speed);
            switch (direction) {
                case DIRECTION_REVERSE:
                    motorDevice.setPower(-speed);
                    break;
                case DIRECTION_NONE:
                    port.moving = false;
                    motorDevice.setPower(0);
                    motorDevice.brake();
                    break;
                case DIRECTION_FORWARD:
                    motorDevice.setPower(speed);
                    break;
            }
            port.currentDirection = direction;
        }
    }

    motorReset(layer, motor) {
        let hHub = this.getHHubByLayer(layer);
        if (!hHub) {
            return;
        }
        let layers = this._layers;
        if (!layers[layer] || !(motor in layers[layer].ports)) {
            return;
        }
        let port = layers[layer].ports[motor];
        port.reset = port.degrees;
        port.value = 0;
    }

    motorMonitor() {
        let layers = this._layers;
        for (let layer = 0; layer < 4; layer++) {
            for (let id = 0; id < 4; id++) {
                let port        = layers[layer].ports[id];
                let motorDevice = port.motorDevice;
                if (motorDevice) {
                    if (port.moving) {
                        if ((Math.abs(port.endDegrees - port.degrees) < port.threshold) ||
                            ((port.startDegrees < port.endDegrees) && (port.degrees >= port.endDegrees)) ||
                            ((port.startDegrees > port.endDegrees) && (port.degrees <= port.endDegrees))) {
                            this.setDirection(port, DIRECTION_NONE, 0);
                        } else if (port.degrees < port.endDegrees) {
                            this.setDirection(port, DIRECTION_FORWARD);
                        } else {
                            this.setDirection(port, DIRECTION_REVERSE);
                        }
                    } else if (!port.on) {
                        this.setDirection(port, DIRECTION_NONE);
                    }
                }
            }
        }
    }

    motorDegrees(layer, motor, speed, degrees, brake, callback) {
        if (!this.getHubConnected(layer)) {
            return;
        }
        let motorDevice = this.getDevice(layer, motor);
        if (!motorDevice) {
            return;
        }
        if (motorDevice.setBrakingStyle) {
            motorDevice.setBrakingStyle(this.getPUBrake(brake));
        }
        if (motorDevice.rotateByDegrees) {
            let port = this.getLayerPort(layer, motor);
            this.setDirection(port, DIRECTION_NONE);
            port.motorDevice      = motorDevice;
            port.moving           = true;
            port.startDegrees     = port.degrees;
            port.endDegrees       = port.degrees + degrees;
            port.speed            = speed;
            port.currentDirection = DIRECTION_NONE;
        }
        callback && callback();
    }

    motorOn(layer, motor, speed, brake, callback) {
        if (!this.getHubConnected(layer)) {
            return;
        }
        let motorDevice = this.getDevice(layer, motor);
        if (motorDevice) {
            this.getLayerPort(layer, motor).on = true; // Let the motor monitor know that this motor should not be stopped!
            switch (motorDevice.type) {
                case poweredUpModuleConstants.POWERED_UP_DEVICE_BASIC_MOTOR:
                case poweredUpModuleConstants.POWERED_UP_DEVICE_TRAIN_MOTOR:
                    motorDevice.setPower        && motorDevice.setPower(speed);
                    break;
                case poweredUpModuleConstants.POWERED_UP_DEVICE_BOOST_TACHO_MOTOR:
                    motorDevice.setBrakingStyle && motorDevice.setBrakingStyle(this.getPUBrake(brake));
                    motorDevice.setPower        && motorDevice.setPower(speed);
                    break;
                case poweredUpModuleConstants.POWERED_UP_DEVICE_LED_LIGHTS:
                    motorDevice.setBrightness   && motorDevice.setBrightness(speed);
                    break;
                case poweredUpModuleConstants.POWERED_UP_DEVICE_CONTROL_PLUS_LARGE_MOTOR:
                case poweredUpModuleConstants.POWERED_UP_DEVICE_CONTROL_PLUS_XLARGE_MOTOR:
                case poweredUpModuleConstants.POWERED_UP_DEVICE_TECHNIC_MEDIUM_ANGULAR_MOTOR:
                    motorDevice.setSpeed        && motorDevice.setSpeed(speed, 10000);
                    break;
            }
        }
        callback && callback();
    }

    motorStop(layer, motor, brake, callback) {
        if (!this.getHubConnected(layer)) {
            return;
        }
        let motorDevice = this.getDevice(layer, motor);
        if (motorDevice) {
            motorDevice.setBrakingStyle && motorDevice.setBrakingStyle(this.getPUBrake(brake));
            motorDevice.stop            && motorDevice.stop();
            motorDevice.setBrightness   && motorDevice.setBrightness(0);
            motorDevice.brake           && motorDevice.brake();
        }
        callback && callback();
    }

    motorThreshold(layer, motor, threshold) {
        if (!this.getHubConnected(layer)) {
            return;
        }
        this.getLayerPort(layer, motor).threshold = threshold;
    }

    readTouchSensor(layer, port) {}
    readSensor(layer, port, type, mode) {}
    readMotor(layer, port) {}
    readBattery(callback) {}

    setLed(layer, color) {
        if (!this._hubs[layer]) {
            return;
        }
        let hub = this._hubs[layer];
        let h   = this._hubsByUuid[hub.uuid];
        if (h.connected && ([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 255].indexOf(color) !== -1)) {
            if (hub.setLEDColor) {
                hub.setLEDColor(color);
            } else {
                let hubLed = this._layers[layer].hubLed;
                if (hubLed && hubLed.setColor) {
                    hubLed.setColor(color);
                }
            }
        }
    }

    listFiles(path, callback) {}
    downloadFile(filename, data, callback) {}
    createDir(path, callback) {}
    deleteFile(path, callback) {}

    module(module, command, data) {
        if (this._modules[module]) {
            this._modules[module].run(command, data);
        }
    }

    getState() {
        let time   = Date.now();
        let layers = this._layers;
        this._hubs.forEach(
            function(h) {
                let hub = this._hubsByUuid[h.uuid];
                if (hub.connecting && (time > hub.connectTime + 3000)) {
                    hub.connecting = false;
                    hub.connected  = true;
                    this._updateConnectedHubs();
                }
            },
            this
        );
        this._connectedHubs.forEach(
            function(h, index) {
                let hub = this._hubsByUuid[h.uuid];
                layers[index].uuid         = h.uuid;
                layers[index].type         = h.type;
                layers[index].batteryLevel = h.batteryLevel;
                layers[index].connected    = true;
            },
            this
        );
        const copyLayer = function(layer) {
                let result = {
                        uuid:      layer.uuid,
                        type:      layer.type,
                        connected: layer.connected,
                        button:    layer.button,
                        tilt:      layer.tilt,
                        accel:     layer.accel,
                        ports:     []
                    };
                for (let i = 0; i < 4; i++) {
                    let port = layer.ports[i];
                    result.ports.push({
                        value:    port.value,
                        assigned: port.assigned,
                        ready:    !port.moving
                    });
                }
                return result;
            };
        let result = {layers: []};
        for (let i = 0; i < 4; i++) {
            result.layers.push(copyLayer(layers[i]));
        }
        return result;
    }

    setMode(layer, port, mode) {
        this.getLayerPort(layer, port).mode = mode;
    }

    stopPolling() {}
    resumePolling() {}
};
