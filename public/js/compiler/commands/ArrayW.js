/**
 * Compile an array write command.
 *
 * 		arrayw array, index, value
 *
 * Store an item in an array at a given index.
 *
**/
wheel(
	'compiler.commands.ArrayW',
	Class(wheel.compiler.commands.CommandCompiler, function(supr) {
		this.compileDestSetup = function(arrayParam, indexParam, valueParam, size) {
			var compiler 		= this._compiler,
				compilerData 	= this._compilerData;

			// The second parameter contains the index...
			compiler.getOutput().add({
				command: 	'set',
				code: 		wheel.compiler.command.set.code,
				params: [
					{type: 	wheel.compiler.command.T_NUMBER_REGISTER, value: compilerData.findRegister('REG_OFFSET_DEST').index},
					indexParam
				]
			});
			// Check if the item size is greater than 1, if so multiply with the item size...
			(size > 1) && compiler.getOutput().add({
				command: 	'mul',
				code: 		wheel.compiler.command.mul.code,
				params: [
					{type: wheel.compiler.command.T_NUMBER_REGISTER, value: compilerData.findRegister('REG_OFFSET_DEST').index},
					{type: wheel.compiler.command.T_NUMBER_CONSTANT, value: size}
				]
			});
			if (arrayParam.value !== 0) {
				// Add the offset of the destination var to the REG_OFFSET_DEST register...
				compiler.getOutput().add({
					command: 	'add',
					code: 		wheel.compiler.command.add.code,
					params: [
						{type: wheel.compiler.command.T_NUMBER_REGISTER, value: compilerData.findRegister('REG_OFFSET_DEST').index},
						{type: wheel.compiler.command.T_NUMBER_CONSTANT, value: parseInt(arrayParam.value, 10)}
					]
				});
			}
			if (wheel.compiler.command.typeToLocation(arrayParam.type) === 'local') {
				compiler.getOutput().add({
					command: 	'add',
					code: 		wheel.compiler.command.add.code,
					params: [
						{type: wheel.compiler.command.T_NUMBER_REGISTER, value: compilerData.findRegister('REG_OFFSET_DEST').index},
						{type: wheel.compiler.command.T_NUMBER_REGISTER, value: compilerData.findRegister('REG_OFFSET_STACK').index}
					]
				});
			}
		};

		this.compileVarWrite = function(arrayParam, indexParam, valueParam, size) {
			var compiler 		= this._compiler,
				compilerData 	= this._compilerData;

			// Set the offset of the source value...
			compiler.getOutput().add({
				command: 	'set',
				code: 		wheel.compiler.command.set.code,
				params: [
					{type: wheel.compiler.command.T_NUMBER_REGISTER, value: compilerData.findRegister('REG_OFFSET_SRC').index},
					{type: wheel.compiler.command.T_NUMBER_CONSTANT, value: parseInt(valueParam.value, 10)}
				]
			});
			if (wheel.compiler.command.typeToLocation(valueParam.type) === 'local') {
				compiler.getOutput().add({
					command: 	'add',
					code: 		wheel.compiler.command.add.code,
					params: [
						{type: wheel.compiler.command.T_NUMBER_REGISTER, value: compilerData.findRegister('REG_OFFSET_SRC').index},
						{type: wheel.compiler.command.T_NUMBER_REGISTER, value: compilerData.findRegister('REG_OFFSET_STACK').index}
					]
				});
			}

			compiler.getOutput().add({
				command: 	'copy',
				code: 		wheel.compiler.command.copy.code,
				params: [
					{type: wheel.compiler.command.T_NUMBER_CONSTANT, value: size},
					{type: wheel.compiler.command.T_NUMBER_CONSTANT, value: 0}
				]
			});
		};

		this.compileConstWrite = function(arrayParam, indexParam, valueParam) {
			var compiler 		= this._compiler,
				compilerData 	= this._compilerData,
				localOffset 	= compilerData.getLocalOffset();

			if (valueParam.metaType === wheel.compiler.command.T_STRING) {
				valueParam.value = compilerData.declareString(valueParam.value);
			}
			compiler.getOutput().add({
				command: 	'set',
				code: 		wheel.compiler.command.set.code,
				params: [
					{type: wheel.compiler.command.T_NUMBER_LOCAL, 		value: localOffset},
					{type: wheel.compiler.command.T_NUMBER_CONSTANT, 	value: valueParam.value}
				]
			});
			compiler.getOutput().add({
				command: 	'set',
				code: 		wheel.compiler.command.add.code,
				params: [
					{type: wheel.compiler.command.T_NUMBER_REGISTER, value: compilerData.findRegister('REG_OFFSET_SRC').index},
					{type: wheel.compiler.command.T_NUMBER_REGISTER, value: compilerData.findRegister('REG_OFFSET_STACK').index}
				]
			});
			localOffset && compiler.getOutput().add({
				command: 	'add',
				code: 		wheel.compiler.command.add.code,
				params: [
					{type: wheel.compiler.command.T_NUMBER_REGISTER, value: compilerData.findRegister('REG_OFFSET_SRC').index},
					{type: wheel.compiler.command.T_NUMBER_CONSTANT, value: localOffset}
				]
			});

			compiler.getOutput().add({
				command: 	'copy',
				code: 		wheel.compiler.command.copy.code,
				params: [
					{type: wheel.compiler.command.T_NUMBER_CONSTANT, value: 1},
					{type: wheel.compiler.command.T_NUMBER_CONSTANT, value: 0}
				]
			});
		};

		this.compile = function(command, params) {
			var compiler 		= this._compiler,
				compilerData 	= this._compilerData,
				size 			= 1,
				arrayParam 		= params[0],
				indexParam 		= params[1],
				valueParam 		= params[2];

			if ((arrayParam.type === wheel.compiler.command.T_STRUCT_GLOBAL_ARRAY) ||
				(arrayParam.type === wheel.compiler.command.T_STRUCT_LOCAL_ARRAY)) {
				var arrayStructName 	= arrayParam.vr.struct.name,
					valueStructName 	= valueParam.vr.struct.name;
				if (arrayStructName !== valueStructName) {
					throw compiler.createError('Type mismatch "' + arrayStructName + '" and "' + valueStructName + '".');
				}
				size = valueParam.vr.struct.size;
			}

			this.compileDestSetup(arrayParam, indexParam, valueParam, size);

			if (valueParam.type === wheel.compiler.command.T_NUMBER_CONSTANT) {
				console.log('valueParam:', valueParam);
				this.compileConstWrite(arrayParam, indexParam, valueParam, size);
			} else {
				this.compileVarWrite(arrayParam, indexParam, valueParam, size);
			}
		};
	})
);
