(function() {
    var wheel = require('../../utils/base.js').wheel;

    wheel(
        'compiler.commands.Label',
        wheel.Class(wheel.compiler.commands.CommandCompiler, function(supr) {
            /**
             * Check if a line starts with a label...
            **/
            this.hasLabel = function(line) {
                var i = line.indexOf(':');
                if ((line.length > 1) && (i !== -1)) {
                    return wheel.compiler.compilerHelper.validateString(line.substr(0, i));
                }
                return false;
            };

            /**
             * When the compilation is done all label addresses are known,
             * each label has a list of associated jumps, set the jump value
             * to the correct label index...
            **/
            this.updateLabels = function() {
                var compiler       = this._compiler;
                var compilerData   = this._compilerData;
                var outputCommands = compiler.getOutput().getBuffer();
                var labelList      = compilerData.getLabelList();

                for (var i in labelList) {
                    var label = labelList[i];
                    var jumps = label.jumps;
                    for (var j = 0; j < jumps.length; j++) {
                        var jump = jumps[j];
                        if (outputCommands[jump].command === 'jmpc') {
                            outputCommands[jump].params[0].value = label.index;
                        } else {
                            outputCommands[jump] = {
                                command: 'set',
                                code:    wheel.compiler.command.set.code,
                                params: [
                                    {type: wheel.compiler.command.T_NUMBER_GLOBAL,   value: wheel.compiler.command.REG_OFFSET_CODE},
                                    {type: wheel.compiler.command.T_NUMBER_CONSTANT, value: label.index}
                                ]
                            };
                        }
                    }
                }
            };

            /**
             * Collect all labels from the lines,
             * check if they are unique and create a declaration...
            **/
            this.compile = function(lines) {
                var compiler     = this._compiler;
                var compilerData = this._compilerData;
                for (var i = 0; i < lines.length; i++) {
                    this._lineNumber = i;
                    var line         = lines[i].trim();
                    var location     = {
                            filename:   this._filename,
                            lineNumber: i
                        };
                    if (this.hasLabel(line)) {
                        var j = line.indexOf(':');
                        if (compilerData.declareLabel(line.substr(0, j), location)) {
                            throw compiler.createError('Duplicate label "' + name + '".');
                        }
                    }
                }
            };
        })
    );
})();