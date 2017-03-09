require('./compiler/PreProcessor.js');
require('./compiler/commands/CommandCompiler.js');
require('./compiler/commands/StringDeclaration.js');
require('./compiler/commands/NumberDeclaration.js');
require('./compiler/commands/NumberInc.js');
require('./compiler/commands/NumberDec.js');
require('./compiler/commands/NumberOperator.js');
require('./compiler/commands/ProcedureDeclaration.js');
require('./compiler/commands/Set.js');
require('./compiler/commands/Call.js');
require('./compiler/commands/CallFunction.js');
require('./compiler/commands/CallReturn.js');
require('./compiler/commands/Ret.js');
require('./compiler/commands/Label.js');
require('./compiler/commands/ArrayR.js');
require('./compiler/commands/ArrayW.js');
require('./compiler/commands/Addr.js');
require('./compiler/commands/JmpC.js');
require('./compiler/command.js');
require('./compiler/compilerHelper.js');
require('./compiler/CompilerOutput.js');
require('./compiler/CompilerData.js');
require('./compiler/script/ExpressionCompiler.js');
require('./compiler/script/ScriptCompiler.js');
require('./compiler/Compiler.js');

require('./vm/Motors.js');
require('./vm/Sensors.js');
require('./vm/VMData.js');
require('./vm/VM.js');
require('./vm/modules/VMModule.js');
require('./vm/modules/StandardModule.js');
require('./vm/modules/ScreenModule.js');
require('./vm/modules/MotorModule.js');
require('./vm/modules/SensorModule.js');
require('./vm/modules/MathModule.js');
require('./vm/modules/LightModule.js');
require('./vm/modules/ButtonsModule.js');

var wheel    = require('./utils/base.js').wheel;
var compiler = new wheel.compiler.Compiler({});
var fs       = require('fs');
var files    = {
        _list: [0],
        _files: {},
        exists: function(filename) {
            if (!fs.existsSync(filename)) {
                return false;
            }
            var result = this._list.length;
            if (filename in this._files) {
                return this._files[filename];
            }
            this._files[filename] = result;
            this._list.push(filename);

            return result;
        },
        getFile: function(index) {
            if (index in this._list) {
                var data = fs.readFileSync(this._list[index]).toString();
                return {
                    getData: function(callback) {
                        callback && callback(data);
                        return data;
                    },
                    getMeta: function() {
                        return {};
                    }
                };
            }
            return null;
        }
    };

if (process.argv.length === 3) {
    var preProcessor = new wheel.compiler.PreProcessor({files: files});

    preProcessor.process(
        process.argv[1],
        process.argv[2],
        function(includes) {
            var outputCommands;
            try {
                outputCommands = compiler.compile(includes);
            } catch (error) {
                outputCommands = null;
                console.log(error.toString());
                if (error.location) {
                    var location = error.location;
                    console.log(location.filename + ':' + location.lineNumber);
                    console.log(location.line);
                }
            }

            if (outputCommands) {
                console.log('Assembly');
                outputCommands.logLines();
                console.log('Commands');
                outputCommands.logCommands();

                fs.writeFileSync('test.rtf', outputCommands.outputCommands());
            }
        }
    );
}

