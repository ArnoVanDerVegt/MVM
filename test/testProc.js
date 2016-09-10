var assert = require('assert');

var wheel             = require('../public/js/utils/base.js').wheel;
var compilerTestUtils = require('./compilerTestUtils.js');

var standardLines = [
        'proc printN(number n)',
        '    struct PrintNumber',
        '        number n',
        '    ends',
        '    PrintNumber printNumber',
        '    set      printNumber.n,n',
        '    addr     printNumber',
        '    module   0,0',
        'endp',
        'proc printS(string s)',
        '    struct PrintString',
        '        string s',
        '    ends',
        '    PrintString printString',
        '    set      printString.s,s',
        '    addr     printString',
        '    module   0,1',
        'endp'
    ];

describe(
    'Test proc',
    function() {
        describe(
            'Call a procedure',
            function () {
                it('Should call a procedure', function() {
                    var testData = compilerTestUtils.compileAndRun(standardLines.concat([
                            'proc test()',
                            '    printN(89)',
                            'endp',
                            '',
                            'proc main()',
                            '   test()',
                            'endp'
                        ])).testData;

                    assert.deepStrictEqual(testData.messages, [89]);
                });

                it('Should call a global procedure pointer', function() {
                    var testData = compilerTestUtils.compileAndRun(standardLines.concat([
                            'proc ptr',
                            '',
                            'proc test()',
                            '    printN(12)',
                            'endp',
                            '',
                            'proc main()',
                            '   set ptr, test',
                            '   ptr()',
                            'endp'
                        ])).testData;

                    assert.deepStrictEqual(testData.messages, [12]);
                });

                it('Should call a local procedure pointer', function() {
                    var testData = compilerTestUtils.compileAndRun(standardLines.concat([
                            'proc test()',
                            '    printN(12)',
                            'endp',
                            '',
                            'proc main()',
                            '   proc ptr',
                            '   set ptr, test',
                            '   ptr()',
                            'endp'
                        ])).testData;

                    assert.deepStrictEqual(testData.messages, [12]);
                });

                it('Should call a struct procedure pointer', function() {
                    var testData = compilerTestUtils.compileAndRun(standardLines.concat([
                            'proc test()',
                            '    printN(59)',
                            'endp',
                            '',
                            'struct TestStruct',
                            '    proc p',
                            'ends',
                            '',
                            'TestStruct testStruct',
                            '',
                            'proc main()',
                            '   set testStruct.p, test',
                            '   testStruct.p()',
                            'endp'
                        ])).testData;

                    assert.deepStrictEqual(testData.messages, [59]);
                });

                it('Should call a struct procedure pointer with offset', function() {
                    var testData = compilerTestUtils.compileAndRun(standardLines.concat([
                            'proc test()',
                            '    printN(97)',
                            'endp',
                            '',
                            'struct TestStruct',
                            '    number n',
                            '    proc p',
                            'ends',
                            '',
                            'TestStruct testStruct',
                            '',
                            'proc main()',
                            '   set testStruct.p, test',
                            '   testStruct.p()',
                            'endp'
                        ])).testData;

                    assert.deepStrictEqual(testData.messages, [97]);
                });
            }
        );

        describe(
            'Call a with parameters',
            function () {
                it('Should call a procedure with number parameters', function() {
                    var testData = compilerTestUtils.compileAndRun(standardLines.concat([
                            'proc printPoint(number x, number y, number z)',
                            '    printS("Point:")',
                            '    printN(x)',
                            '    printN(y)',
                            '    printN(z)',
                            'endp',
                            '',
                            'proc main()',
                            '    printPoint(561, 520, 974)',
                            'endp',
                        ])).testData;

                    assert.deepStrictEqual(testData.messages, ['Point:', 561, 520, 974]);
                });

                it('Should call a procedure with a struct parameter', function() {
                    var testData = compilerTestUtils.compileAndRun(standardLines.concat([
                            'struct Point',
                            '    number x',
                            '    number y',
                            '    number z',
                            'ends',
                            '',
                            'Point p',
                            '',
                            'proc printPoint(Point point)',
                            '    printS("Point:")',
                            '    printN(point.x)',
                            '    printN(point.y)',
                            '    printN(point.z)',
                            'endp',
                            '',
                            'proc main()',
                            '    set p.x, 1656',
                            '    set p.y, 98',
                            '    set p.z, 75',
                            '    printPoint(p)',
                            'endp'
                        ])).testData;

                    assert.deepStrictEqual(testData.messages, ['Point:', 1656, 98, 75]);
                });

                it('Should call a procedure with an array parameter', function() {
                    var testData = compilerTestUtils.compileAndRun(standardLines.concat([
                            'number p[3]',
                            '',
                            'proc printPoint(number point[3])',
                            '    printS("Point:")',
                            '',
                            '    number n',
                            '',
                            '    arrayr n, point, 0',
                            '    printN(n)',
                            '    arrayr n, point, 1',
                            '    printN(n)',
                            '    arrayr n, point, 2',
                            '    printN(n)',
                            'endp',
                            '',
                            'proc main()',
                            '    arrayw  p, 0, 3975',
                            '    arrayw  p, 1, 296',
                            '    arrayw  p, 2, 7013',
                            '    printPoint(p)',
                            'endp'
                        ])).testData;

                    assert.deepStrictEqual(testData.messages, ['Point:', 3975, 296, 7013]);
                });
            }
        );
    }
);