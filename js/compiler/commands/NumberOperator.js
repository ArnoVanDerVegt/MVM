/**
 * Compile a set command.
**/
(function() {
    var wheel = require('../../utils/base.js').wheel;
    var $;

    wheel(
        'compiler.commands.NumberOperator',
        wheel.Class(wheel.compiler.commands.CommandCompiler, function(supr) {
            this.addSetStackParam1 = function(param1) {
                $ = wheel.compiler.command;
                this._compiler.getOutput().a(
                    $.set.code,
                    $.STACK(),
                    $.isLocal(param1) ? $.LOCAL(this._compilerData.getOffset(param1)) : $.GLOBAL(param1.value)
                );
            };

            this.addAddStackParam2 = function(param2, offset) {
                $ = wheel.compiler.command;
                this._compiler.getOutput().a(
                    $.isLocal(param2) ? $.add.code : $.set.code,
                    $.STACK(),
                    $.CONST(offset)
                );
            };

            this.compile = function(validatedCommand, splitParams, params, location) {
                $ = wheel.compiler.command;

                var compilerData   = this._compilerData;
                var compilerOutput = this._compiler.getOutput();
                var code           = validatedCommand.code;
                var param1         = validatedCommand.params[0];
                var param2         = validatedCommand.params[1];
                var offset;

                if ($.isStringVarMetaType(param1) || $.isStringVarMetaType(param2)) {
                    throw this._compiler.createError(wheel.compiler.error.INVALID_OPERATION_WITH_STRING, 'Invalid operation "' + param1.param + '".');
                }
                if ($.isPointerVarMetaType(param1) && $.isAddressMetaType(param2)) {
                    throw this._compiler.createError(wheel.compiler.error.INVALID_OPERATION, 'Invalid operation "' + param1.param + '".');
                }

                if ($.isPointerMetaType(param1)) {
                    offset = compilerData.getStructOffset(param1);
                    compilerOutput.a($.set.code, $.DEST(),        param2);
                    compilerOutput.a($.set.code, $.SRC(),         $.STACK());
                    this.addSetStackParam1(param1);
                    compilerOutput.a(code,       $.LOCAL(offset), $.DEST());
                    compilerOutput.a($.set.code, $.STACK(),       $.SRC());
                } else if ($.isSimpleNumberType(param1) && $.isPointerMetaType(param2)) {
                    compilerOutput.a($.set.code, $.SRC(), $.STACK());
                    this.addAddStackParam2(param2, compilerData.getOffset(param2));
                    compilerOutput.a($.set.code, $.STACK(), $.LOCAL(0));
                    compilerOutput.a($.set.code, $.DEST(),  $.LOCAL(compilerData.getStructOffset(param2)));
                    compilerOutput.a($.set.code, $.STACK(), $.SRC());
                    compilerOutput.a(code,       param1,    $.DEST());
                } else if ($.isSimpleNumberType(param1) && $.isConst(param2)) {
                    if ($.isStringConstType(param2)) {
                        throw this._compiler.createError(wheel.compiler.error.INVALID_OPERATION_WITH_STRING, 'Invalid operation "' + param2.param + '".');
                    }
                    compilerOutput.add(validatedCommand);
                } else {
                    if (wheel.compiler.command.isAddressMetaType(param2)) {
                        throw this._compiler.createError(wheel.compiler.error.INVALID_OPERATION, 'Invalid operation "' + param2.param + '".');
                    }
                    compilerOutput.add(validatedCommand);
                }
            };
        })
    );
})();