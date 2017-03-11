(function() {
    var wheel = require('../utils/base.js').wheel;
    var $;

    wheel(
        'compiler.Compiler',
        wheel.Class(function() {
            this.init = function(opts) {
                $ = wheel.compiler.command;

                this._compilerData   = new wheel.compiler.CompilerData({compiler: this});
                this._output         = new wheel.compiler.CompilerOutput({compiler: this});
                this._mainIndex      = -1;
                this._filename       = '';
                this._includes       = null;
                this._procStartIndex = -1;
                this._activeStruct   = null;

                var compilerOpts = {
                        compiler:     this,
                        compilerData: this._compilerData
                    };
                var constructors = [
                        'NumberDeclaration',
                        'NumberInc',
                        'NumberDec',
                        'NumberOperator',
                        'StringDeclaration',
                        'ProcedureDeclaration',
                        'Set',
                        'Call',
                        'CallFunction',
                        'CallReturn',
                        'Ret',
                        'Label',
                        'ArrayR',
                        'ArrayW',
                        'Addr',
                        'JmpC'
                    ];
                var compilers = {};

                for (var i = 0; i < constructors.length; i++) {
                    compilers[constructors[i]] = new wheel.compiler.commands[constructors[i]](compilerOpts); // Needs namespace!
                }
                this._compilers = compilers;

                compilers.CallFunction.setCallCompiler(compilers.Call);
                compilers.CallFunction.setSetCompiler(compilers.Set);
                compilers.CallFunction.setNumberOperatorCompiler(compilers.NumberOperator);

                compilers.CallReturn.setSetCompiler(compilers.Set);
                compilers.CallReturn.setRetCompiler(compilers.Ret);

                this._compilerByCommand = {
                    je:         compilers.JmpC,
                    jne:        compilers.JmpC,
                    jl:         compilers.JmpC,
                    jle:        compilers.JmpC,
                    jg:         compilers.JmpC,
                    jge:        compilers.JmpC,
                    set:        compilers.Set,
                    addr:       compilers.Addr,
                    arrayr:     compilers.ArrayR,
                    arrayw:     compilers.ArrayW,
                    number:     compilers.NumberDeclaration,
                    inc:        compilers.NumberInc,
                    dec:        compilers.NumberDec,
                    add:        compilers.NumberOperator,
                    sub:        compilers.NumberOperator,
                    mul:        compilers.NumberOperator,
                    div:        compilers.NumberOperator,
                    and:        compilers.NumberOperator,
                    or:         compilers.NumberOperator,
                    xor:        compilers.NumberOperator,
                    cmp:        compilers.NumberOperator,
                    mod:        compilers.NumberOperator,
                    string:     compilers.StringDeclaration,
                    proc:       compilers.ProcedureDeclaration,
                    ret:        compilers.Ret,
                    'return':   compilers.CallReturn
                };
            };

            this.createError = function(errorNumber, message, location) {
                location || (location = this._location || {});

                var error    = new Error('#' + errorNumber + ' ' + message);
                var includes = this._includes;
                var filename = location.filename;
                var line     = '';

                for (var i = 0; i < includes.length; i++) {
                    var include = includes[i];
                    if (include.filename === filename) {
                        line = include.lines[location.lineNumber] || '';
                        break;
                    }
                }

                error.location = {
                    filename:   location.filename,
                    lineNumber: location.lineNumber,
                    line:       line
                };
                return error;
            };

            this.createCommand = function(command, params) {
                var args = wheel.compiler.command[command].args;
                var code = wheel.compiler.command[command].code;

                if (params.length) {
                    for (var i = 0; i < params.length; i++) {
                        var param = params[i];
                        var found = false;

                        for (var j = 0; j < args.length; j++) {
                            var argsMetaType = args[j].metaType || false;
                            var matchType    = false;

                            // Check the primitive types...
                            if (param.type === args[j].type) {
                                if (argsMetaType) {
                                    if (param.metaType === argsMetaType) {
                                        matchType = true;
                                    } else if (param.vr && (param.vr.metaType === argsMetaType)) {
                                        matchType = true;
                                    }
                                } else {
                                    matchType = true;
                                }
                            // Check the var types...
                            } else if (param.vr && param.vr.field && (param.vr.field.type === args[j].type)) {
                                matchType = true;
                            }

                            if (matchType) {
                                args  = ('args' in args[j]) ? args[j].args : args[j];
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            throw this.createError(16, 'Type mismatch "' + param.param + '".');
                        }
                    }
                    return {
                        code:   code,
                        params: params,
                        location: {
                            filename:   this._location.filename,
                            lineNumber: this._location.lineNumber
                        }
                    };
                }
            };

            this.validateCommand = function(command, params) {
                if (!(command in wheel.compiler.command)) {
                    return false;
                }

                for (var i = 0; i < params.length; i++) {
                    params[i] = this._compilerData.paramInfo(params[i]);
                }
                return this.createCommand(command, params);
            };

            this.compileLine = function(line, location) {
                var compilerByCommand = this._compilerByCommand;
                var compilerData      = this._compilerData;
                var output            = this._output;

                if ((line.indexOf('proc ') === -1) && (line.indexOf('(') !== -1)) {
                    var spacePos = line.indexOf(' ');
                    var command  = line.substr(0, spacePos).trim();
                    if (['set', 'add', 'sub', 'mul', 'div', 'mod', 'cmp'].indexOf(command) === -1) {
                        this._compilers.Call.compile(line);
                    } else {
                        this._compilers.CallFunction.compile(line);
                    }
                } else if (this._compilers.Label.hasLabel(line)) {
                    compilerData.findLabel(line.substr(0, line.length - 1)).index = output.getLength() - 1;
                } else {
                    var commandAndParams = this.getCommandAndParams(line);
                    var splitParams      = wheel.compiler.compilerHelper.splitParams(commandAndParams.params);
                    var validatedCommand = this.validateCommand(commandAndParams.command, splitParams);
                    validatedCommand && (validatedCommand.command = commandAndParams.command);
                    switch (commandAndParams.command) {
                        case 'endp':
                            if (this._activeStruct !== null) {
                                throw this.createError(50, 'Invalid command "endp".');
                            }
                            this._compilers.Ret.compile(null);

                            output.getBuffer()[this._procStartIndex].localCount = compilerData.getLocalOffset();
                            this._procStartIndex = -1;
                            compilerData.resetLocal();
                            compilerData.removeLocalStructs();
                            break;

                        case 'struct':
                            this._activeStruct = compilerData.declareStruct(commandAndParams.params, commandAndParams.command, location);
                            break;

                        case 'ends':
                            this._activeStruct = null;
                            break;

                        default:
                            if (commandAndParams.command in compilerByCommand) {
                                compilerByCommand[commandAndParams.command].compile(validatedCommand, splitParams, commandAndParams.params, location);
                            } else if (validatedCommand === false) {
                                var struct = compilerData.findStruct(commandAndParams.command);
                                if (struct === null) {
                                    throw this.createError(24, 'Unknown command "' + commandAndParams.command + '".');
                                } else if (this._activeStruct !== null) {
                                    for (var j = 0; j < splitParams.length; j++) {
                                        compilerData.declareStructField(splitParams[j], $.T_STRUCT_G, $.T_STRUCT_G_ARRAY, struct.size, struct);
                                    }
                                } else if (this.getInProc()) {
                                    for (var j = 0; j < splitParams.length; j++) {
                                        compilerData.declareLocal(splitParams[j], $.T_STRUCT_L, $.T_STRUCT_L_ARRAY, struct);
                                    }
                                } else {
                                    for (var j = 0; j < splitParams.length; j++) {
                                        compilerData.declareGlobal(splitParams[j], $.T_STRUCT_G, $.T_STRUCT_G_ARRAY, struct, location);
                                    }
                                }
                            } else {
                                this.getOutput().add(validatedCommand);
                            }
                            break;
                    }
                }
            };

            this.compileTypeof = function(line) {
                var i = line.indexOf('@typeof(');
                if (i === -1) {
                    return line;
                }
                var j            = line.indexOf(')');
                var vr           = line.substr(i + 8, j - 8 - i).trim();
                var compilerData = this._compilerData;

                var local = compilerData.findLocal(vr);
                if (local === null) {
                    var global = compilerData.findLocal(vr);
                    if (global === null) {
                        throw this.createError(22, 'Undefined identifier "' + vr + '".');
                    } else if (global.type === $.T_NUM_G_ARRAY) {
                        line = 'number ' + line.substr(j + 1 - line.length).trim();
                    } else if (global.struct) {
                        line = global.struct.name + ' ' + line.substr(j + 1 - line.length).trim();
                    }
                } else if (local.type === $.T_NUM_L_ARRAY) {
                    line = 'number ' + line.substr(j + 1 - line.length).trim();
                } else if (local.struct) {
                    line = local.struct.name + ' ' + line.substr(j + 1 - line.length).trim();
                }

                return line;
            };

            this.compileLines = function(lines) {
                var sourceMap = lines.sourceMap;
                var output    = this._output;

                this._procStartIndex = -1;
                this._activeStruct   = null;
                for (var i = 0; i < lines.output.length; i++) {
                    var line = lines.output[i].trim();
                    if (line === '') {
                        continue;
                    }

                    this._location = sourceMap[i];

                    this.compileLine(this.compileTypeof(line));
                }

                return output.getBuffer();
            };

            this.compile = function(includes) {
                var compilerData = this._compilerData;
                var output       = this._output;

                compilerData.reset();
                output.reset();
                this._mainIndex = -1;
                this._includes  = includes;

                var scriptCompiler = new wheel.compiler.script.ScriptCompiler({});
                var i              = includes.length;
                while (i) {
                    i--;
                    var filename = includes[i].filename;
                    var lines    = scriptCompiler.compile(filename, includes[i].lines);
                    this._filename = filename;

                    this._compilers.Label.compile(lines);
                    this.compileLines(lines);
                    this._compilers.Label.updateLabels();
                }

                if (this._mainIndex === -1) {
                    throw this.createError(23, 'No main procedure found.');
                }

                output.optimizeTypes();
                output.setGlobalOffset(compilerData.getGlobalOffset());
                output.setMainIndex(this._mainIndex);
                output.getLines();

                return output;
            };

            this.getIncludes = function() {
                return this._includes;
            };

            this.getOutput = function() {
                return this._output;
            };

            this.getCompilerData = function() {
                return this._compilerData;
            };

            this.getProcStartIndex = function() {
                return this._procStartIndex;
            };

            this.setProcStartIndex = function(procStartIndex) {
                this._procStartIndex = procStartIndex;
            };

            this.getActiveStruct = function() {
                return this._activeStruct;
            };

            this.setMainIndex = function(mainIndex) {
                this._mainIndex = mainIndex;
            };

            this.getInProc = function() {
                return (this._procStartIndex !== -1);
            };

            this.getCommandAndParams = function(line) {
                var command = line;
                var params  = '';
                var i       = line.indexOf(' ');

                if (i !== -1) {
                    command = line.substr(0, i),
                    params  = line.substr(i - line.length + 1).trim();
                }
                return {
                    command: command,
                    params:  params
                };
            };
        })
    );
})();