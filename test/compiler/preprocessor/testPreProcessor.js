/**
 * Wheel, copyright (c) 2017 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const dispatcher    = require('../../../js/frontend/lib/dispatcher').dispatcher;
const PreProcessor  = require('../../../js/frontend/compiler/preprocessor/PreProcessor').PreProcessor;
const compiler      = require('../../../js/frontend/compiler/Compiler');
const Text          = require('../../../js/frontend/program/output/Text').Text;
const VM            = require('../../../js/frontend/vm/VM').VM;
const createModules = require('../../utils').createModules;
const createMocks   = require('../../utils').createMocks;
const assert        = require('assert');

let preProcessor;

const testDefineNumber = function(defineValue, callback) {
        let onGetFileData = function(filename, token, callback) {
                callback([
                    '#define TEST ' + defineValue,
                    'proc main()',
                    '    number n',
                    '    n = TEST',
                    '    addr n',
                    '    mod 0, 1',
                    'end'
                ].join('\n'));
            };
        let preProcessor;
        let onFinished = () => {
                dispatcher.reset();
                let tokens  = preProcessor.getDefinedConcatTokens();
                let program = new compiler.Compiler({preProcessor: preProcessor}).buildTokens(tokens).getProgram();
                let vm      = new VM({
                        entryPoint: program.getEntryPoint(),
                        globalSize: program.getGlobalSize(),
                        constants:  program.getConstants(),
                        stringList: program.getStringList()
                    });
                let modules = createModules(vm, createMocks());
                modules[0].on('Console.Log', this, callback);
                vm
                    .setModules(modules)
                    .setCommands(program.getCommands()).run();
            };
        preProcessor = new PreProcessor({onGetFileData: onGetFileData, onFinished: onFinished});
        preProcessor.processFile({filename: 'main.whl', token: null});
    };

const createOnFinished = (expectedLogValue, onFinished) => {
        return () => {
            dispatcher.reset();
            let tokens  = preProcessor.getDefinedConcatTokens();
            let program = new compiler.Compiler({preProcessor: preProcessor}).buildTokens(tokens).getProgram();
            let vm      = new VM({
                    entryPoint: program.getEntryPoint(),
                    globalSize: program.getGlobalSize(),
                    constants:  program.getConstants(),
                    stringList: program.getStringList()
                });
            let modules = createModules(vm, createMocks());
            modules[0].on(
                'Console.Log',
                this,
                function(opts) {
                    assert.equal(opts.message, expectedLogValue);// 'Hello world');
                }
            );
            onFinished();
            vm
                .setModules(modules)
                .setCommands(program.getCommands()).run();
        };
    };

describe(
    'Test PreProcessor',
    () => {
        it(
            'Should define integer',
            () => {
                testDefineNumber(
                    355,
                    function(opts) {
                        assert.equal(opts.message, 355);
                    }
                );
            }
        );
        it(
            'Should define float',
            () => {
                testDefineNumber(
                    0.5,
                    function(opts) {
                        assert.equal(Math.round(opts.message * 1000), 500);
                    }
                );
            }
        );
        it(
            'Should define string',
            () => {
                let onGetFileData = function(filename, token, callback) {
                        callback([
                            '#define TEST "Hello world"',
                            'proc main()',
                            '    string s',
                            '    s = TEST',
                            '    addr s',
                            '    mod  0, 2',
                            'end'
                        ].join('\n'));
                    };
                let onFinished = createOnFinished(
                        'Hello world',
                        () => {
                            assert.equal(preProcessor.getLineCount(), 7);
                        }
                    );
                preProcessor = new PreProcessor({onGetFileData: onGetFileData, onFinished: onFinished});
                preProcessor.processFile({filename: 'main.whl', token: null});
            }
        );
        it(
            'Should use global define',
            () => {
                let onGetFileData = function(filename, token, callback) {
                        callback([
                            'proc main()',
                            '    string s',
                            '    s = TEST',
                            '    addr s',
                            '    mod  0, 2',
                            'end'
                        ].join('\n'));
                    };
                let onFinished = createOnFinished('This is a global', () => {});
                preProcessor = new PreProcessor({
                    onGetFileData: onGetFileData,
                    onFinished:    onFinished,
                    globalDefines: {
                        TEST: '"This is a global"'
                    }
                });
                preProcessor.processFile({filename: 'main.whl', token: null});
            }
        );
        it(
            'Should include',
            function(done) {
                let onGetFileData = function(filename, token, callback) {
                        setTimeout(
                            () => {
                                switch (filename) {
                                    case 'test.whl':
                                        callback([
                                            '#define TEST 456',
                                            'proc test()',
                                            'end'
                                        ].join('\n'));
                                        break;
                                    case 'main.whl':
                                        callback([
                                            '#include "test.whl"',
                                            'proc main()',
                                            '    number n',
                                            '    n = TEST',
                                            '    addr n',
                                            '    mod 0, 1',
                                            'end'
                                        ].join('\n'));
                                        break;
                                }
                            },
                            1
                        );
                    };
                let onFinished = createOnFinished(456, done);
                preProcessor = new PreProcessor({onGetFileData: onGetFileData, onFinished: onFinished});
                preProcessor.processFile({filename: 'main.whl', token: null});
            }
        );
        it(
            'Should include, strip comments',
            function(done) {
                let onGetFileData = function(filename, token, callback) {
                        setTimeout(
                            () => {
                                switch (filename) {
                                    case 'test.whl':
                                        callback([
                                            '#define TEST 456 ; Comment after meta',
                                            'proc test() ; Comment after proc',
                                            ';Comment on empty line',
                                            'end ; Comment after keyword'
                                        ].join('\n'));
                                        break;
                                    case 'main.whl':
                                        callback([
                                            '#include "test.whl"',
                                            '; Comment line',
                                            'proc main()',
                                            '    number n ; Comment after number',
                                            '    n = TEST',
                                            '    addr n',
                                            ';',
                                            '    mod 0, 1;',
                                            'end'
                                        ].join('\n'));
                                        break;
                                }
                            },
                            1
                        );
                    };
                let onFinished = createOnFinished(456, done);
                preProcessor = new PreProcessor({onGetFileData: onGetFileData, onFinished: onFinished});
                preProcessor.processFile({filename: 'main.whl', token: null});
            }
        );
        it(
            'Should include',
            function(done) {
                let onGetFileData = function(filename, token, callback) {
                        setTimeout(
                            () => {
                                switch (filename) {
                                    case 'test1.whl':
                                        callback([
                                            '#define TEST1 456',
                                            'proc test1()',
                                            'end'
                                        ].join('\n'));
                                        break;
                                    case 'test2.whl':
                                        callback([
                                            '#include "test1.whl"',
                                            '#define TEST2 789',
                                            'proc test2()',
                                            'end'
                                        ].join('\n'));
                                        break;
                                    case 'main.whl':
                                        callback([
                                            '#include "test1.whl"',
                                            '#include "test2.whl"',
                                            'proc main()',
                                            '    number n',
                                            '    n = TEST1',
                                            '    addr n',
                                            '    mod 0, 1',
                                            '    n = TEST2',
                                            '    addr n',
                                            '    mod 0, 1',
                                            'end'
                                        ].join('\n'));
                                        break;
                                }
                            },
                            1
                        );
                    };
                let onFinished = () => {
                        dispatcher.reset();
                        let tokens  = preProcessor.getDefinedConcatTokens();
                        let program = new compiler.Compiler({preProcessor: preProcessor}).buildTokens(tokens).getProgram();
                        let vm      = new VM({
                                entryPoint: program.getEntryPoint(),
                                globalSize: program.getGlobalSize(),
                                constants:  program.getConstants(),
                                stringList: program.getStringList()
                            });
                        assert.notEqual(preProcessor.getDefines(), null);
                        assert.notEqual(preProcessor.getTokens(),  null);
                        let sortedFiles = preProcessor.getSortedFiles();
                        let files       = [];
                        sortedFiles.forEach(function(sortedFile) {
                            files.push(sortedFile.filename);
                        });
                        assert.deepEqual(files, ['test1.whl', 'test2.whl', 'main.whl']);
                        let logs    = [];
                        let modules = createModules(vm, createMocks());
                        modules[0].on(
                            'Console.Log',
                            this,
                            function(opts) {
                                logs.push(opts.message);
                            }
                        );
                        vm
                            .setModules(modules)
                            .setCommands(program.getCommands()).run();
                        assert.deepEqual(logs, [456, 789]);
                        done();
                    };
                let preProcessor = new PreProcessor({onGetFileData: onGetFileData, onFinished: onFinished});
                preProcessor.processFile({filename: 'main.whl', token: null});
            }
        );
        it(
            'Should create image',
            function(done) {
                let onGetFileData = function(filename, token, callback) {
                        callback([
                            '#image "image.rgf"',
                            '#data "010101"',
                            '#data "101010"',
                            '#data "010101"',
                            'proc main()',
                            'end'
                        ].join('\n'));
                    };
                let onFinished = () => {
                        dispatcher.reset();
                        let tokens  = preProcessor.getDefinedConcatTokens();
                        let program = new compiler.Compiler({preProcessor: preProcessor}).buildTokens(tokens).getProgram();
                        let vm      = new VM({
                                entryPoint: program.getEntryPoint(),
                                globalSize: program.getGlobalSize(),
                                constants:  program.getConstants(),
                                stringList: program.getStringList()
                            });
                        vm
                            .setModules(createModules(vm, createMocks()))
                            .setCommands(program.getCommands()).run();
                        done();
                    };
                let setImage = function(image) {
                        assert.deepEqual(
                            image,
                            {
                                filename: 'image.rgf',
                                data: [
                                    [0, 1, 0, 1, 0, 1],
                                    [1, 0, 1, 0, 1, 0],
                                    [0, 1, 0, 1, 0, 1]
                                ]
                            }
                        );
                    };
                let preProcessor = new PreProcessor({onGetFileData: onGetFileData, onFinished: onFinished, setImage: setImage});
                preProcessor.processFile({filename: 'main.whl', token: null});
            }
        );
    }
);
