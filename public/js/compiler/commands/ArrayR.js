/**
 * Compile an array read command.
 *
 *         arrayr value, array, index
 *
 * Read an array value from a given index.
 *
**/
(function() {
    var wheel = require('../../utils/base.js').wheel;

    wheel(
        'compiler.commands.ArrayR',
        wheel.Class(wheel.compiler.commands.CommandCompiler, function(supr) {
            this.compileSrcSetupPointer = function(valueParam, arrayParam, indexParam, size) {
                var compiler       = this._compiler;
                var compilerOutput = this._compiler.getOutput();
                var compilerData   = this._compilerData;

                // De-reference the pointer, let REG_OFFSET_SRC point to the value...
                if (wheel.compiler.command.typeToLocation(arrayParam.type) === 'local') {
                    compilerOutput.add({
                        code: wheel.compiler.command.set.code,
                        params: [
                            {type: wheel.compiler.command.T_NUMBER_GLOBAL, value: wheel.compiler.command.REG_OFFSET_SRC},
                            {type: wheel.compiler.command.T_NUMBER_LOCAL,  value: arrayParam.value}
                        ]
                    });
                } else {
                    compilerOutput.add({
                        code: wheel.compiler.command.set.code,
                        params: [
                            {type: wheel.compiler.command.T_NUMBER_GLOBAL, value: wheel.compiler.command.REG_OFFSET_DEST},
                            {type: wheel.compiler.command.T_NUMBER_GLOBAL, value: wheel.compiler.command.REG_OFFSET_STACK}
                        ]
                    });
                    compilerOutput.add({
                        code: wheel.compiler.command.set.code,
                        params: [
                            {type: wheel.compiler.command.T_NUMBER_GLOBAL,   value: wheel.compiler.command.REG_OFFSET_STACK},
                            {type: wheel.compiler.command.T_NUMBER_CONSTANT, value: arrayParam.value}
                        ]
                    });
                    compilerOutput.add({
                        code: wheel.compiler.command.set.code,
                        params: [
                            {type: wheel.compiler.command.T_NUMBER_GLOBAL, value: wheel.compiler.command.REG_OFFSET_SRC},
                            {type: wheel.compiler.command.T_NUMBER_LOCAL,  value: 0}
                        ]
                    });
                    compilerOutput.add({
                        code: wheel.compiler.command.set.code,
                        params: [
                            {type: wheel.compiler.command.T_NUMBER_GLOBAL, value: wheel.compiler.command.REG_OFFSET_STACK},
                            {type: wheel.compiler.command.T_NUMBER_GLOBAL, value: wheel.compiler.command.REG_OFFSET_DEST}
                        ]
                    });
                }

                // The third parameter contains the index...
                compilerOutput.add({
                    code: wheel.compiler.command.set.code,
                    params: [
                        {type: wheel.compiler.command.T_NUMBER_GLOBAL, value: wheel.compiler.command.REG_OFFSET_DEST},
                        indexParam
                    ]
                });

                // Check if the item size is greater than 1, if so multiply with the item size...
                (size > 1) && compilerOutput.add({
                    code: wheel.compiler.command.mul.code,
                    params: [
                        {type: wheel.compiler.command.T_NUMBER_GLOBAL, value: wheel.compiler.command.REG_OFFSET_DEST},
                        {type: wheel.compiler.command.T_NUMBER_CONSTANT, value: size}
                    ]
                });

/*
                if ((arrayParam.value !== 0) && (arrayParam.metaType !== wheel.compiler.command.T_META_POINTER)) {
                    // Add the offset of the source var to the REG_OFFSET_SRC register...
                    compilerOutput.add({
                        code: wheel.compiler.command.add.code,
                        params: [
                            {type: wheel.compiler.command.T_NUMBER_GLOBAL,   value: wheel.compiler.command.REG_OFFSET_DEST},
                            {type: wheel.compiler.command.T_NUMBER_CONSTANT, value: arrayParam.value}
                        ]
                    });
                }
*/

                // pointer...
                compilerOutput.add({
                    code: wheel.compiler.command.add.code,
                    params: [
                        {type: wheel.compiler.command.T_NUMBER_GLOBAL, value: wheel.compiler.command.REG_OFFSET_SRC},
                        {type: wheel.compiler.command.T_NUMBER_GLOBAL, value: wheel.compiler.command.REG_OFFSET_DEST}
                    ]
                });
            };

            this.compileDestSetup = function(valueParam, arrayParam, indexParam, size) {
                var compiler       = this._compiler;
                var compilerOutput = this._compiler.getOutput();
                var compilerData   = this._compilerData;

                // The third parameter contains the index...
                compilerOutput.add({
                    code: wheel.compiler.command.set.code,
                    params: [
                        {type: wheel.compiler.command.T_NUMBER_GLOBAL, value: wheel.compiler.command.REG_OFFSET_SRC},
                        indexParam
                    ]
                });
                // Check if the item size is greater than 1, if so multiply with the item size...
                (size > 1) && compilerOutput.add({
                    code: wheel.compiler.command.mul.code,
                    params: [
                        {type: wheel.compiler.command.T_NUMBER_GLOBAL,   value: wheel.compiler.command.REG_OFFSET_SRC},
                        {type: wheel.compiler.command.T_NUMBER_CONSTANT, value: size}
                    ]
                });
                if (arrayParam.value !== 0) {
                    // Add the offset of the source var to the REG_OFFSET_SRC register...
                    compilerOutput.add({
                        code: wheel.compiler.command.add.code,
                        params: [
                            {type: wheel.compiler.command.T_NUMBER_GLOBAL,   value: wheel.compiler.command.REG_OFFSET_SRC},
                            {type: wheel.compiler.command.T_NUMBER_CONSTANT, value: arrayParam.value}
                        ]
                    });
                }
                if (wheel.compiler.command.typeToLocation(arrayParam.type) === 'local') {
                    compilerOutput.add({
                        code: wheel.compiler.command.add.code,
                        params: [
                            {type: wheel.compiler.command.T_NUMBER_GLOBAL, value: wheel.compiler.command.REG_OFFSET_SRC},
                            {type: wheel.compiler.command.T_NUMBER_GLOBAL, value: wheel.compiler.command.REG_OFFSET_STACK}
                        ]
                    });
                }
            };

            this.compile = function(command) {
                var compiler        = this._compiler;
                var compilerOutput  = this._compiler.getOutput();
                var compilerData    = this._compilerData;
                var size            = 1;
                var valueParam      = command.params[0];
                var arrayParam      = command.params[1];
                var indexParam      = command.params[2];

                if ((valueParam.type === wheel.compiler.command.T_STRUCT_GLOBAL) ||
                    (valueParam.type === wheel.compiler.command.T_STRUCT_LOCAL)) {
                    var valueStructName = valueParam.vr.struct.name;
                    var arrayStructName = arrayParam.vr.struct.name;
                    if (valueStructName !== arrayStructName) {
                        throw compiler.createError('Type mismatch "' + valueStructName + '" and "' + arrayStructName + '".');
                    }
                    size = valueParam.vr.struct.size;
                }

                if (valueParam.type === wheel.compiler.command.T_PROC_GLOBAL) {
                    console.log('Warning unsupported global proc.');
                } else if (valueParam.type === wheel.compiler.command.T_PROC_LOCAL) {
                    if (indexParam.type === wheel.compiler.command.T_NUMBER_CONSTANT) {
                        if (wheel.compiler.command.typeToLocation(arrayParam.type) === 'global') {
                            compilerOutput.add({
                                code: wheel.compiler.command.set.code,
                                params: [
                                    {type: wheel.compiler.command.T_NUMBER_LOCAL,  value: valueParam.value},
                                    {type: wheel.compiler.command.T_NUMBER_GLOBAL, value: arrayParam.value + indexParam.value}
                                ]
                            });
                        } else {
                            console.log('Unsupported array param location.');
                        }
                    } else {
                        console.log('Unsupported index param type.');
                    }
                } else {
                    if (arrayParam.metaType === wheel.compiler.command.T_META_POINTER) {
                        this.compileSrcSetupPointer(valueParam, arrayParam, indexParam, size);
                    } else {
                        this.compileDestSetup(valueParam, arrayParam, indexParam, size);
                    }

                    // Set the offset of the destination value...
                    compilerOutput.add({
                        code: wheel.compiler.command.set.code,
                        params: [
                            {type: wheel.compiler.command.T_NUMBER_GLOBAL,   value: wheel.compiler.command.REG_OFFSET_DEST},
                            {type: wheel.compiler.command.T_NUMBER_CONSTANT, value: valueParam.value}
                        ]
                    });
                    if (wheel.compiler.command.typeToLocation(valueParam.type) === 'local') {
                        compilerOutput.add({
                            code: wheel.compiler.command.add.code,
                            params: [
                                {type: wheel.compiler.command.T_NUMBER_GLOBAL, value: wheel.compiler.command.REG_OFFSET_DEST},
                                {type: wheel.compiler.command.T_NUMBER_GLOBAL, value: wheel.compiler.command.REG_OFFSET_STACK}
                            ]
                        });
                    }

                    compilerOutput.add({
                        code: wheel.compiler.command.copy.code,
                        params: [
                            {type: wheel.compiler.command.T_NUMBER_CONSTANT, value: size},
                            {type: wheel.compiler.command.T_NUMBER_CONSTANT, value: 0}
                        ]
                    });
                }
            };
        })
    );
})();