var assert = require('assert');

var wheel             = require('../js/utils/base.js').wheel;
var compilerTestUtils = require('./compilerTestUtils.js');

describe(
    'Test script',
    function() {
        describe(
            'Test asm',
            function() {
                it('Should create asm block', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    asm',
                            '    end',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, []);
                });

                it('Should create asm block with add', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a = 2',
                            '    number b = 3',
                            '    asm',
                            '        add a, b',
                            '    end',
                            '    printN(a)',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [5]);
                });

                it('Should create asm block with sub', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a = 2',
                            '    number b = 3',
                            '    asm',
                            '        sub a, b',
                            '    end',
                            '    printN(a)',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [-1]);
                });

                it('Should create asm block with mul', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a = 2',
                            '    number b = 3',
                            '    asm',
                            '        mul a, b',
                            '    end',
                            '    printN(a)',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [6]);
                });

                it('Should create asm block with mod', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a = 8',
                            '    number b = 3',
                            '    asm',
                            '        mod a, b',
                            '    end',
                            '    printN(a)',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [2]);
                });

                it('Should set registers', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number n',
                            '    asm',
                            '        set n, REG_STACK',
                            '        set n, REG_SRC',
                            '        set n, REG_DEST',
                            '        set n, REG_CODE',
                            '        set n, REG_RETURN',
                            '        set n, REG_FLAGS',
                            '    end',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, []);
                });

                it('Should set registers', function() {
                    var testData = compilerTestUtils.compileAndRun(
                            compilerTestUtils.standardLines.concat([
                                'proc main()',
                                '    number stack',
                                '    number src',
                                '    number dest',
                                '    number code',
                                '    number return',
                                '    number flags',
                                '    asm',
                                '        set stack, REG_STACK',
                                '        set src, REG_SRC',
                                '        set dest, REG_DEST',
                                '        set code, REG_CODE',
                                '        set return, REG_RETURN',
                                '        set flags, REG_FLAGS',
                                '    end',
                                'end'
                            ]),
                            false
                        ).testData;

                    assert.deepEqual(testData.vm.getVMData().getData(), [6, 0, 65535, 65536, 0, 0, 6, 65535, 6, 0, 0, 29, 0, 0]);
                });

                it('Should set registers - ret', function() {
                    var testData = compilerTestUtils.compileAndRun(
                            compilerTestUtils.standardLines.concat(
                            [
                                'proc main()',
                                '    number stack',
                                '    number src',
                                '    number dest',
                                '    number code',
                                '    number return',
                                '    number flags',
                                '    asm',
                                '        set stack, REG_STACK',
                                '        set src, REG_SRC',
                                '        set dest, REG_DEST',
                                '        set code, REG_CODE',
                                '        set return, REG_RETURN',
                                '        set flags, REG_FLAGS',
                                '    end',
                                'end'
                            ]),
                            true
                        ).testData;

                    assert.deepEqual(testData.vm.getVMData().getData(), [6, 0, 0, 65536, 0, 0, 6, 65535, 6, 0, 0, 25, 0, 0]);
                });
            }
        );

        describe(
            'Test operator',
            function() {
                it('Should assign', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number n',
                            '',
                            '    n = 13',
                            '',
                            '    printN(n)',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [13]);
                });

                it('Should assign, add', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number n',
                            '',
                            '    n = 234',
                            '    n += 5',
                            '',
                            '    printN(n)',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [239]);
                });

                it('Should assign, subtract', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number n',
                            '',
                            '    n = 68',
                            '    n -= 3',
                            '',
                            '    printN(n)',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [65]);
                });

                it('Should assign, multiply', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number n',
                            '',
                            '    n = 41',
                            '    n *= 5',
                            '',
                            '    printN(n)',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [205]);
                });
            }
        );

        describe(
            'Test array',
            function() {
                it('Should read and write an array => b[2] = a[3]', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a[3]',
                            '    number b[3]',
                            '',
                            '    a[3] = 5',
                            '    b[2] = a[3]',
                            '',
                            '    number i',
                            '    i = b[2]',
                            '    printN(i)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [5]);
                });

                it('Should use array as index => b[a[3]] = 3454', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a[3]',
                            '    number b[3]',
                            '',
                            '    a[3] = 1',
                            '    b[a[3]] = 3454',
                            '',
                            '    number i',
                            '    i = b[1]',
                            '    printN(i)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [3454]);
                });

                it('Should use array/calculation as index => b[a[1 + c]] = 33809', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a[3]',
                            '    number b[3]',
                            '',
                            '    a[3] = 1',
                            '    number c = 2',
                            '    b[a[1 + c]] = 33809',
                            '',
                            '    number i',
                            '    i = b[1]',
                            '    printN(i)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [33809]);
                });

                it('Should use array/array as index => a[b[b[2]]] = 55478', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a[3]',
                            '    number b[3]',
                            '',
                            '    b[1] = 0',
                            '    b[2] = 1',
                            '    a[b[b[2]]] = 55478',
                            '',
                            '    number i',
                            '    i = a[0]',
                            '    printN(i)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [55478]);
                });

                it('Should use array/array/array as index => a[b[b[b[3]]]] = 4896', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a[5]',
                            '    number b[5]',
                            '',
                            '    b[1] = 0',
                            '    b[2] = 1',
                            '    b[3] = 2',
                            '    a[b[b[b[3]]]] = 4896',
                            '',
                            '    number i',
                            '    i = a[0]',
                            '    printN(i)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [4896]);
                });

                it('Should use array/array/array/calculation as index => a[b[b[b[5 - c]]]] = 349', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a[5]',
                            '    number b[5]',
                            '',
                            '    b[1] = 0',
                            '    b[2] = 1',
                            '    b[3] = 2',
                            '    number c = 2',
                            '    a[b[b[b[5 - c]]]] = 349',
                            '',
                            '    number i',
                            '    i = a[0]',
                            '    printN(i)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [349]);
                });

                it('Should use array as index => i = b[a[3]]', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a[3]',
                            '    number b[3]',
                            '',
                            '    b[2] = 3469',
                            '    a[3] = 2',
                            '',
                            '    number i',
                            '    i = b[a[3]]',
                            '    printN(i)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [3469]);
                });

                it('Should use array as index => a[0] = b[a[3]]', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a[3]',
                            '    number b[3]',
                            '',
                            '    b[2] = 3469',
                            '    a[3] = 2',
                            '',
                            '    number i',
                            '    a[0] = b[a[3]]',
                            '    i = a[0]',
                            '    printN(i)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [3469]);
                });

                it('Should use array/calculation as index => b[a[1 + c]] = 33809', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a[4]',
                            '    number b[4]',
                            '',
                            '    b[1] = 2443',
                            '    a[3] = 1',
                            '    number c = 2',
                            '    number i',
                            '    i = b[a[1 + c]]',
                            '',
                            '    printN(i)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [2443]);
                });

                it('Should use array/array as index => a[b[b[2]]] = 55478', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a[3]',
                            '    number b[3]',
                            '',
                            '    b[1] = 0',
                            '    b[2] = 1',
                            '    a[b[b[2]]] = 55478',
                            '',
                            '    number i',
                            '    i = a[0]',
                            '    printN(i)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [55478]);
                });

                it('Should use array/array/array as index => a[b[b[b[3]]]] = 4896', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a[5]',
                            '    number b[5]',
                            '',
                            '    b[1] = 0',
                            '    b[2] = 1',
                            '    b[3] = 2',
                            '    a[b[b[b[3]]]] = 4896',
                            '',
                            '    number i',
                            '    i = a[0]',
                            '    printN(i)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [4896]);
                });

                it('Should use array/array/array/calculation as index => a[b[b[b[5 - c]]]] = 349', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a[5]',
                            '    number b[5]',
                            '',
                            '    b[1] = 0',
                            '    b[2] = 1',
                            '    b[3] = 2',
                            '    number c = 2',
                            '    a[b[b[b[5 - c]]]] = 349',
                            '',
                            '    number i',
                            '    i = a[0]',
                            '    printN(i)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [349]);
                });
            }
        );

        describe(
            'Test case',
            function() {
                it('Should select one', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number n',
                            '',
                            '    n = 1',
                            '',
                            '    select n',
                            '        case 1:',
                            '            printS("one")',
                            '',
                            '        case 2:',
                            '            printS("two")',
                            '',
                            '        case 3:',
                            '            printS("three")',
                            '',
                            '    end',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, ['one']);
                });

                it('Should select two', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number n',
                            '',
                            '    n = 2',
                            '',
                            '    select n',
                            '        case 1:',
                            '            printS("one")',
                            '',
                            '        case 2:',
                            '            printS("two")',
                            '',
                            '        case 3:',
                            '            printS("three")',
                            '',
                            '    end',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, ['two']);
                });

                it('Should select three', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number n',
                            '',
                            '    n = 3',
                            '',
                            '    select n',
                            '        case 1:',
                            '            printS("one")',
                            '',
                            '        case 2:',
                            '            printS("two")',
                            '',
                            '        case 3:',
                            '            printS("three")',
                            '',
                            '    end',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, ['three']);
                });

                it('Should nest select', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number i',
                            '    number j',
                            '',
                            '    i = 2',
                            '    j = 4',
                            '',
                            '    select i',
                            '        case 1:',
                            '            printS("one")',
                            '',
                            '        case 2:',
                            '            printS("i is two")',
                            '            select j',
                            '                case 4:',
                            '                    printS("j is four")',
                            '',
                            '                case 5:',
                            '                    printS("j is five")',
                            '',
                            '            end',
                            '',
                            '        case 3:',
                            '            printS("three")',
                            '',
                            '    end',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, ['i is two', 'j is four']);
                });
            }
        );

        describe(
            'Test expression',
            function() {
                it('Should calculate => a = b + c', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a',
                            '    number b',
                            '    number c',
                            '',
                            '    b = 2',
                            '    c = 7',

                            '    a = b + c',
                            '    printN(a)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [9]);
                });

                it('Should calculate => a = b * 2 + c', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a',
                            '    number b',
                            '    number c',
                            '',
                            '    b = 5',
                            '    c = 7',

                            '    a = b * 2 + c',
                            '    printN(a)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [17]);
                });

                it('Should calculate => a = c + b[1] * 8', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a',
                            '    number b[2]',
                            '    number c',
                            '',
                            '    b[1] = 5',
                            '    c = 3',

                            '    a = c + b[1] * 8',
                            '    printN(a)',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [43]);
                });

                it('Should calculate => a = b[1] * 8 - c * b[0]', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a',
                            '    number b[2]',
                            '    number c',
                            '',
                            '    b[0] = 5',
                            '    b[1] = 7',
                            '',
                            '    c = 3',
                            '    a = b[1] * 8 - c * b[0]', // 7 * 8 - 3 * 5
                            '    printN(a)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [41]);
                });
            }
        );

        describe(
            'Test array index expression',
            function() {
                it('Should calculate and set => a[2 * b] = 71', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a[8]',
                            '',
                            '    number b = 3',
                            '    a[2 * b] = 71',
                            '',
                            '    number i',
                            '    i = a[6]',
                            '    printN(i)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [71]);
                });

                it('Should calculate and get => i = a[b - 3]', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a[8]',
                            '',
                            '    a[4] = 2370',
                            '',
                            '    number b = 7',
                            '    number i',
                            '    i = a[b - 3]',
                            '    printN(i)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [2370]);
                });

                it('Should calculate and set => a[3] = b * 7', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a[8]',
                            '',
                            '    number b = 3',
                            '    a[3] = b * 7',
                            '',
                            '    number i',
                            '    i = a[3]',
                            '    printN(i)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [21]);
                });

                it('Should calculate and set => a[2 * b] = c * 7', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a[8]',
                            '',
                            '    number b = 3',
                            '    number c = 6',
                            '    a[2 * b] = c * 7',
                            '',
                            '    number i',
                            '    i = a[6]',
                            '    printN(i)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [42]);
                });
            }
        );

        describe(
            'Test procedure parameters',
            function() {
                it('Should print a * b - 3 = 32', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a = 7',
                            '    number b = 5',
                            '    printN(a * b - 3)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [32]);
                });

                it('Should call test proc with a * b + 6 and 359 parameter', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc test(number a, number b)',
                            '    printN(a)',
                            '    printN(b)',
                            'end',
                            'proc main()',
                            '    number a = 3',
                            '    number b = 5',
                            '    test(a * b + 6, 359)',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [21, 359]);
                });

                it('Should calculate and print a[15] = 39', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a[20]',
                            '',
                            '    number b = 5',
                            '    a[3 * b] = 39',
                            '',
                            '    number i',
                            '    printN(a[15])',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [39]);
                });

                it('Should calculate and print a[3 * b] = 41', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a[20]',
                            '',
                            '    number b = 4',
                            '    a[12] = 41',
                            '',
                            '    printN(a[3 * b])',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [41]);
                });

                it('Should use nested array parameter', function() {
                    var testData = compilerTestUtils.compileAndRun(compilerTestUtils.standardLines.concat([
                            'proc main()',
                            '    number a[4]',
                            '    number b[4]',
                            '',
                            '    a[3] = 1',
                            '    b[a[3]] = 43498',
                            '',
                            '    printN(b[a[3]])',
                            '',
                            'end'
                        ])).testData;

                    assert.deepEqual(testData.messages, [43498]);
                });
            }
        );
    }
);