/**
 * Based on example code:
 * https://github.com/kayjtea/ev3-direct
 *
 * Wheel, copyright (c) 2019 - present by Arno van der Vegt
 *
 * Added performance improvements by sending out multiple messages at once with an ID
 * and waiting for their response id.
**/
const sensorModuleConstants = require('../../vm/modules/sensorModuleConstants');
const messageEncoder        = require('./messageEncoder');
const Message               = require('./Message').Message;
const constants             = require('./constants');

const MESSAGE_TIME_OUT_TIME = 25;

exports.CommandQueue = class {
    constructor(ev3, sendFunction) {
        this._sentTime        = Date.now();
        this._sending         = false;
        this._ev3             = ev3;
        this._battery         = 0;
        this._sendFunction    = sendFunction;
        this._pending         = {time: null, command: null};
        this._queue           = [];
        this._id              = 0;
        this._foundDisconnect = false;
        this._layers          = [];
        for (let i = 0; i < 4; i++) {
            this._layers.push(this.initLayer(i));
        }
        setInterval(this.execute.bind(this), 1);
    }

    initLayer(layer) {
        let result = [];
        let i      = 0;
        for (i = 0; i < 4; i++) {
            result.push({
                sending:         true,
                id:              0,
                layer:           layer,
                port:            i,
                mode:            null,
                message:         '',
                type:            null,
                response:        false,
                time:            0,
                value:           0,
                assigned:        null,
                assignedTimeout: null
            });
        }
        for (i = 0; i < 4; i++) {
            result.push({
                ready:           false,
                assigned:        null,
                assignedTimeout: null,
                value:           0,
                reset:           false,
                degrees:         0,
                resetDegrees:    0,
                startDegrees:    null,
                endDegrees:      null
            });
        }
        return result;
    }

    getMode(layer, port) {
        return this._layers[layer][port].mode;
    }

    setMode(layer, port, mode) {
        this._layers[layer][port].mode = mode;
    }

    setMotorMove(layer, port, degrees) {
        layer             = this._layers[layer];
        port              = layer[port + 4];
        port.startDegrees = port.value - port.resetDegrees;
        port.endDegrees   = degrees;
        return this;
    }

    getDefaultModeForType(type) {
        switch (type) {
            case sensorModuleConstants.SENSOR_TYPE_NXT_TOUCH:
            case sensorModuleConstants.SENSOR_TYPE_NXT_LIGHT:
            case sensorModuleConstants.SENSOR_TYPE_NXT_SOUND:
            case sensorModuleConstants.SENSOR_TYPE_NXT_ULTRASONIC:
            case sensorModuleConstants.SENSOR_TYPE_NXT_TEMPERATURE:
            case sensorModuleConstants.SENSOR_TYPE_TOUCH:
                return constants.MODE0;
            case sensorModuleConstants.SENSOR_TYPE_NXT_COLOR:
            case sensorModuleConstants.SENSOR_TYPE_COLOR:
                return sensorModuleConstants.COLOR_COLOR;
            case sensorModuleConstants.SENSOR_TYPE_ULTRASONIC:
                return sensorModuleConstants.ULTRASONIC_CM;
            case sensorModuleConstants.SENSOR_TYPE_GYRO:
                return sensorModuleConstants.GYRO_ANGLE;
            case sensorModuleConstants.SENSOR_TYPE_INFRARED:
                return sensorModuleConstants.IR_REMOTE;
        }
        return constants.MODE0;
    }

    getDefaultMode(layer, port) {
        let item = this._layers[layer][port];
        return this.getDefaultModeForType(item.assigned);
    }

    getLayers() {
        let layers = this._layers;
        layers.forEach((layer) => {
            for (let i = 4; i < 8; i++) {
                let port = layer[i];
                if (port.assigned !== null) {
                    if (port.endDegrees !== null) {
                        if (port.startDegrees < port.endDegrees) {
                            port.ready = (Math.abs(port.degrees - port.endDegrees) < 45) || (port.degrees >= port.endDegrees);
                        } else {
                            port.ready = (Math.abs(port.degrees - port.endDegrees) < 45) || (port.degrees <= port.endDegrees);
                        }
                    }
                }
            }
        });
        return layers;
    }

    getId() {
        this._id = (this._id + 1) & 255;
        return this._id;
    }

    getLength() {
        return this._queue.length;
    }

    getPendingCommand() {
        return this._pending.command;
    }

    getBattery() {
        return this._battery;
    }

    getAssignedPortCount() {
        let count = 0;
        this._layers.forEach((layer) => {
            layer.forEach((port, index) => {
                if (index < 4) {
                    count += this.isValidAssignedSensor(port);
                } else if (index < 8) {
                    count += this.isValidAssignedMotor(port);
                }
            });
        });
        return count;
    }

    getFloatResult(inputData) {
        let buf  = new ArrayBuffer(4);
        let view = new DataView(buf);
        view.setUint8(0, inputData[8]);
        view.setUint8(1, inputData[7]);
        view.setUint8(2, inputData[6]);
        view.setUint8(3, inputData[5]);
        let result = view.getFloat32(0);
        return isNaN(result) ? 0 : result;
    }

    getFoundDisconnect() {
        return this._foundDisconnect;
    }

    setFoundDisconnect(foundDisconnect) {
        this._foundDisconnect = foundDisconnect;
    }

    shouldChunkTranfers() {
        return false;
    }

    execute() {
        let time = Date.now();
        if (this._sending &&  ((this._sentTime === null) || (time > this._sentTime))) {
            return;
        }
        let pending = this._pending;
        let queue   = this._queue;
        if ((pending.command !== null) && (time > pending.time)) {
            pending.command.id   = this.getId();
            pending.command.time = time + MESSAGE_TIME_OUT_TIME;
            queue.unshift(pending.command);
            pending.command = null;
        }
        if (!queue.length || pending.command) {
            return;
        }
        this._sentTime = null;
        let command = queue.shift();
        if (command.response) {
            pending.time    = Date.now() + MESSAGE_TIME_OUT_TIME;
            pending.command = command;
            this._sending   = true;
        } else if (command.wait) {
            this._sending   = true;
        }
        this._sentTime = time + 50;
        this._sendFunction(messageEncoder.packMessageForSending(command.id, command.message.get()));
        command.callback && command.callback();
    }

    addToCommandQueue(command) {
        let index = null;
        if (('layer' in command) && ('port' in command)) {
            if ([
                    sensorModuleConstants.SENSOR_TYPE_NXT_TOUCH,
                    sensorModuleConstants.SENSOR_TYPE_NXT_LIGHT,
                    sensorModuleConstants.SENSOR_TYPE_NXT_SOUND,
                    sensorModuleConstants.SENSOR_TYPE_NXT_COLOR,
                    sensorModuleConstants.SENSOR_TYPE_NXT_ULTRASONIC,
                    sensorModuleConstants.SENSOR_TYPE_NXT_TEMPERATURE,
                    sensorModuleConstants.SENSOR_TYPE_TOUCH,
                    sensorModuleConstants.SENSOR_TYPE_COLOR,
                    sensorModuleConstants.SENSOR_TYPE_ULTRASONIC,
                    sensorModuleConstants.SENSOR_TYPE_GYRO,
                    sensorModuleConstants.SENSOR_TYPE_INFRARED
                ].indexOf(command.type) !== -1) {
                index = command.port;
            } else if (command.type === constants.READ_FROM_MOTOR) {
                index = command.port + 4;
            }
        }
        let time = Date.now();
        if (index !== null) {
            let layer = command.layer;
            let item  = this._layers[layer][index];
            if (this._pending.command || item.sending) {
                if (item.sending && (time > item.time)) { // Timeout, send next time!
                    item.sending = false;
                }
                return;
            }
            item.wait     = true;
            item.id       = this.getId();
            item.time     = time + MESSAGE_TIME_OUT_TIME;
            item.response = command.response;
            item.mode     = command.mode;
            item.type     = command.type;
            item.message  = command.message;
            item.sending  = true;
            this._queue.push(item);
        } else {
            command.wait  = false;
            command.id    = this.getId();
            command.time  = time + MESSAGE_TIME_OUT_TIME;
            this._queue.push(command);
        }
    }

    isValidAssignedMotor(assigned) {
        return (constants.MOTORS.indexOf(assigned) !== -1);
    }

    isValidAssignedSensor(assigned) {
        return ([
            sensorModuleConstants.SENSOR_TYPE_NXT_TOUCH,
            sensorModuleConstants.SENSOR_TYPE_NXT_LIGHT,
            sensorModuleConstants.SENSOR_TYPE_NXT_SOUND,
            sensorModuleConstants.SENSOR_TYPE_NXT_COLOR,
            sensorModuleConstants.SENSOR_TYPE_NXT_ULTRASONIC,
            sensorModuleConstants.SENSOR_TYPE_NXT_TEMPERATURE,
            sensorModuleConstants.SENSOR_TYPE_TOUCH,
            sensorModuleConstants.SENSOR_TYPE_COLOR,
            sensorModuleConstants.SENSOR_TYPE_ULTRASONIC,
            sensorModuleConstants.SENSOR_TYPE_GYRO,
            sensorModuleConstants.SENSOR_TYPE_INFRARED
        ].indexOf(assigned) !== -1);
    }

    readFilesRecieved(inputData) {
        let files = [];
        let file  = '';
        let i     = 12;
        while (i < inputData.length) {
            let c = inputData[i++];
            if (c === 10) {
                files.push(file);
                file = '';
            } else {
                file += String.fromCharCode(c);
            }
        }
        if (file !== '') {
            files.push(file);
        }
        return files;
    }

    continueDownload(handle, filename, data) {
        let chunkSize = 65535;
        for (let i = 0; i < data.length; i += chunkSize) {
            let chunkData = data.substring(i, i + chunkSize);
            this.addToCommandQueue({
                type:    constants.SYSTEM_COMMAND,
                message: new Message()
                    .addS(constants.CONTINUE_DOWNLOAD)
                    .addS(handle)
                    .addS(chunkData)
            });
        }
    }

    receiveSensorData(inputData, id) {
        let layers           = this._layers;
        let activeLayerCount = this._ev3.getActiveLayerCount();
        let found            = false;
        let time             = Date.now();
        for (let i = 0; i < Math.min(activeLayerCount, layers.length); i++) {
            let layer = layers[i];
            for (let j = 0; j < 8; j++) {
                let item = layer[j];
                if (item.sending) {
                    if ((j > 3) && (time > item.time)) {
                        found        = true;
                        item.sending = false; // Message timed out, reset...
                        continue;
                    }
                }
                if (!item.sending || (item.id !== id)) {
                    continue;
                }
                found = true;
                switch (item.type) {
                    case sensorModuleConstants.SENSOR_TYPE_NXT_TOUCH:
                    case sensorModuleConstants.SENSOR_TYPE_TOUCH:
                        item.value = (inputData[5] === 100) ? 1 : 0;
                        break;
                    case sensorModuleConstants.SENSOR_TYPE_NXT_COLOR:
                    case sensorModuleConstants.SENSOR_TYPE_COLOR:
                        let num = Math.floor(this.getFloatResult(inputData));
                        if (item.mode === sensorModuleConstants.COLOR_COLOR) {
                            item.value = ((num >= 0) && (num < 7)) ? num : 0;
                        } else {
                            item.value = num;
                        }
                        break;
                    case sensorModuleConstants.SENSOR_TYPE_INFRARED:
                        if ((item.mode === sensorModuleConstants.IR_REMOTE) ||
                            (item.mode === sensorModuleConstants.IR_REMOTE_ADVANCED)) {
                            item.value = Math.min(Math.max(Math.floor(this.getFloatResult(inputData)), 0), 11);
                        } else {
                            item.value = this.getFloatResult(inputData);
                        }
                        break;
                    case sensorModuleConstants.SENSOR_TYPE_NXT_LIGHT:
                    case sensorModuleConstants.SENSOR_TYPE_NXT_SOUND:
                    case sensorModuleConstants.SENSOR_TYPE_NXT_ULTRASONIC:
                    case sensorModuleConstants.SENSOR_TYPE_NXT_TEMPERATURE:
                    case sensorModuleConstants.SENSOR_TYPE_ULTRASONIC:
                    case sensorModuleConstants.SENSOR_TYPE_GYRO:
                        item.value = this.getFloatResult(inputData);
                        break;
                    case constants.READ_FROM_MOTOR:
                        item.value = Math.round(this.getFloatResult(inputData) * 360); // Round to nearest degree
                        if (item.reset) {
                            item.reset        = false;
                            item.resetDegrees = item.value;
                        }
                        item.degrees = item.value - item.resetDegrees;
                        break;
                }
                item.sending = false;
            }
        }
        return found;
    }

    /**
     * Process the inputData for the connected device information.
     *
     * Return true if there was an earlier connection but no connections are found now.
    **/
    receiveTypeMode(inputData) {
        const isAssigned = function(assigned) {
                // None, Port Error, Unknown, Initializing
                return [0x7E, 0x7F, 0xFF, 0x7D].indexOf(assigned) === -1;
            };
        let assignedCount = 0;
        let hadAssignment = false;
        let p             = this._layers[this._pending.command.layer || 0];
        const updateAssigned = (port, assigned, valid, i) => {
                if (valid && (port.assigned === assigned)) {
                    return;
                }
                if (valid) {
                    if (port.assignedTimeout) {
                        clearTimeout(port.assignedTimeout);
                    }
                    port.assigned = assigned;
                } else if (port.assignedTimeout) {
                    this._foundDisconnect = true;
                    if (port.assignedTimeout) {
                        clearTimeout(port.assignedTimeout);
                    }
                    port.assigned = assigned;
                } else {
                    this._foundDisconnect = true;
                    port.assignedTimeout = setTimeout(
                        () => {
                            port.assignedTimeout = null;
                            port.assigned        = assigned;
                        },
                        5000
                    );
                }
            };
        for (let i = 0; i < 4; i++) {
            let value    = inputData[5 + (i * 2)] || 0;
            let assigned = parseInt(messageEncoder.byteString(value), 16);
            if (!isAssigned(assigned)) {
                p[i].mode = null;
            }
            updateAssigned(p[i], assigned, this.isValidAssignedSensor(assigned), i);
            let j = i + 4;
            assigned = inputData[5 + (j * 2)] || 0;
            updateAssigned(p[j], assigned, this.isValidAssignedMotor(assigned));
        }
        return hadAssignment && (assignedCount === 0);
    }

    receiveHandler(data) {
        this._sending = false;
        let inputData = new Uint8Array(data);
        let id        = inputData[2];
        if (this.receiveSensorData(inputData, id)) {
            return;
        }
        if (!this._pending.command) {
            // Received Data and didn't expect it...
            return;
        }
        let type     = this._pending.command.type;
        let mode     = this._pending.command.mode;
        let callback = this._pending.command.responseCallback;
        let handle   = null;
        let result   = null;
        switch (type) {
            case constants.UIREAD_BATTERY:
                this._battery = inputData[5];
                if (callback) {
                    callback(result);
                }
                break;
            case constants.BEGIN_DOWNLOAD:
                result = inputData[6];
                handle = inputData[7];
                if (result === 0) {
                    let filename = this._pending.command.filename;
                    let data     = this._pending.command.data;
                    this.continueDownload(messageEncoder.decimalToLittleEndianHex(handle, 2), filename, data);
                    callback && callback(false);
                } else {
                    console.error('Download failed, state:' + result + ' handle: ' + handle);
                    callback && callback(true);
                }
                break;
            case constants.BEGIN_LIST_FILES:
                let files = this.readFilesRecieved(inputData);
                if (callback) {
                    callback(files);
                }
                break;
            case constants.INPUT_DEVICE_GET_TYPE_MODE:
                this.receiveTypeMode(inputData);
                break;
            case constants.SYSTEM_COMMAND:
                if (callback) {
                    callback(inputData[4] === 3);
                }
                break;
        }
        this._pending.command = null;
    }
};
