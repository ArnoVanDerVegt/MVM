var NumberDeclaration = Class(CommandCompiler, function(supr) {
		this.compile = function(params) {
			var compiler 		= this._compiler,
				compilerData 	= this._compilerData;
			if (compiler.getActiveStruct() !== null) {
				for (var i = 0; i < params.length; i++) {
					compilerData.declareStructField(params[i], T_NUMBER_GLOBAL, T_NUMBER_GLOBAL_ARRAY);
				}
			} else if (compiler.getProcStartIndex() === -1) {
				for (var i = 0; i < params.length; i++) {
					var global = compilerData.declareGlobal(params[i], T_NUMBER_GLOBAL, T_NUMBER_GLOBAL_ARRAY, null, location, true);
					if (global.value) {
						if (global.type === T_NUMBER_GLOBAL) {
							var value = parseFloat(global.value);
							if (isNaN(value)) {
								throw compiler.createError('Number expected, found "' + value + '".');
							}
							compilerData.declareConstant(global.offset, [value]);
						} else if (global.type === T_NUMBER_GLOBAL_ARRAY) {
							var value = global.value.trim();
							compilerData.declareConstant(global.offset, compilerHelper.parseNumberArray(value, compiler));
						} else {
							throw compiler.createError('Type error.');
						}
					}
				}
			} else {
				for (var j = 0; j < params.length; j++) {
					var local = compilerData.declareLocal(params[j], T_NUMBER_LOCAL, T_NUMBER_LOCAL_ARRAY, null, true);
					if (local.value) {
						if (local.type === T_NUMBER_LOCAL) {
							var value = parseFloat(local.value);
							if (isNaN(value)) {
								throw compiler.createError('Number expected, found "' + value + '".');
							}
							compiler.getOutput().add(compiler.createCommand(
								'set',
								[
									{type: T_NUMBER_LOCAL, 		value: local.offset},
									{type: T_NUMBER_CONSTANT, 	value: value}
								]
							));
						} else if (local.type === T_NUMBER_LOCAL_ARRAY) {
							var size 	= local.size * local.length,
								offset 	= compilerData.allocateGlobal(size);
							compilerData.declareConstant(offset, compilerHelper.parseNumberArray(local.value, compiler));

							compiler.getOutput().add(compiler.createCommand(
								'set',
								[
									{type: T_NUMBER_REGISTER, value: 'REG_OFFSET_SRC'},
									{type: T_NUMBER_CONSTANT, value: offset}
								]
							));
							compiler.getOutput().add(compiler.createCommand(
								'set',
								[
									{type: T_NUMBER_REGISTER, value: 'REG_OFFSET_DEST'},
									{type: T_NUMBER_CONSTANT, value: local.offset}
								]
							));
							compiler.getOutput().add(compiler.createCommand(
								'copy_global_local',
								[
									{type: T_NUMBER_CONSTANT, value: size}
								]
							));
						} else {
							throw compiler.createError('Type error.');
						}
					}
				}
			}
		};
	});