(function() {
    var wheel = require('../../utils/base.js').wheel;

    wheel(
        'compiler.optimizer.OptimizeSet',
        wheel.Class(wheel.compiler.optimizer.BasicOptimizer, function(supr) {
            this.optimize = function() {
                var buffer = this._buffer;
                var length = buffer.length;

                if (length <= 1) {
                    return false;
                }
                var command1 = buffer[length - 2];
                var command2 = buffer[length - 1];
                var $        = wheel.compiler.command;

                if ((command1.code === $.CMD_SET) && this.paramsEqual(command1.params[0], command2.params[0]) &&
                    (command2.code === $.CMD_SET) && this.paramsEqual(command1.params[1], command2.params[1])) {
                    buffer.pop();
                    return true;
                }

                return false;
            };
        })
    );
})();