var ArrayR = Class(CommandCompiler, function(supr) {
		this.compile = function(command, params) {
			var compiler 		= this._compiler,
				compilerData 	= this._compilerData,
				size 			= 1,
				type 			= params[0].type;
			if ((type === T_STRUCT_GLOBAL) || (type === T_STRUCT_LOCAL)) {
				var destStructName 	= params[0].vr.struct.name,
					srcStructName 	= params[1].vr.struct.name;
				if (destStructName !== srcStructName) {
					throw compiler.createError('Type mismatch "' + destStructName + '" and "' + srcStructName + '".');
				}
				size = params[0].vr.struct.size;
			}

			// Remove the third parameter which is the index and
			// add a command to move the value to the REG_OFFSET...
			compiler.getOutput().add({
				command: 	'set',
				code: 		commands.set.code,
				params: [
					{type: 	T_NUMBER_REGISTER, value: 'REG_OFFSET'},
					command.params.pop()
				]
			});
			compiler.getOutput().add({
				command: 	'set',
				code: 		commands.set.code,
				params: [
					{type: T_NUMBER_REGISTER, value: 'REG_SIZE'},
					{type: T_NUMBER_CONSTANT, value: size}
				]
			});

			// Check if the item size is greater than 1, if so multiply with the item size...
			var size = command.params[1].vr.size;
			if (size > 1) {
				compiler.getOutput().add({
					command: 	'mul',
					code: 		commands.mul.code,
					params: [
						{type: T_NUMBER_REGISTER, value: compilerData.findRegister('REG_OFFSET')},
						{type: T_NUMBER_CONSTANT, value: size}
					]
				});
			}
		};
	});