(function() {
    var wheel = require('../utils/base.js').wheel;

    var T_NUM_C                 =  0;
    var T_NUM_G                 =  1;
    var T_NUM_L                 =  2;

    var T_LABEL                 =  4;
    var T_PROC                  =  5;

    var T_NUM_G_ARRAY           =  6;
    var T_NUM_L_ARRAY           =  7;

    var T_STRUCT_G              =  8;
    var T_STRUCT_G_ARRAY        =  9;
    var T_STRUCT_L              = 10;
    var T_STRUCT_L_ARRAY        = 11;

    var T_PROC_G                = 12;
    var T_PROC_G_ARRAY          = 13;
    var T_PROC_L                = 14;
    var T_PROC_L_ARRAY          = 15;

    var T_META_STRING           =  1;
    var T_META_POINTER          =  2;
    var T_META_ADDRESS          =  3;

    var SINGLE_PARAM_COMMANDS   =  0;

    var FLAG_EQUAL              =  1;
    var FLAG_NOT_EQUAL          =  2;
    var FLAG_LESS               =  4;
    var FLAG_LESS_EQUAL         =  8;
    var FLAG_GREATER            = 16;
    var FLAG_GREATER_EQUAL      = 32;

    var REG_STACK               =  0;
    var REG_SRC                 =  1;
    var REG_DEST                =  2;
    var REG_CODE                =  3;
    var REG_RETURN              =  4;
    var REG_FLAGS               =  5;

    var REGISTER_COUNT          =  6;

    wheel(
        'compiler.command',
        {
            copy: {
                code: 0,
                args: [
                    {type: T_NUM_C}
                ]
            },
            jmpc: {
                code: 1,
                args: [
                    {
                        type: T_LABEL,
                        args: [
                            {type: T_NUM_C}
                        ]
                    }
                ]
            },
            cmp: {
                code: 2,
                args: [
                    {
                        type: T_NUM_G,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    },
                    {
                        type: T_NUM_L,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    }
                ]
            },
            module: {
                code: 3,
                args: [
                    {
                        type: T_NUM_C,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    },
                    {
                        type: T_NUM_G,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    },
                    {
                        type: T_NUM_L,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    }
                ]
            },

            /* Operators */
            set: {
                code: 4,
                args: [
                    {
                        type: T_NUM_G,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L},
                            {type: T_PROC}
                        ]
                    },
                    {
                        type: T_NUM_L,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L},
                            {type: T_PROC}
                        ]
                    },
                    {
                        type: T_PROC_G,
                        args: [
                            {type: T_PROC_G},
                            {type: T_PROC_L},
                            {type: T_PROC}
                        ]
                    },
                    {
                        type: T_PROC_L,
                        args: [
                            {type: T_PROC_G},
                            {type: T_PROC_L},
                            {type: T_PROC}
                        ]
                    },
                    {
                        type:     T_STRUCT_L,
                        metaType: T_META_POINTER,
                        args: [
                            {type: T_STRUCT_G, metaType: T_META_POINTER},
                            {type: T_STRUCT_G, metaType: T_META_ADDRESS},
                            {type: T_STRUCT_L, metaType: T_META_POINTER},
                            {type: T_STRUCT_L, metaType: T_META_ADDRESS}
                        ]
                    },
                    {
                        type:     T_STRUCT_G,
                        metaType: T_META_POINTER,
                        args: [
                            {type: T_STRUCT_G, metaType: T_META_POINTER},
                            {type: T_STRUCT_G, metaType: T_META_ADDRESS},
                            {type: T_STRUCT_L, metaType: T_META_POINTER},
                            {type: T_STRUCT_L, metaType: T_META_ADDRESS}
                        ]
                    },
                    {
                        type:     T_STRUCT_G_ARRAY,
                        metaType: T_META_POINTER,
                        args: [
                            {type: T_STRUCT_G_ARRAY, metaType: T_META_POINTER},
                            {type: T_STRUCT_G_ARRAY, metaType: T_META_ADDRESS},
                            {type: T_STRUCT_L_ARRAY, metaType: T_META_POINTER},
                            {type: T_STRUCT_L_ARRAY, metaType: T_META_ADDRESS},
                        ]
                    },
                    {
                        type:     T_STRUCT_L_ARRAY,
                        metaType: T_META_POINTER,
                        args: [
                            {type: T_STRUCT_G_ARRAY, metaType: T_META_POINTER},
                            {type: T_STRUCT_G_ARRAY, metaType: T_META_ADDRESS},
                            {type: T_STRUCT_L_ARRAY, metaType: T_META_POINTER},
                            {type: T_STRUCT_L_ARRAY, metaType: T_META_ADDRESS},
                        ]
                    }
                ]
            },
            add: {
                code: 5,
                args: [
                    {
                        type: T_NUM_G,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    },
                    {
                        type: T_NUM_L,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    }
                ]
            },
            sub: {
                code: 6,
                args: [
                    {
                        type: T_NUM_G,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    },
                    {
                        type: T_NUM_L,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    }
                ]
            },
            mul: {
                code: 7,
                args: [
                    {
                        type: T_NUM_G,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    },
                    {
                        type: T_NUM_L,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    }
                ]
            },
            div: {
                code: 8,
                args: [
                    {
                        type: T_NUM_G,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    },
                    {
                        type: T_NUM_L,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    }
                ]
            },
            mod: {
                code: 9,
                args: [
                    {
                        type: T_NUM_G,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    },
                    {
                        type: T_NUM_L,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    }
                ]
            },
            and: {
                code: 10,
                args: [
                    {
                        type: T_NUM_G,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    },
                    {
                        type: T_NUM_L,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    }
                ]
            },
            or: {
                code: 11,
                args: [
                    {
                        type: T_NUM_G,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    },
                    {
                        type: T_NUM_L,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    }
                ]
            },
            xor: {
                code: 12,
                args: [
                    {
                        type: T_NUM_G,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    },
                    {
                        type: T_NUM_L,
                        args: [
                            {type: T_NUM_C},
                            {type: T_NUM_G},
                            {type: T_NUM_L}
                        ]
                    }
                ]
            },

            // The following commands are compiled into smaller commands with less parameters...
            inc: {
                code: 1024,
                args: [
                    {type: T_NUM_G},
                    {type: T_NUM_L}
                ]
            },
            dec: {
                code: 1025,
                args: [
                    {type: T_NUM_G},
                    {type: T_NUM_L}
                ]
            },
            // Jump...
            jmp: {
                code: 1026,
                args: [
                    {type: T_LABEL}
                ]
            },
            // Contitional jumps...
            je: {
                code: 1031,
                args: [
                    {type: T_LABEL}
                ]
            },
            jne: {
                cde: 1032,
                args: [
                    {type: T_LABEL}
                ]
            },
            jl: {
                code: 1033,
                args: [
                    {type: T_LABEL}
                ]
            },
            jle: {
                code: 1034,
                args: [
                    {type: T_LABEL}
                ]
            },
            jg: {
                code: 1035,
                args: [
                    {type: T_LABEL}
                ]
            },
            jge: {
                code: 1036,
                args: [
                    {type: T_LABEL}
                ]
            },
            // Address...
            addr: {
                code: 1037,
                args: [
                    {type: T_NUM_G},
                    {type: T_NUM_L},
                    {type: T_NUM_G_ARRAY},
                    {type: T_NUM_L_ARRAY},
                    {type: T_STRUCT_G},
                    {type: T_STRUCT_G_ARRAY},
                    {type: T_STRUCT_L},
                    {type: T_STRUCT_L_ARRAY}
                ]
            },
            // Array functions
            arrayr: { // Array read...
                code: 1038,
                args: [
                    {
                        type: T_NUM_G,
                        args: [
                            {
                                type: T_NUM_L_ARRAY,
                                args: [
                                    {type: T_NUM_C},
                                    {type: T_NUM_G},
                                    {type: T_NUM_L}
                                ]
                            },
                            {
                                type: T_NUM_G_ARRAY,
                                args: [
                                    {type: T_NUM_C},
                                    {type: T_NUM_G},
                                    {type: T_NUM_L}
                                ]
                            }
                        ]
                    },
                    {
                        type: T_NUM_L,
                        args: [
                            {
                                type: T_NUM_L_ARRAY,
                                args: [
                                    {type: T_NUM_C},
                                    {type: T_NUM_G},
                                    {type: T_NUM_L}
                                ]
                            },
                            {
                                type: T_NUM_G_ARRAY,
                                args: [
                                    {type: T_NUM_C},
                                    {type: T_NUM_G},
                                    {type: T_NUM_L}
                                ]
                            }
                        ]
                    },
                    {
                        type: T_STRUCT_G,
                        args: [
                            {
                                type: T_STRUCT_L_ARRAY,
                                args: [
                                    {type: T_NUM_C},
                                    {type: T_NUM_G},
                                    {type: T_NUM_L}
                                ]
                            },
                            {
                                type: T_STRUCT_G_ARRAY,
                                args: [
                                    {type: T_NUM_C},
                                    {type: T_NUM_G},
                                    {type: T_NUM_L}
                                ]
                            }
                        ]
                    },
                    {
                        type: T_STRUCT_L,
                        args: [
                            {
                                type: T_STRUCT_L_ARRAY,
                                args: [
                                    {type: T_NUM_C},
                                    {type: T_NUM_G},
                                    {type: T_NUM_L}
                                ]
                            },
                            {
                                type: T_STRUCT_G_ARRAY,
                                args: [
                                    {type: T_NUM_C},
                                    {type: T_NUM_G},
                                    {type: T_NUM_L}
                                ]
                            }
                        ]
                    },
                    {
                        type: T_PROC_G,
                        args: [
                            {
                                type: T_PROC_L_ARRAY,
                                args: [
                                    {type: T_NUM_C},
                                    {type: T_NUM_G},
                                    {type: T_NUM_L}
                                ]
                            },
                            {
                                type: T_PROC_G_ARRAY,
                                args: [
                                    {type: T_NUM_C},
                                    {type: T_NUM_G},
                                    {type: T_NUM_L}
                                ]
                            }
                        ]
                    },
                    {
                        type: T_PROC_L,
                        args: [
                            {
                                type: T_PROC_L_ARRAY,
                                args: [
                                    {type: T_NUM_C},
                                    {type: T_NUM_G},
                                    {type: T_NUM_L}
                                ]
                            },
                            {
                                type: T_PROC_G_ARRAY,
                                args: [
                                    {type: T_NUM_C},
                                    {type: T_NUM_G},
                                    {type: T_NUM_L}
                                ]
                            }
                        ]
                    }
                ]
            },
            arrayw: { // Array write...
                code: 1039,
                args: [
                    {
                        type: T_NUM_L_ARRAY,
                        args: [
                            {
                                type: T_NUM_C,
                                args: [
                                    {type: T_NUM_C},
                                    {type: T_NUM_G},
                                    {type: T_NUM_L},
                                    {type: T_PROC},
                                    {type: T_PROC_G},
                                    {type: T_PROC_L}
                                ]
                            },
                            {
                                type: T_NUM_G,
                                args: [
                                    {type: T_NUM_C},
                                    {type: T_NUM_G},
                                    {type: T_NUM_L},
                                    {type: T_PROC},
                                    {type: T_PROC_G},
                                    {type: T_PROC_L}
                                ]
                            },
                            {
                                type: T_NUM_L,
                                args: [
                                    {type: T_NUM_C},
                                    {type: T_NUM_G},
                                    {type: T_NUM_L},
                                    {type: T_PROC},
                                    {type: T_PROC_G},
                                    {type: T_PROC_L}
                                ]
                            }
                        ]
                    },
                    {
                        type: T_NUM_G_ARRAY,
                        args: [
                            {
                                type: T_NUM_C,
                                args: [
                                    {type: T_NUM_C},
                                    {type: T_NUM_G},
                                    {type: T_NUM_L},
                                    {type: T_PROC},
                                    {type: T_PROC_G},
                                    {type: T_PROC_L}
                                ]
                            },
                            {
                                type: T_NUM_G,
                                args: [
                                    {type: T_NUM_C},
                                    {type: T_NUM_G},
                                    {type: T_NUM_L},
                                    {type: T_PROC},
                                    {type: T_PROC_G},
                                    {type: T_PROC_L}
                                ]
                            },
                            {
                                type: T_NUM_L,
                                args: [
                                    {type: T_NUM_C},
                                    {type: T_NUM_G},
                                    {type: T_NUM_L},
                                    {type: T_PROC},
                                    {type: T_PROC_G},
                                    {type: T_PROC_L}
                                ]
                            }
                        ]
                    },
                    {
                        type: T_STRUCT_G_ARRAY,
                        args: [
                            {
                                type: T_NUM_C,
                                args: [
                                    {type: T_STRUCT_G},
                                    {type: T_STRUCT_L}
                                ]
                            },
                            {
                                type: T_NUM_G,
                                args: [
                                    {type: T_STRUCT_G},
                                    {type: T_STRUCT_L}
                                ]
                            },
                            {
                                type: T_NUM_L,
                                args: [
                                    {type: T_STRUCT_G},
                                    {type: T_STRUCT_L}
                                ]
                            }
                        ]
                    },
                    {
                        type: T_STRUCT_L_ARRAY,
                        args: [
                            {
                                type: T_NUM_C,
                                args: [
                                    {type: T_STRUCT_G},
                                    {type: T_STRUCT_L}
                                ]
                            },
                            {
                                type: T_NUM_G,
                                args: [
                                    {type: T_STRUCT_G},
                                    {type: T_STRUCT_L}
                                ]
                            },
                            {
                                type: T_NUM_L,
                                args: [
                                    {type: T_STRUCT_G},
                                    {type: T_STRUCT_L}
                                ]
                            }
                        ]
                    },
                    {
                        type: T_PROC_G_ARRAY,
                        args: [
                            {
                                type: T_NUM_C,
                                args: [
                                    {type: T_PROC_G},
                                    {type: T_PROC_L},
                                    {type: T_PROC}
                                ]
                            },
                            {
                                type: T_NUM_G,
                                args: [
                                    {type: T_PROC_G},
                                    {type: T_PROC_L},
                                    {type: T_PROC}
                                ]
                            },
                            {
                                type: T_NUM_L,
                                args: [
                                    {type: T_PROC_G},
                                    {type: T_PROC_L},
                                    {type: T_PROC}
                                ]
                            }
                        ]
                    },
                    {
                        type: T_PROC_L_ARRAY,
                        args: [
                            {
                                type: T_NUM_C,
                                args: [
                                    {type: T_PROC_G},
                                    {type: T_PROC_L},
                                    {type: T_PROC}
                                ]
                            },
                            {
                                type: T_NUM_G,
                                args: [
                                    {type: T_PROC_G},
                                    {type: T_PROC_L},
                                    {type: T_PROC}
                                ]
                            },
                            {
                                type: T_NUM_L,
                                args: [
                                    {type: T_PROC_G},
                                    {type: T_PROC_L},
                                    {type: T_PROC}
                                ]
                            }
                        ]
                    }
                ]
            },
            // Loops...
            'return': {
                code: 1042,
                args: [
                    {type: T_NUM_C},
                    {type: T_NUM_G},
                    {type: T_NUM_L},
                    {type: T_PROC},
                    {type: T_PROC_G},
                    {type: T_PROC_L}
                ]
            }
        }
    );

    wheel('compiler.command.T_NUM_C',               T_NUM_C);
    wheel('compiler.command.T_NUM_G',               T_NUM_G);
    wheel('compiler.command.T_NUM_L',               T_NUM_L);
    wheel('compiler.command.T_PROC',                T_PROC);
    wheel('compiler.command.T_LABEL',               T_LABEL);

    wheel('compiler.command.T_NUM_G_ARRAY',         T_NUM_G_ARRAY);
    wheel('compiler.command.T_NUM_L_ARRAY',         T_NUM_L_ARRAY);

    wheel('compiler.command.T_STRUCT_G',            T_STRUCT_G);
    wheel('compiler.command.T_STRUCT_G_ARRAY',      T_STRUCT_G_ARRAY);
    wheel('compiler.command.T_STRUCT_L',            T_STRUCT_L);
    wheel('compiler.command.T_STRUCT_L_ARRAY',      T_STRUCT_L_ARRAY);

    wheel('compiler.command.T_PROC_G',              T_PROC_G);
    wheel('compiler.command.T_PROC_G_ARRAY',        T_PROC_G_ARRAY);
    wheel('compiler.command.T_PROC_L',              T_PROC_L);
    wheel('compiler.command.T_PROC_L_ARRAY',        T_PROC_L_ARRAY);

    wheel('compiler.command.T_META_STRING',         T_META_STRING);
    wheel('compiler.command.T_META_POINTER',        T_META_POINTER);
    wheel('compiler.command.T_META_ADDRESS',        T_META_ADDRESS);

    wheel('compiler.command.SINGLE_PARAM_COMMANDS', SINGLE_PARAM_COMMANDS);

    wheel('compiler.command.FLAG_EQUAL',            FLAG_EQUAL);
    wheel('compiler.command.FLAG_NOT_EQUAL',        FLAG_NOT_EQUAL);
    wheel('compiler.command.FLAG_LESS',             FLAG_LESS);
    wheel('compiler.command.FLAG_LESS_EQUAL',       FLAG_LESS_EQUAL);
    wheel('compiler.command.FLAG_GREATER',          FLAG_GREATER);
    wheel('compiler.command.FLAG_GREATER_EQUAL',    FLAG_GREATER_EQUAL);

    wheel('compiler.command.REG_STACK',             REG_STACK);
    wheel('compiler.command.REG_SRC',               REG_SRC);
    wheel('compiler.command.REG_DEST',              REG_DEST);
    wheel('compiler.command.REG_CODE',              REG_CODE);
    wheel('compiler.command.REG_RETURN',            REG_RETURN);
    wheel('compiler.command.REG_FLAGS',             REG_FLAGS);

    wheel('compiler.command.STACK',                 function()       { return {type: T_NUM_G, value: REG_STACK  }});
    wheel('compiler.command.SRC',                   function()       { return {type: T_NUM_G, value: REG_SRC    }});
    wheel('compiler.command.DEST',                  function()       { return {type: T_NUM_G, value: REG_DEST   }});
    wheel('compiler.command.CODE',                  function()       { return {type: T_NUM_G, value: REG_CODE   }});
    wheel('compiler.command.RETURN',                function()       { return {type: T_NUM_G, value: REG_RETURN }});
    wheel('compiler.command.FLAGS',                 function()       { return {type: T_NUM_G, value: REG_FLAGS  }});
    wheel('compiler.command.CONST',                 function(v)      { return {type: T_NUM_C, value: v }});
    wheel('compiler.command.LOCAL',                 function(offset) { return {type: T_NUM_L, value: offset }});

    wheel('compiler.command.REGISTER_COUNT',        REGISTER_COUNT);

    wheel(
        'compiler.command.typeToLocation',
        function(type) {
            var result = '';
            switch (type) {
                case T_NUM_C:           result = 'const';    break;
                case T_NUM_G:           result = 'global';   break;
                case T_NUM_G_ARRAY:     result = 'global';   break;
                case T_NUM_L:           result = 'local';    break;
                case T_NUM_L_ARRAY:     result = 'local';    break;

                case T_STRUCT_G:        result = 'global';   break;
                case T_STRUCT_G_ARRAY:  result = 'global';   break;
                case T_STRUCT_L:        result = 'local';    break;
                case T_STRUCT_L_ARRAY:  result = 'local';    break;

                case T_PROC_G:          result = 'global';   break;
                case T_PROC_G_ARRAY:    result = 'global';   break;
                case T_PROC_L:          result = 'local';    break;
                case T_PROC_L_ARRAY:    result = 'local';    break;
            }
            return result;
        }
    );

    wheel(
        'compiler.command.isLocal',
        function(value) {
            if (value.vr) {
                return (value.vr.type === T_NUM_L) || (value.vr.type === T_NUM_L_ARRAY) ||
                    (value.vr.type === T_STRUCT_L) || (value.vr.type === T_STRUCT_L_ARRAY) ||
                    (value.vr.type === T_PROC_L) || (value.vr.type === T_PROC_L_ARRAY);
            }
            return false;
        }
    );

    wheel(
        'compiler.command.isStructVarType',
        function(value) {
            if (value.vr) {
                return (value.vr.type === T_STRUCT_L) || (value.vr.type === T_STRUCT_G) ||
                    (value.vr.type === T_STRUCT_L_ARRAY) || (value.vr.type === T_STRUCT_G_ARRAY);
            }
            return false;
        }
    );

    wheel(
        'compiler.command.isNumberType',
        function(value) {
            if (value.vr) {
                return (value.type === T_NUM_L) || (value.type === T_NUM_G) ||
                    (value.type === T_NUM_G_ARRAY) || (value.type === T_NUM_L_ARRAY);
            }
            return false;
        }
    );

    wheel(
        'compiler.command.isProcType',
        function(value) {
            if (value.vr) {
                return (value.type === T_PROC_G) || (value.type === T_PROC_L) ||
                    (value.type === T_PROC_G_ARRAY) || (value.type === T_PROC_L_ARRAY);
            }
            return false;
        }
    );

    wheel(
        'compiler.command.isPointerMetaType',
        function(value) {
            return value && (value.metaType === T_META_POINTER);
        }
    );

    wheel(
        'compiler.command.isPointerVarMetaType',
        function(value) {
            return value.vr && (value.vr.metaType === T_META_POINTER);
        }
    );
})();