/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const testCodeAndMemory = require('../../utils').testCodeAndMemory;
const testLogs          = require('../../utils').testLogs;

describe(
    'Test list',
    () => {
        testLogs(
            it,
            'Should reset list length',
            [
                'record Point',
                '   number x, y',
                'end',
                'record Shape',
                '   number count',
                '   Point points[5]',
                'end',
                'proc shapeReset(Shape ^shape)',
                '    shape.count = 0',
                'end',
                'proc main()',
                '    Shape shape',
                '    shapeReset(@shape)',
                '    addr shape.count',
                '    mod 0, 1',
                'end'
            ],
            [
                0
            ]
        );
        testLogs(
            it,
            'Should add list item',
            [
                'record Point',
                '   number x, y',
                'end',
                'record Shape',
                '   number count',
                '   Point points[5]',
                'end',
                'proc shapeReset(Shape ^shape)',
                '    shape.count = 0',
                'end',
                'proc shapeAddPoint(Shape ^shape, number xx, number yy)',
                '    with shape',
                '        with points[count]',
                '            x = xx',
                '            y = yy',
                '        end',
                '    end',
                'end',
                'proc main()',
                '    Shape shape',
                '    shapeReset(@shape)',
                '    shapeAddPoint(@shape, 4234, 4667)',
                '    addr shape.points[0].x',
                '    mod  0, 1',
                '    addr shape.points[0].y',
                '    mod  0, 1',
                'end'
            ],
            [
                4234,
                4667
            ]
        );
        testLogs(
            it,
            'Should log list item',
            [
                'record Point',
                '   number x, y',
                'end',
                'record Shape',
                '   number padding', // Force count to a non-zero offset...
                '   number count',
                '   Point points[5]',
                'end',
                'proc shapeReset(Shape ^shape)',
                '    shape.count = 0',
                'end',
                'proc shapeAddPoint(Shape ^shape, number xx, number yy)',
                '    with shape',
                '        with points[count]',
                '            x = xx',
                '            y = yy',
                '        end',
                '        count++',
                '    end',
                'end',
                'proc shapeLogPoint0(Shape ^shape, number index)',
                '    addr shape.points[index].x',
                '    mod  0, 1',
                '    addr shape.points[index].y',
                '    mod  0, 1',
                'end',
                'proc shapeLogPoint1(Shape ^shape, number index)',
                '    with shape.points[index]',
                '        addr x',
                '        mod  0, 1',
                '        addr y',
                '        mod  0, 1',
                '    end',
                'end',
                'proc shapeLogPoint2(Shape ^shape, number index)',
                '    with shape',
                '        with points[index]',
                '            addr x',
                '            mod  0, 1',
                '            addr y',
                '            mod  0, 1',
                '        end',
                '    end',
                'end',
                'proc main()',
                '    Shape shape',
                '    shapeReset(@shape)',
                '    shapeAddPoint(@shape, 1234, 1667)',
                '    shapeAddPoint(@shape, 6234, 6667)',
                '    shapeAddPoint(@shape, 3234, 3667)',
                '    shapeLogPoint0(@shape, 0)',
                '    shapeLogPoint1(@shape, 1)',
                '    shapeLogPoint2(@shape, 2)',
                'end'
            ],
            [
                1234,
                1667,
                6234,
                6667,
                3234,
                3667
            ]
        );
        testLogs(
            it,
            'Should create a container object and add points',
            [
                'object Point',
                '   number x, y',
                'end',
                'proc Point.setXY(number x, number y)',
                '    self.x = x',
                '    self.y = y',
                'end',
                'proc Point.log()',
                '    addr x',
                '    mod 0, 1',
                '    addr y',
                '    mod 0, 1',
                'end',
                'record PointItem',
                '    Point ^point',
                'end',
                'object Shape',
                '   number count',
                '   PointItem points[5]',
                'end',
                'proc Shape.init()',
                '    count = 0',
                'end',
                'proc Shape.addPoint(Point ^point)',
                '    points[count].point = point',
                'end',
                'proc Shape.testPoint(number index)',
                '    points[index].point.log()',
                'end',
                'Shape shape',
                'Point testPoint0',
                'proc main()',
                '    shape.init()',
                '    testPoint0.setXY(2451, 9841)',
                '    shape.addPoint(@testPoint0)',
                '    shape.testPoint(0)',
                'end'
            ],
            [
                2451,
                9841
            ]
        );
/*
        testLogs(
            it,
            'Should create a container object and add points',
            [
                'object Point',
                '   number x, y',
                'end',
                'proc Point.setXY(number x, number y)',
                '    self.x = x',
                '    self.y = y',
                'end',
                'proc Point.log()',
                '    addr x',
                '    mod 0, 1',
                '    addr y',
                '    mod 0, 1',
                'end',
                'object Shape',
                '   number count',
                '   ^Point points[5]',
                'end',
                'proc Shape.init()',
                '    count = 0',
                'end',
                'proc Shape.addPoint(Point ^point)',
                '    points[count] = point',
                'end',
                'proc Shape.testPoint(number index)',
                '    points[index].log()',
                'end',
                'Shape shape',
                'Point testPoint0',
                'proc main()',
                '    shape.init()',
                '    testPoint0.setXY(2451, 9841)',
                '    shape.addPoint(@testPoint0)',
                '    shape.testPoint(0)',
                'end'
            ],
            [
                2451,
                9841
            ]
        );
*/
    }
);
