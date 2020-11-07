/**
 * Wheel, copyright (c) 2017 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const testCodeAndMemory = require('../../utils').testCodeAndMemory;
const testLogs          = require('../../utils').testLogs;

describe(
    'Test global object',
    () => {
        describe(
            'Test basic object',
            () => {
                testLogs(
                    it,
                    'Should declare a simple object',
                    [
                        'object Point',
                        '    number x, y',
                        'end',
                        'Point p',
                        'proc main()',
                        '    p.x = 397',
                        '    p.y = 39',
                        '    addr p.y',
                        '    mod 0, 1',
                        '    addr p.x',
                        '    mod 0, 1',
                        'end'
                    ],
                    [
                        39,
                        397
                    ]
                );
                testLogs(
                    it,
                    'Should declare an object with one method',
                    [
                        'object Point',
                        '    number x, y',
                        'end',
                        'proc Point.log()',
                        '    addr x',
                        '    mod 0, 1',
                        '    addr y',
                        '    mod 0, 1',
                        'end',
                        'Point p',
                        'proc main()',
                        '    p.x = 4397',
                        '    p.y = 539',
                        '    p.log()',
                        'end'
                    ],
                    [
                        4397,
                        539
                    ]
                );
                testLogs(
                    it,
                    'Should declare an object with two methods',
                    [
                        'object Point',
                        '    number x, y',
                        'end',
                        'proc Point.setXY()',
                        '    x = 54397',
                        '    y = 6539',
                        'end',
                        'proc Point.log()',
                        '    addr x',
                        '    mod 0, 1',
                        '    addr y',
                        '    mod 0, 1',
                        'end',
                        'Point p',
                        'proc main()',
                        '    p.setXY()',
                        '    p.log()',
                        'end'
                    ],
                    [
                        54397,
                        6539
                    ]
                );
                testLogs(
                    it,
                    'Should declare an object with two methods with parameter',
                    [
                        'object Point',
                        '    number x, y',
                        'end',
                        'proc Point.setXY(number xx, number yy)',
                        '    x = xx',
                        '    y = yy',
                        'end',
                        'proc Point.log()',
                        '    addr x',
                        '    mod 0, 1',
                        '    addr y',
                        '    mod 0, 1',
                        'end',
                        'Point p',
                        'proc main()',
                        '    p.setXY(3462, 1831)',
                        '    p.log()',
                        'end'
                    ],
                    [
                        3462,
                        1831
                    ]
                );
                testLogs(
                    it,
                    'Should declare an object with two methods and a local var',
                    [
                        'object Point',
                        '    number x, y',
                        'end',
                        'proc Point.setXY(number xx, number yy)',
                        '    number i = 10',
                        '    x = xx + i',
                        '    y = yy + i',
                        'end',
                        'proc Point.log()',
                        '    addr x',
                        '    mod 0, 1',
                        '    addr y',
                        '    mod 0, 1',
                        'end',
                        'Point p',
                        'proc main()',
                        '    p.setXY(3462, 1831)',
                        '    p.log()',
                        'end'
                    ],
                    [
                        3472,
                        1841
                    ]
                );
                testLogs(
                    it,
                    'Should declare a simple object and call methods from a method',
                    [
                        'object Point',
                        '    number x, y',
                        'end',
                        'proc Point.setXY(number xx, number yy)',
                        '    number i = 10',
                        '    x = xx + i',
                        '    y = yy + i',
                        'end',
                        'proc Point.log()',
                        '    addr x',
                        '    mod 0, 1',
                        '    addr y',
                        '    mod 0, 1',
                        'end',
                        'proc Point.test()',
                        '    setXY(3469, 1839)',
                        '    log()',
                        'end',
                        'Point p',
                        'proc main()',
                        '    p.test()',
                        'end'
                    ],
                    [
                        3479,
                        1849
                    ]
                );
                testLogs(
                    it,
                    'Should declare a simple object and call methods from a method',
                    [
                        'object Point',
                        '    number x, y',
                        'end',
                        'proc Point.log()',
                        '    addr x',
                        '    mod 0, 1',
                        'end',
                        'proc Point.test()',
                        '    log()',
                        'end',
                        'Point p',
                        'proc main()',
                        '    p.x = 3479',
                        '    p.test()',
                        'end'
                    ],
                    [
                        3479
                    ]
                );
            }
        );
        describe(
            'Test object with record field',
            () => {
                testLogs(
                    it,
                    'Should declare a simple object with a record field',
                    [
                        'record Point',
                        '    number x, y',
                        'end',
                        'object Test',
                        '    Point p',
                        'end',
                        'Test test',
                        'proc main()',
                        '    test.p.x = 97',
                        '    test.p.y = 439',
                        '    addr test.p.y',
                        '    mod 0, 1',
                        '    addr test.p.x',
                        '    mod 0, 1',
                        'end'
                    ],
                    [
                        439,
                        97
                    ]
                );
                testLogs(
                    it,
                    'Should declare a simple object with a method and a record field',
                    [
                        'record Point',
                        '    number x, y',
                        'end',
                        'object Test',
                        '    Point p',
                        'end',
                        'proc Test.log()',
                        '    with p',
                        '        addr x',
                        '        mod 0, 1',
                        '        addr y',
                        '        mod 0, 1',
                        '    end',
                        'end',
                        'Test test',
                        'proc main()',
                        '    test.p.x = 9439',
                        '    test.p.y = 9531',
                        '    test.log()',
                        'end'
                    ],
                    [
                        9439,
                        9531
                    ]
                );
                testLogs(
                    it,
                    'Should declare a simple object with two methods',
                    [
                        'record Point',
                        '    number x, y',
                        'end',
                        'object Test',
                        '    Point p',
                        'end',
                        'proc Test.setXY()',
                        '    with p',
                        '        x = 15439',
                        '        y = 16539',
                        '    end',
                        'end',
                        'proc Test.log()',
                        '    with p',
                        '        addr x',
                        '        mod 0, 1',
                        '        addr y',
                        '        mod 0, 1',
                        '    end',
                        'end',
                        'Test test',
                        'proc main()',
                        '    test.setXY()',
                        '    test.log()',
                        'end'
                    ],
                    [
                        15439,
                        16539
                    ]
                );
            }
        );
        describe(
            'Test object with an object field',
            () => {
                testLogs(
                    it,
                    'Should declare an object with object field',
                    [
                        'object Point',
                        '    number x, y',
                        'end',
                        'object Line',
                        '    Point p1',
                        'end',
                        'Line l',
                        'proc main()',
                        '    l.p1.x = 5397',
                        '    l.p1.y = 5639',
                        '    addr l.p1.y',
                        '    mod 0, 1',
                        '    addr l.p1.x',
                        '    mod 0, 1',
                        'end'
                    ],
                    [
                        5639,
                        5397
                    ]
                );
                testLogs(
                    it,
                    'Should declare an object with object field and a single method',
                    [
                        'object Point',
                        '    number x, y',
                        'end',
                        'object Line',
                        '    Point p1',
                        'end',
                        'proc Line.setPoint1()',
                        '    with p1',
                        '        x = 2397',
                        '        y = 3639',
                        '    end',
                        'end',
                        'Line l',
                        'proc main()',
                        '    l.setPoint1()',
                        '    addr l.p1.y',
                        '    mod 0, 1',
                        '    addr l.p1.x',
                        '    mod 0, 1',
                        'end'
                    ],
                    [
                        3639,
                        2397
                    ]
                );
                testLogs(
                    it,
                    'Should declare an object with object field and and call method',
                    [
                        'object Point',
                        '    number x, y',
                        'end',
                        'proc Point.setXY()',
                        '    x = 4397',
                        '    y = 5639',
                        'end',
                        'object Line',
                        '    Point p1',
                        'end',
                        'proc Line.setPoint1()',
                        '    p1.setXY()',
                        'end',
                        'Line l',
                        'proc main()',
                        '    l.setPoint1()',
                        '    addr l.p1.y',
                        '    mod 0, 1',
                        '    addr l.p1.x',
                        '    mod 0, 1',
                        'end'
                    ],
                    [
                        5639,
                        4397
                    ]
                );
                testLogs(
                    it,
                    'Should declare an object with object field and and call method with parameters',
                    [
                        'object Point',
                        '    number x, y',
                        'end',
                        'proc Point.setXY(number xx, number yy)',
                        '    x = xx',
                        '    y = yy',
                        'end',
                        'object Line',
                        '    Point p1',
                        'end',
                        'proc Line.setPoint1(number xx, number yy)',
                        '    p1.setXY(xx, yy)',
                        'end',
                        'Line l',
                        'proc main()',
                        '    l.setPoint1(8127, 1773)',
                        '    addr l.p1.y',
                        '    mod 0, 1',
                        '    addr l.p1.x',
                        '    mod 0, 1',
                        'end'
                    ],
                    [
                        1773,
                        8127
                    ]
                );
                testLogs(
                    it,
                    'Should declare an object with object fields and and call methods with parameters',
                    [
                        'object Point',
                        '    number x, y',
                        'end',
                        'proc Point.setXY(number xx, number yy)',
                        '    x = xx',
                        '    y = yy',
                        'end',
                        'object Line',
                        '    Point p1, p2',
                        'end',
                        'proc Line.setPoints(number x1, number y1, number x2, number y2)',
                        '    p1.setXY(x1, y1)',
                        '    p2.setXY(x2, y2)',
                        'end',
                        'Line l',
                        'proc main()',
                        '    l.setPoints(3857, 8151, 2861, 8413)',
                        '    addr l.p1.x',
                        '    mod 0, 1',
                        '    addr l.p1.y',
                        '    mod 0, 1',
                        '    addr l.p2.x',
                        '    mod 0, 1',
                        '    addr l.p2.y',
                        '    mod 0, 1',
                        'end'
                    ],
                    [
                        3857,
                        8151,
                        2861,
                        8413
                    ]
                );
                testLogs(
                    it,
                    'Should declare an object with object fields and and call methods with parameters',
                    [
                        'object Point',
                        '    number x, y',
                        'end',
                        'proc Point.setXY(number xx, number yy)',
                        '    x = xx',
                        '    y = yy',
                        'end',
                        'object Line',
                        '    Point p1, p2',
                        'end',
                        'proc Line.setPoints(number x1, number y1, number x2, number y2)',
                        '    p1.setXY(x1, y1)',
                        '    p2.setXY(x2, y2)',
                        'end',
                        'proc Line.log()',
                        '    with p1',
                        '        addr x',
                        '        mod 0, 1',
                        '        addr y',
                        '        mod 0, 1',
                        '    end',
                        '    with p2',
                        '        addr x',
                        '        mod 0, 1',
                        '        addr y',
                        '        mod 0, 1',
                        '    end',
                        'end',
                        'Line l',
                        'proc main()',
                        '    l.setPoints(1857, 2151, 3861, 4413)',
                        '    l.log()',
                        'end'
                    ],
                    [
                        1857,
                        2151,
                        3861,
                        4413
                    ]
                );
            }
        );
    }
);
