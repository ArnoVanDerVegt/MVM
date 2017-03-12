(function() {
    var wheel = require('../utils/base.js').wheel;

    wheel(
        'VMData',
        wheel.Class(function() {
            this.init = function(opts) {
                this._opts       = opts;
                this._data       = [];
                this._stringList = [];

                for (var i = 0; i < wheel.compiler.command.REGISTER_COUNT; i++) {
                    this._data[i] = 0;
                }
            };

            this.reset = function(count) {
                var data = this._data;
                for (var i = 0; i < count; i++) {
                    data[i] = 0;
                }
            };

            this.getData = function() {
                return this._data;
            };

            /* Global */
            this.setGlobalNumber = function(offset, value) {
                this._data[offset] = value;
            };

            this.getGlobalNumber = function(offset) {
                return this._data[offset];
            };

            this.setStringList = function(stringList) {
                this._stringList = JSON.parse(JSON.stringify(stringList));
            };

            this.getStringList = function() {
                return this._stringList;
            };

            this.setGlobalConstants = function(globalConstants, stackOffset) {
                var globalData = this._data;
                for (var i = 0; i < globalConstants.length; i++) {
                    var globalConstant = globalConstants[i];
                    var offset         = globalConstant.offset;
                    var data           = globalConstant.data;
                    for (var j = 0; j < data.length; j++) {
                        globalData[offset + j] = data[j];
                    }
                }
                globalData[wheel.compiler.command.REG_STACK] = stackOffset;
            };

            this.getRecordFromAtOffset = function(recordFields) {
                var regOffsetSrc = this._data[wheel.compiler.command.REG_SRC];
                var result       = {};

                for (var i = 0; i < recordFields.length; i++) {
                    result[recordFields[i]] = this._data[regOffsetSrc + i];
                }
                return result;
            };

            this.getNumberAtRegOffset = function(value) {
                var data = this._data;
                return data[data[wheel.compiler.command.REG_SRC]];
            };

            this.setNumberAtRegOffset = function(value) {
                var data = this._data;
                console.log('------------->', value);
                console.log('prev:'+data[data[wheel.compiler.command.REG_SRC]]);
                data[data[wheel.compiler.command.REG_SRC]] = value;
                console.log('new:'+data[data[wheel.compiler.command.REG_SRC]]);
            };
        })
    );
})();