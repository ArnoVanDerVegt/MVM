(function() {
	var T_NUMBER_CONSTANT 		=  0,
		T_NUMBER_GLOBAL 		=  1,
		T_NUMBER_LOCAL			=  2,
		T_NUMBER_REGISTER		=  3,

		T_LABEL					=  4,
		T_PROC  				=  5,

		T_NUMBER_GLOBAL_ARRAY 	=  6,
		T_NUMBER_LOCAL_ARRAY	=  7,

		T_STRUCT_GLOBAL 		=  8,
		T_STRUCT_GLOBAL_ARRAY 	=  9,
		T_STRUCT_LOCAL 			= 10,
		T_STRUCT_LOCAL_ARRAY 	= 11,

		T_PROC_GLOBAL 			= 12,
		T_PROC_GLOBAL_ARRAY		= 13,
		T_PROC_LOCAL 			= 14,
		T_PROC_LOCAL_ARRAY 		= 15,

		T_STRING 				= 16,

		NO_PARAM_COMMANDS 		=  0,
		SINGLE_PARAM_COMMANDS 	= 17;

	wheel(
		'compiler.command',
		{
			// Commands without parameters...
			ret: {
				code: 0,
			},

			// Commands with a single parameter...
			inc: {
				code: 1,
				args: [
					{type: T_NUMBER_GLOBAL},
					{type: T_NUMBER_LOCAL},
					{type: T_NUMBER_REGISTER},
				]
			},
			dec: {
				code: 2,
				args: [
					{type: T_NUMBER_GLOBAL},
					{type: T_NUMBER_LOCAL},
					{type: T_NUMBER_REGISTER},
				]
			},
			abs: {
				code: 3,
				args: [
					{type: T_NUMBER_GLOBAL},
					{type: T_NUMBER_LOCAL},
					{type: T_NUMBER_REGISTER},
				]
			},
			neg: {
				code: 4,
				args: [
					{type: T_NUMBER_GLOBAL},
					{type: T_NUMBER_LOCAL},
					{type: T_NUMBER_REGISTER},
				]
			},
			round: {
				code: 5,
				args: [
					{type: T_NUMBER_GLOBAL},
					{type: T_NUMBER_LOCAL},
					{type: T_NUMBER_REGISTER},
				]
			},
			floor: {
				code: 6,
				args: [
					{type: T_NUMBER_GLOBAL},
					{type: T_NUMBER_LOCAL},
					{type: T_NUMBER_REGISTER},
				]
			},
			ceil: {
				code: 7,
				args: [
					{type: T_NUMBER_GLOBAL},
					{type: T_NUMBER_LOCAL},
					{type: T_NUMBER_REGISTER},
				]
			},
			copy: {
				code: 8,
				args: [
					{type: T_NUMBER_CONSTANT}
				]
			},
			jmp: {
				code: 9,
				args: [
					{type: T_LABEL}
				]
			},
			je: {
				code: 10,
				args: [
					{type: T_LABEL}
				]
			},
			jne: {
				cde: 11,
				args: [
					{type: T_LABEL}
				]
			},
			jl: {
				code: 12,
				args: [
					{type: T_LABEL}
				]
			},
			jle: {
				code: 13,
				args: [
					{type: T_LABEL}
				]
			},
			jg: {
				code: 14,
				args: [
					{type: T_LABEL}
				]
			},
			jge: {
				code: 15,
				args: [
					{type: T_LABEL}
				]
			},
			call: {
				code: 16
			},
			call_var: {
				code: 17,
				args: [
					{type: T_PROC_LOCAL},
					{type: T_PROC_GLOBAL}
				]
			},
			// Commands with 2 parameters...
			set: {
				code: 18,
				args: [
					{
						type: T_NUMBER_GLOBAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER},
							{type: T_PROC}
						]
					},
					{
						type: T_NUMBER_LOCAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER},
							{type: T_PROC}
						]
					},
					{
						type: T_NUMBER_REGISTER,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_PROC_GLOBAL,
						args: [
							{type: T_PROC_GLOBAL},
							{type: T_PROC_LOCAL},
							{type: T_PROC}
						]
					},
					{
						type: T_PROC_LOCAL,
						args: [
							{type: T_PROC_GLOBAL},
							{type: T_PROC_LOCAL},
							{type: T_PROC}
						]
					}
				]
			},
			add: {
				code: 19,
				args: [
					{
						type: T_NUMBER_GLOBAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_NUMBER_LOCAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_NUMBER_REGISTER,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
				]
			},
			sub: {
				code: 20,
				args: [
					{
						type: T_NUMBER_GLOBAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_NUMBER_LOCAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_NUMBER_REGISTER,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
				]
			},
			mul: {
				code: 21,
				args: [
					{
						type: T_NUMBER_GLOBAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_NUMBER_LOCAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_NUMBER_REGISTER,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
				]
			},
			div: {
				code: 22,
				args: [
					{
						type: T_NUMBER_GLOBAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_NUMBER_LOCAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_NUMBER_REGISTER,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
				]
			},
			mod: {
				code: 23,
				args: [
					{
						type: T_NUMBER_GLOBAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_NUMBER_LOCAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_NUMBER_REGISTER,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
				]
			},
			and: {
				code: 24,
				args: [
					{
						type: T_NUMBER_GLOBAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_NUMBER_LOCAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_NUMBER_REGISTER,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
				]
			},
			or: {
				code: 25,
				args: [
					{
						type: T_NUMBER_GLOBAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_NUMBER_LOCAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_NUMBER_REGISTER,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
				]
			},

			// Compare, loop...
			cmp: {
				code: 26,
				args: [
					{
						type: T_NUMBER_GLOBAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_NUMBER_LOCAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_NUMBER_REGISTER,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
				]
			},
			loop: {
				code: 27,
				args: [
					{
						type: T_NUMBER_GLOBAL,
						args: [
							{type: T_LABEL}
						]
					},
					{
						type: T_NUMBER_LOCAL,
						args: [
							{type: T_LABEL}
						]
					},
					{
						type: T_NUMBER_REGISTER,
						args: [
							{type: T_LABEL}
						]
					},
				]
			},
			module: {
				code: 28,
				args: [
					{
						type: T_NUMBER_CONSTANT,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_NUMBER_GLOBAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_NUMBER_LOCAL,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
					{
						type: T_NUMBER_REGISTER,
						args: [
							{type: T_NUMBER_CONSTANT},
							{type: T_NUMBER_GLOBAL},
							{type: T_NUMBER_LOCAL},
							{type: T_NUMBER_REGISTER}
						]
					},
				]
			},

			// The following commands are compiled into smaller commands with less parameters...
			addr: {
				code: 1024,
				args: [
					{type: T_NUMBER_GLOBAL},
					{type: T_NUMBER_LOCAL},
					{type: T_NUMBER_REGISTER},
					{type: T_NUMBER_GLOBAL_ARRAY},
					{type: T_NUMBER_LOCAL_ARRAY},
					{type: T_STRUCT_GLOBAL},
					{type: T_STRUCT_GLOBAL_ARRAY},
					{type: T_STRUCT_LOCAL},
					{type: T_STRUCT_LOCAL_ARRAY}
				]
			},

			// Array functions
			arrayr: { // Array read...
				code: 1025,
				args: [
					{
						type: T_NUMBER_GLOBAL,
						args: [
							{
								type: T_NUMBER_LOCAL_ARRAY,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER}
								]
							},
							{
								type: T_NUMBER_GLOBAL_ARRAY,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER}
								]
							}
						]
					},
					{
						type: T_NUMBER_LOCAL,
						args: [
							{
								type: T_NUMBER_LOCAL_ARRAY,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER}
								]
							},
							{
								type: T_NUMBER_GLOBAL_ARRAY,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER}
								]
							}
						]
					},
					{
						type: T_NUMBER_REGISTER,
						args: [
							{
								type: T_NUMBER_LOCAL_ARRAY,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER}
								]
							},
							{
								type: T_NUMBER_GLOBAL_ARRAY,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER}
								]
							}
						]
					},
					{
						type: T_STRUCT_GLOBAL,
						args: [
							{
								type: T_STRUCT_LOCAL_ARRAY,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER}
								]
							},
							{
								type: T_STRUCT_GLOBAL_ARRAY,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER}
								]
							}
						]
					},
					{
						type: T_STRUCT_LOCAL,
						args: [
							{
								type: T_STRUCT_LOCAL_ARRAY,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER}
								]
							},
							{
								type: T_STRUCT_GLOBAL_ARRAY,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER}
								]
							}
						]
					},
					{
						type: T_PROC_GLOBAL,
						args: [
							{
								type: T_PROC_LOCAL_ARRAY,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER}
								]
							},
							{
								type: T_PROC_GLOBAL_ARRAY,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER}
								]
							}
						]
					},
					{
						type: T_PROC_LOCAL,
						args: [
							{
								type: T_PROC_LOCAL_ARRAY,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER}
								]
							},
							{
								type: T_PROC_GLOBAL_ARRAY,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER}
								]
							}
						]
					}
				]
			},

			arrayw: { // Array write...
				code: 1026,
				args: [
					{
						type: T_NUMBER_LOCAL_ARRAY,
						args: [
							{
								type: T_NUMBER_CONSTANT,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER},
									{type: T_PROC},
									{type: T_PROC_GLOBAL},
									{type: T_PROC_LOCAL}
								]
							},
							{
								type: T_NUMBER_GLOBAL,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER},
									{type: T_PROC},
									{type: T_PROC_GLOBAL},
									{type: T_PROC_LOCAL}
								]
							},
							{
								type: T_NUMBER_LOCAL,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER},
									{type: T_PROC},
									{type: T_PROC_GLOBAL},
									{type: T_PROC_LOCAL}
								]
							},
							{
								type: T_NUMBER_REGISTER,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER},
									{type: T_PROC},
									{type: T_PROC_GLOBAL},
									{type: T_PROC_LOCAL}
								]
							}
						]
					},
					{
						type: T_NUMBER_GLOBAL_ARRAY,
						args: [
							{
								type: T_NUMBER_CONSTANT,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER},
									{type: T_PROC},
									{type: T_PROC_GLOBAL},
									{type: T_PROC_LOCAL}
								]
							},
							{
								type: T_NUMBER_GLOBAL,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER},
									{type: T_PROC},
									{type: T_PROC_GLOBAL},
									{type: T_PROC_LOCAL}
								]
							},
							{
								type: T_NUMBER_LOCAL,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER},
									{type: T_PROC},
									{type: T_PROC_GLOBAL},
									{type: T_PROC_LOCAL}
								]
							},
							{
								type: T_NUMBER_REGISTER,
								args: [
									{type: T_NUMBER_CONSTANT},
									{type: T_NUMBER_GLOBAL},
									{type: T_NUMBER_LOCAL},
									{type: T_NUMBER_REGISTER},
									{type: T_PROC},
									{type: T_PROC_GLOBAL},
									{type: T_PROC_LOCAL}
								]
							}
						]
					},
					{
						type: T_STRUCT_GLOBAL_ARRAY,
						args: [
							{
								type: T_NUMBER_CONSTANT,
								args: [
									{type: T_STRUCT_GLOBAL},
									{type: T_STRUCT_LOCAL}
								]
							},
							{
								type: T_NUMBER_GLOBAL,
								args: [
									{type: T_STRUCT_GLOBAL},
									{type: T_STRUCT_LOCAL}
								]
							},
							{
								type: T_NUMBER_LOCAL,
								args: [
									{type: T_STRUCT_GLOBAL},
									{type: T_STRUCT_LOCAL}
								]
							},
							{
								type: T_NUMBER_REGISTER,
								args: [
									{type: T_STRUCT_GLOBAL},
									{type: T_STRUCT_LOCAL}
								]
							}
						]
					},
					{
						type: T_STRUCT_LOCAL_ARRAY,
						args: [
							{
								type: T_NUMBER_CONSTANT,
								args: [
									{type: T_STRUCT_GLOBAL},
									{type: T_STRUCT_LOCAL}
								]
							},
							{
								type: T_NUMBER_GLOBAL,
								args: [
									{type: T_STRUCT_GLOBAL},
									{type: T_STRUCT_LOCAL}
								]
							},
							{
								type: T_NUMBER_LOCAL,
								args: [
									{type: T_STRUCT_GLOBAL},
									{type: T_STRUCT_LOCAL}
								]
							},
							{
								type: T_NUMBER_REGISTER,
								args: [
									{type: T_STRUCT_GLOBAL},
									{type: T_STRUCT_LOCAL}
								]
							}
						]
					},
					{
						type: T_PROC_GLOBAL_ARRAY,
						args: [
							{
								type: T_NUMBER_CONSTANT,
								args: [
									{type: T_PROC_GLOBAL},
									{type: T_PROC_LOCAL},
									{type: T_PROC}
								]
							},
							{
								type: T_NUMBER_GLOBAL,
								args: [
									{type: T_PROC_GLOBAL},
									{type: T_PROC_LOCAL},
									{type: T_PROC}
								]
							},
							{
								type: T_NUMBER_LOCAL,
								args: [
									{type: T_PROC_GLOBAL},
									{type: T_PROC_LOCAL},
									{type: T_PROC}
								]
							},
							{
								type: T_NUMBER_REGISTER,
								args: [
									{type: T_PROC_GLOBAL},
									{type: T_PROC_LOCAL},
									{type: T_PROC}
								]
							}
						]
					},
					{
						type: T_PROC_LOCAL_ARRAY,
						args: [
							{
								type: T_NUMBER_CONSTANT,
								args: [
									{type: T_PROC_GLOBAL},
									{type: T_PROC_LOCAL},
									{type: T_PROC}
								]
							},
							{
								type: T_NUMBER_GLOBAL,
								args: [
									{type: T_PROC_GLOBAL},
									{type: T_PROC_LOCAL},
									{type: T_PROC}
								]
							},
							{
								type: T_NUMBER_LOCAL,
								args: [
									{type: T_PROC_GLOBAL},
									{type: T_PROC_LOCAL},
									{type: T_PROC}
								]
							},
							{
								type: T_NUMBER_REGISTER,
								args: [
									{type: T_PROC_GLOBAL},
									{type: T_PROC_LOCAL},
									{type: T_PROC}
								]
							}
						]
					}
				]
			}
		}
	);

	wheel('compiler.command.T_NUMBER_CONSTANT', 	T_NUMBER_CONSTANT);
	wheel('compiler.command.T_NUMBER_GLOBAL', 		T_NUMBER_GLOBAL);
	wheel('compiler.command.T_NUMBER_LOCAL',		T_NUMBER_LOCAL);
	wheel('compiler.command.T_NUMBER_REGISTER',		T_NUMBER_REGISTER);
	wheel('compiler.command.T_PROC',  				T_PROC);
	wheel('compiler.command.T_LABEL',				T_LABEL);

	wheel('compiler.command.T_NUMBER_GLOBAL_ARRAY', T_NUMBER_GLOBAL_ARRAY);
	wheel('compiler.command.T_NUMBER_LOCAL_ARRAY',	T_NUMBER_LOCAL_ARRAY);

	wheel('compiler.command.T_STRUCT_GLOBAL', 		T_STRUCT_GLOBAL);
	wheel('compiler.command.T_STRUCT_GLOBAL_ARRAY',	T_STRUCT_GLOBAL_ARRAY);
	wheel('compiler.command.T_STRUCT_LOCAL', 		T_STRUCT_LOCAL);
	wheel('compiler.command.T_STRUCT_LOCAL_ARRAY', 	T_STRUCT_LOCAL_ARRAY);

	wheel('compiler.command.T_PROC_GLOBAL', 		T_PROC_GLOBAL);
	wheel('compiler.command.T_PROC_GLOBAL_ARRAY',	T_PROC_GLOBAL_ARRAY);
	wheel('compiler.command.T_PROC_LOCAL', 			T_PROC_LOCAL);
	wheel('compiler.command.T_PROC_LOCAL_ARRAY', 	T_PROC_LOCAL_ARRAY);

	wheel('compiler.command.T_STRING', 				T_STRING);

	wheel('compiler.command.NO_PARAM_COMMANDS', 	NO_PARAM_COMMANDS);
	wheel('compiler.command.SINGLE_PARAM_COMMANDS',	SINGLE_PARAM_COMMANDS);

	wheel(
		'compiler.command.typeToLocation',
		function(type) {
			var result = '';
			switch (type) {
				case T_NUMBER_CONSTANT: 	result = 'const';	break;
				case T_NUMBER_GLOBAL: 		result = 'global';	break;
				case T_NUMBER_GLOBAL_ARRAY:	result = 'global';	break;
				case T_NUMBER_LOCAL: 		result = 'local';	break;
				case T_NUMBER_LOCAL_ARRAY: 	result = 'local';	break;
				case T_NUMBER_REGISTER: 	result = 'reg';		break;

				case T_STRUCT_GLOBAL:		result = 'global';	break;
				case T_STRUCT_GLOBAL_ARRAY:	result = 'global';	break;
				case T_STRUCT_LOCAL: 		result = 'local';	break;
				case T_STRUCT_LOCAL_ARRAY: 	result = 'local';	break;

				case T_PROC_GLOBAL:			result = 'global';	break;
				case T_PROC_GLOBAL_ARRAY:	result = 'global';	break;
				case T_PROC_LOCAL:			result = 'local';	break;
				case T_PROC_LOCAL_ARRAY: 	result = 'local';	break;
			}
			return result;
		}
	);
})();