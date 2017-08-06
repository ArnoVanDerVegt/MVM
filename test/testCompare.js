var assert = require('assert');

var wheel             = require('../js/utils/base.js').wheel;
var compilerTestUtils = require('./compilerTestUtils.js');

describe(
    'Test compare',
    function() {
        describe(
            'Compare global and constant',
            function() {
                it('Should have less/less equal/not equal flag', function() {
                    var testData = compilerTestUtils.compileAndRun(
                            [
                                'number n',
                                'proc main()',
                                '    n = 10',
                                '    asm',
                                '        cmp n, 11',
                                '    end',
                                'endp'
                            ],
                            false
                        ).testData;

                    var result = wheel.compiler.command.FLAG_NOT_EQUAL |
                                    wheel.compiler.command.FLAG_LESS |
                                    wheel.compiler.command.FLAG_LESS_EQUAL;

                    assert.deepEqual(
                        testData.vm.getVMData().getData(),
                        [
                            7,      // REG_OFFSET_STACK
                            0,      // REG_OFFSET_SRC
                            65535,  // REG_OFFSET_DEST
                            65536,  // REG_OFFSET_CODE
                            0,      // REG_RETURN
                            result, // REG_FLAGS
                            10,     // global number n
                            7,      // stack pointer
                            65535,  // return code offset
                        ]
                    );
                });

                it('Should have less/less equal/not equal flag - ret', function() {
                    var testData = compilerTestUtils.compileAndRun(
                            [
                                'number n',
                                'proc main()',
                                '    n = 10',
                                '    asm',
                                '        cmp n, 11',
                                '    end',
                                'endp'
                            ],
                            true
                        ).testData;

                    var result = wheel.compiler.command.FLAG_NOT_EQUAL |
                                    wheel.compiler.command.FLAG_LESS |
                                    wheel.compiler.command.FLAG_LESS_EQUAL;

                    assert.deepEqual(
                        testData.vm.getVMData().getData(),
                        [
                            7,      // REG_OFFSET_STACK
                            0,      // REG_OFFSET_SRC
                            0,      // REG_OFFSET_DEST
                            65536,  // REG_OFFSET_CODE
                            0,      // REG_RETURN
                            result, // REG_FLAGS
                            10,     // global number n
                            7,      // stack pointer
                            65535,  // return code offset
                        ]
                    );
                });

                it('Should have equal/less equal/greater equal', function() {
                    var testData = compilerTestUtils.compileAndRun(
                            [
                                'number n',
                                'proc main()',
                                '    n = 45',
                                '    asm',
                                '        cmp n, 45',
                                '    end',
                                'endp'
                            ],
                            false
                        ).testData;

                    var result = wheel.compiler.command.FLAG_EQUAL |
                                    wheel.compiler.command.FLAG_LESS_EQUAL |
                                    wheel.compiler.command.FLAG_GREATER_EQUAL;

                    assert.deepEqual(
                        testData.vm.getVMData().getData(),
                        [
                            7,      // REG_OFFSET_STACK
                            0,      // REG_OFFSET_SRC
                            65535,  // REG_OFFSET_DEST
                            65536,  // REG_OFFSET_CODE
                            0,      // REG_RETURN
                            result, // REG_FLAGS
                            45,     // global number n
                            7,      // stack pointer
                            65535,  // return code offset
                        ]
                    );
                });

                it('Should have equal/less equal/greater equal - ret', function() {
                    var testData = compilerTestUtils.compileAndRun(
                            [
                                'number n',
                                'proc main()',
                                '    n = 45',
                                '    asm',
                                '        cmp n, 45',
                                '    end',
                                'endp'
                            ],
                            true
                        ).testData;

                    var result = wheel.compiler.command.FLAG_EQUAL |
                                    wheel.compiler.command.FLAG_LESS_EQUAL |
                                    wheel.compiler.command.FLAG_GREATER_EQUAL;

                    assert.deepEqual(
                        testData.vm.getVMData().getData(),
                        [
                            7,      // REG_OFFSET_STACK
                            0,      // REG_OFFSET_SRC
                            0,      // REG_OFFSET_DEST
                            65536,  // REG_OFFSET_CODE
                            0,      // REG_RETURN
                            result, // REG_FLAGS
                            45,     // global number n
                            7,      // stack pointer
                            65535,  // return code offset
                        ]
                    );
                });

                it('Should have not equal/greater/greater equal', function() {
                    var testData = compilerTestUtils.compileAndRun(
                            [
                                'number n',
                                'proc main()',
                                '    n = 87',
                                '    asm',
                                '        cmp n, 31',
                                '    end',
                                'endp'
                            ],
                            false
                        ).testData;

                    var result = wheel.compiler.command.FLAG_NOT_EQUAL |
                                    wheel.compiler.command.FLAG_GREATER |
                                    wheel.compiler.command.FLAG_GREATER_EQUAL;

                    assert.deepEqual(
                        testData.vm.getVMData().getData(),
                        [
                            7,      // REG_OFFSET_STACK
                            0,      // REG_OFFSET_SRC
                            65535,  // REG_OFFSET_DEST
                            65536,  // REG_OFFSET_CODE
                            0,      // REG_RETURN
                            result, // REG_FLAGS
                            87,     // global number n
                            7,      // stack pointer
                            65535,  // return code offset
                        ]
                    );
                });

                it('Should have not equal/greater/greater equal - ret', function() {
                    var testData = compilerTestUtils.compileAndRun(
                            [
                                'number n',
                                'proc main()',
                                '    n = 87',
                                '    asm',
                                '        cmp n, 31',
                                '    end',
                                'endp'
                            ],
                            true
                        ).testData;

                    var result = wheel.compiler.command.FLAG_NOT_EQUAL |
                                    wheel.compiler.command.FLAG_GREATER |
                                    wheel.compiler.command.FLAG_GREATER_EQUAL;

                    assert.deepEqual(
                        testData.vm.getVMData().getData(),
                        [
                            7,      // REG_OFFSET_STACK
                            0,      // REG_OFFSET_SRC
                            0,      // REG_OFFSET_DEST
                            65536,  // REG_OFFSET_CODE
                            0,      // REG_RETURN
                            result, // REG_FLAGS
                            87,     // global number n
                            7,      // stack pointer
                            65535,  // return code offset
                        ]
                    );
                });
            }
        );
    }
);