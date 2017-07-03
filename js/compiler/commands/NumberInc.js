(function() {
    var wheel = require('../../utils/base.js').wheel;

    wheel(
        'compiler.commands.NumberInc',
        wheel.Class(wheel.compiler.commands.NumberChange, function(supr) {
            this.compile = function(compilerOutput, validatedCommand, splitParams, params) {
                supr(this, 'compile', [compilerOutput, validatedCommand, splitParams, params, wheel.compiler.command.add.code]);
            };
        })
    );
})();