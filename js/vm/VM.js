(function() {
    var wheel = require('../utils/base.js').wheel;

    wheel(
        'vm.VM',
        wheel.Class(wheel.Emitter, function(supr) {
            this.init = function(opts) {
                supr(this, 'init', arguments);

                this._vmData      = new wheel.VMData({});
                this._commands    = null;
                this._runInterval = null;
                this._pause       = 0;
                this._onFinished  = null;

                this.initModules();
            };

            this.initModules = function() {
                this._modules    = [];
                this._modules[0] = new wheel.vm.modules.StandardModule({vm: this, vmData: this._vmData});
                this._modules[1] = new wheel.vm.modules.ScreenModule  ({vm: this, vmData: this._vmData});
                this._modules[2] = new wheel.vm.modules.MotorModule   ({vm: this, vmData: this._vmData});
                this._modules[3] = new wheel.vm.modules.SensorModule  ({vm: this, vmData: this._vmData});
                this._modules[4] = new wheel.vm.modules.MathModule    ({vm: this, vmData: this._vmData});
                this._modules[5] = new wheel.vm.modules.LightModule   ({vm: this, vmData: this._vmData});
                this._modules[6] = new wheel.vm.modules.ButtonsModule ({vm: this, vmData: this._vmData});
                this._modules[7] = new wheel.vm.modules.SoundModule   ({vm: this, vmData: this._vmData});
            };

            this.getParamValue = function(data, regOffsetStack, param) {
                var p = param.value;
                switch (param.type) {
                    case wheel.compiler.command.T_NUM_G: return data[p];
                    case wheel.compiler.command.T_NUM_L: return data[p + regOffsetStack];
                }
                return p;
            };

            this.getRunning = function() {
                return (this._runInterval !== null);
            };

            this.runCommand = function(command) {
                var data           = this._vmData.getData();
                var regOffsetStack = data[wheel.compiler.command.REG_STACK];
                var params         = command.params;
                var v1             = this.getParamValue(data, regOffsetStack, params[0]);
                var v2             = this.getParamValue(data, regOffsetStack, params[1]);

                switch (command.code) {
                    case 0: // copy
                        var size          = v1;
                        var regOffsetSrc  = data[wheel.compiler.command.REG_SRC];
                        var regOffsetDest = data[wheel.compiler.command.REG_DEST];
                        for (var i = 0; i < size; i++) {
                            data[regOffsetDest + i] = data[regOffsetSrc + i];
                        }
                        break;

                    case 1: // jmpc
                        var regFlags = data[wheel.compiler.command.REG_FLAGS];
                        ((regFlags & v2) === v2) && (data[wheel.compiler.command.REG_CODE] = params[0].value);
                        break;

                    case 2: // cmp
                        var flags = 0;
                        (v1 == v2) && (flags |= wheel.compiler.command.FLAG_EQUAL);
                        (v1 != v2) && (flags |= wheel.compiler.command.FLAG_NOT_EQUAL);
                        (v1 <  v2) && (flags |= wheel.compiler.command.FLAG_LESS);
                        (v1 <= v2) && (flags |= wheel.compiler.command.FLAG_LESS_EQUAL);
                        (v1 >  v2) && (flags |= wheel.compiler.command.FLAG_GREATER);
                        (v1 >= v2) && (flags |= wheel.compiler.command.FLAG_GREATER_EQUAL);

                        data[wheel.compiler.command.REG_FLAGS] = flags;
                        break;

                    case 3: // module
                        var modules = this._modules;
                        if (modules[v1]) {
                            modules[v1].run(v2);
                        } else {
                            throw new Error('Unknown module "' + v1 + '"');
                        }
                        break;

                    default:
                        var result = null;
                        switch (command.code) {
                            case 4: // set
                                result = v2;
                                break;

                            case 5: // add
                                result = v1 + v2;
                                break;

                            case 6: // sub
                                result = v1 - v2;
                                break;

                            case 7: // mul
                                result = v1 * v2;
                                break;

                            case 8: // div
                                result = v1 / v2;
                                break;

                            case 9: // mod
                                result = v1 % v2;
                                break;
                        }

                        var param = params[0];
                        var p     = param.value;
                        switch (param.type) {
                            case wheel.compiler.command.T_NUM_G: data[p]                  = result; break;
                            case wheel.compiler.command.T_NUM_L: data[p + regOffsetStack] = result; break;
                        }
                }
            };

            this.onInterval = function(event, total) {
                total || (total = 100);

                var vmData     = this._vmData;
                var data       = vmData.getData();
                var commands   = this._commands;
                var count      = 0;
                var isFinished = function() {
                        return (vmData.getGlobalNumber(wheel.compiler.command.REG_CODE) > commands.length);
                    };

                while (!isFinished() && (count < total) && (this._pause === 0)) {
                    this.emit(
                        'RunLine',
                        vmData.getGlobalNumber(wheel.compiler.command.REG_CODE),
                        {
                            stack: data[wheel.compiler.command.REG_STACK],
                            src:   data[wheel.compiler.command.REG_SRC],
                            dest:  data[wheel.compiler.command.REG_DEST],
                            code:  data[wheel.compiler.command.REG_CODE],
                            ret:   data[wheel.compiler.command.REG_RETURN],
                            flags: data[wheel.compiler.command.REG_FLAGS]
                        }
                    );

                    this.runCommand(commands[vmData.getGlobalNumber(wheel.compiler.command.REG_CODE)]);
                    vmData.setGlobalNumber(wheel.compiler.command.REG_CODE, vmData.getGlobalNumber(wheel.compiler.command.REG_CODE) + 1);
                    count++;
                }

                if (isFinished()) {
                    clearInterval(this._runInterval);
                    this._onFinished && this._onFinished();
                    this._onFinished  = null;
                    this._runInterval = null;
                }
            };

            this.runSetup  = function(commands, stringList, globalConstants, stackOffset) {
                var vmData = this._vmData;

                vmData.reset(stackOffset);
                vmData.setStringList(stringList);
                vmData.setGlobalConstants(globalConstants, stackOffset);
                this._commands = commands.getBuffer();

                vmData.setGlobalNumber(wheel.compiler.command.REG_CODE, commands.getMainIndex());

                // Return pointers...
                // Stack offset:
                vmData.setGlobalNumber(stackOffset, stackOffset);

                // Code execution position...
                // When the main procedure is executed it gets the return data from the stack which
                // will return 65535, the VM increases the value and stops the program when.
                // After stopping REG_CODE will have a value of 65536.
                vmData.setGlobalNumber(stackOffset + 1, 65535);
            };

            this.runAll = function(commands, stringList, globalConstants, stackOffset) {
                this.runSetup(commands, stringList, globalConstants, stackOffset);

                this.onInterval(false, 1000);
            };

            this.run = function(commands, stringList, globalConstants, stackOffset, onFinished) {
                this.runSetup(commands, stringList, globalConstants, stackOffset);

                this._onFinished  = onFinished;
                this._runInterval = setInterval(this.onInterval.bind(this), 10);
            };

            this.stop = function() {
                clearInterval(this._runInterval);
                this._onFinished && this._onFinished();
                this._onFinished  = null;
                this._runInterval = null;
                this._pause       = 0;
            };

            this.pause = function() {
                this._pause++;
            };

            this.resume = function() {
                this._pause--;
            };

            this.getVMData = function() {
                return this._vmData;
            };
        })
    );
})();