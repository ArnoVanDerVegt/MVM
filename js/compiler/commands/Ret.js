(function() {
    var wheel = require('../../utils/base.js').wheel;

    wheel(
        'compiler.commands.Ret',
        wheel.Class(wheel.compiler.commands.CommandCompiler, function(supr) {
            this.compile = function(validatedCommand, splitParams, params) {
                var compilerOutput = this._compiler.getOutput();
                var $              = wheel.compiler.command;

                compilerOutput.a($.set.code, $.DEST(),  $.LOCAL(1));
                compilerOutput.a($.set.code, $.STACK(), $.LOCAL(0));
                compilerOutput.a($.set.code, $.CODE(),  $.DEST());
            };
        })
    );
})();