(function() {
    var wheel            = require('../../utils/base.js').wheel;
    var forLabelIndex    = 10000;
    var repeatLabelIndex = 10000;
    var whileLabelIndex  = 10000;
    var breakLabelIndex  = 10000;
    var ifLabelIndex     = 10000;
    var selectLabelIndex = 10000;

    wheel(
        'compiler.script.ScriptCompiler',
        wheel.Class(function() {
            this.init = function(opts) {
                this._asmMode                   = false;
                this._forStack                  = [];
                this._repeatStack               = [];
                this._whileStack                = [];
                this._ifStack                   = [];
                this._selectStack               = [];
                this._endStack                  = [];
                this._numericExpressionCompiler = new wheel.compiler.script.NumericExpressionCompiler({scriptCompiler: this});
            };

            this.throwErrorIfScriptMode = function() {
                if (!this._asmMode) {
                    throw new Error('#' + wheel.compiler.error.INVALID_SCRIPT_COMMAND + ' Invalid script command.');
                }
            };

            this.throwErrorIfAsmMode = function() {
                if (this._asmMode) {
                    throw new Error('#' + wheel.compiler.error.INVALID_ASM_COMMAND + ' Invalid asm command.');
                }
            };

            this.compileJumpParts = function(s) {
                var compare = {
                        je:  '!=',
                        jne: '==',
                        jl:  '>=',
                        jg:  '<=',
                        jle: '>',
                        jge: '<'
                    };
                var jumps = ['je', 'jne', 'jl', 'jg', 'jle', 'jge'];
                var jump  = null;
                var k;
                for (var j = 0; j < jumps.length; j++) {
                    jump = jumps[j];
                    k    = s.indexOf(compare[jump]);
                    if (k !== -1) {
                        break;
                    }
                }
                var parts;
                if (k === -1) {
                    parts = [s, '0'];
                    jump  = 'je';
                } else {
                    parts = s.split(compare[jump]);
                }
                return {
                    start: parts[0].trim(),
                    end:   parts[1].trim(),
                    jump:  jump
                };
            };

            this.compileAsm = function() {
                this._asmMode = true;
                return [];
            };

            this.compileProc = function(line) {
                this._endStack.push('proc');
                return [line];
            };

            this.compileEndProc = function(line) {
                this._endStack.pop();
                return [line];
            };

            this.compileRecord = function(line) {
                this._endStack.push('record');
                return [line];
            };

            this.compileEndRecord = function(line) {
                this._endStack.pop();
                return [line];
            };

            this.compileFor = function(s) {
                this.throwErrorIfAsmMode();

                var direction = 'downto';
                var j         = s.indexOf(direction);

                if (j === -1) {
                    direction = 'to';
                    j         = s.indexOf(direction);
                    if (j === -1) {
                        // throw error...
                    }
                }

                var end   = s.substr(j + direction.length - s.length);
                var start = s.substr(0, j).split('=');
                var vr    = start[0].trim();
                var label = '_____' + direction + '_label' + (forLabelIndex++);

                this._forStack.push({
                    direction: direction,
                    label:     label,
                    end:       end,
                    vr:        vr,
                    breaks:    []
                });
                this._endStack.push('for');

                return [
                    'set ' + vr + ',' + start[1].trim(),
                    label + ':'
                ];
            };

            this.compileRepeat = function(s) {
                this.throwErrorIfAsmMode();

                var label = '_____repeat_label' + (repeatLabelIndex++);

                this._repeatStack.push({
                    label:  label,
                    breaks: []
                });
                this._endStack.push('repeat');

                return [
                    label + ':'
                ];
            };

            this.compileWhile = function(s, output) {
                this.throwErrorIfAsmMode();

                var jumpParts  = this.compileJumpParts(s);
                var label      = '_____while_label' + (whileLabelIndex++);
                var whileLabel = '_____while_label' + (whileLabelIndex++);

                this._whileStack.push({
                    outputOffset: output.length + 2,
                    label:        label,
                    whileLabel:   whileLabel
                });
                this._endStack.push('while');

                return [
                    whileLabel + ':',
                    'cmp ' + jumpParts.start + ',' + jumpParts.end,
                    jumpParts.jump
                ];
            };

            this.compileBreak = function(s, outputOffset) {
                this.throwErrorIfAsmMode();

                var endStack = this._endStack;
                var loopItem = null;
                if (endStack.length) {
                    var loopList = null;
                    var found    = false;
                    var index    = endStack.length;
                    while (!found && (index > 0)) {
                        var type = endStack[--index];
                        switch (type) {
                            case 'for':
                                loopList = this._forStack;
                                found    = true;
                                break;

                            case 'repeat':
                                loopList = this._repeatStack;
                                found    = true;
                                break;

                            case 'while':
                                loopList = this._whileStack;
                                found    = true;
                                break;
                        }
                    }

                    if (loopList && loopList.length) {
                        loopItem = loopList[loopList.length - 1];
                    }
                }
                if (loopItem === null) {
                    throw new Error('#' + wheel.compiler.error.BREAK_WITHOUT_LOOP + ' Break without loop.');
                }
                loopItem.breaks.push(outputOffset);

                return [
                    'jmp'
                ];
            };

            this.compileIf = function(s, output) {
                this.throwErrorIfAsmMode();

                var jumpParts = this.compileJumpParts(s);
                var ifItem    = {
                        outputOffset: 0,
                        label:        '_____if_label' + (ifLabelIndex++)
                    };

                this._ifStack.push(ifItem);
                this._endStack.push('if');

                var ifLine   = jumpParts.start + '=' + jumpParts.end;
                var operator = {command: 'cmp', operator: '=', pos: jumpParts.start.length};
                var result   = this.compileOperator(ifLine, operator);
                result.push(jumpParts.jump);

                ifItem.outputOffset = output.length + result.length - 1;

                return result;
            };

            this.compileElse = function(output) {
                this.throwErrorIfAsmMode();

                var ifItem = this._ifStack[this._ifStack.length - 1];
                var label  = ifItem.label;
                output[ifItem.outputOffset] += ' ' + label;
                ifItem.outputOffset = output.length;
                ifItem.label += '_else';

                return [
                    'jmp ',
                    label + ':'
                ];
            };

            this.compileSelect = function(s) {
                this.throwErrorIfAsmMode();

                this._selectStack.push({
                    label:        '_____select' + (selectLabelIndex++),
                    caseIndex:    0,
                    vr:           s.trim(),
                    outputOffset: null
                });
                this._endStack.push('select');

                return [];
            };

            this.compileCase = function(s, output) {
                this.throwErrorIfAsmMode();

                s = s.trim();
                s = s.substr(0, s.length - 1); // remove ":"

                var result = [];

                var selectItem   = this._selectStack[this._selectStack.length - 1];
                var outputOffset = output.length + 1;

                if (selectItem.outputOffset !== null) {
                    var label = selectItem.label + '_' + selectItem.caseIndex;
                    selectItem.caseIndex++;
                    result.push(label + ':');
                    output[selectItem.outputOffset] += label;
                    outputOffset++;
                }

                selectItem.outputOffset = outputOffset;

                result.push(
                    'cmp ' + selectItem.vr + ',' + s,
                    'jne '
                );

                return result;
            };

            this.compileEnd = function(output) {
                if (this._asmMode) {
                    this._asmMode = false;
                    return [];
                }

                if (!this._endStack.length) {
                    throw new Error('End without begin.');
                }
                var end       = this._endStack.pop();
                var addBreaks = function(loopItem) {
                        var label = '_____break' + (breakLabelIndex++);
                        loopItem.breaks.forEach(function(item) {
                            output[item] = 'jmp ' + label;
                        });
                        return label;
                    };

                switch (end) {
                    case 'if':
                        var ifItem = this._ifStack.pop();
                        output[ifItem.outputOffset] += ' ' + ifItem.label;
                        return [ifItem.label + ':'];

                    case 'while':
                        var whileItem = this._whileStack.pop();
                        output[whileItem.outputOffset] += ' ' + whileItem.label;
                        return [
                            'jmp ' + whileItem.whileLabel,
                            whileItem.label + ':'
                        ];

                    case 'select':
                        var selectItem = this._selectStack.pop();
                        var result     = [];
                        var label      = selectItem.label + '_' + selectItem.caseIndex;
                        result.push(label + ':');
                        output[selectItem.outputOffset] += label;
                        return result;

                    case 'for':
                        var forItem = this._forStack.pop();
                        var loop = {
                                to:     {operator: 'inc', condition: 'jle'},
                                downto: {operator: 'dec', condition: 'jge'}
                            }[forItem.direction];

                        return [
                            loop.operator  + ' ' + forItem.vr,
                            'cmp '               + forItem.vr + ',' + forItem.end,
                            loop.condition + ' ' + forItem.label,
                            addBreaks(forItem) + ':'
                        ];

                    case 'repeat':
                        var repeatItem = this._repeatStack.pop();
                        return [
                            'jmp ' + repeatItem.label,
                            addBreaks(repeatItem) + ':'
                        ];

                    case 'record':
                        return ['endr'];

                    case 'proc':
                        return ['endp'];
                }
            };

            this.compileOperator = function(line, operator) {
                this.throwErrorIfAsmMode();

                var result                    = [];
                var numericExpressionCompiler = this._numericExpressionCompiler;
                var parts                     = line.split(operator.operator);
                var vr                        = parts[0].trim();
                var value                     = parts[1].trim();
                var valueCalculation          = numericExpressionCompiler.isCalculation(value);
                var tempVar;

                var addOffsetToDest = function(value) {
                        if (value.substr(0, 1) === '&') {
                            result.push('        %if_global ' + value);
                            result.push('            set REG_DEST,%offset(' + value + ')');
                            result.push('        %else');
                            result.push('            set REG_DEST,REG_STACK');
                            result.push('            add REG_DEST,%offset(' + value + ')');
                            result.push('        %end');
                        } else {
                            result.push('    set REG_DEST,' + value);
                        }
                    };

                if (numericExpressionCompiler.isComposite(vr)) {
                    var recordVar = numericExpressionCompiler.compileCompositeVar(result, vr, 0, true);
                    if (valueCalculation) {
                        tempVar = numericExpressionCompiler.compileToTempVar(result, valueCalculation);
                        result.push('set REG_DEST,' + tempVar + '_1');
                    } else if (numericExpressionCompiler.isComposite(value)) {
                        var tempRecordVar = numericExpressionCompiler.compileCompositeVar(result, value);
                        tempVar = tempRecordVar.result;

                        result.push('set REG_SRC,REG_STACK');
                        result.push('set REG_STACK,' + tempVar);
                        result.push('set REG_DEST,%REG_STACK');
                        result.push('set REG_STACK,REG_SRC');
                    } else {
                        result.push('%if_pointer ' + vr);
                        addOffsetToDest(value);
                        result.push('%else');
                        result.push('    %if_record ' + vr);
                        result.push('        %if_global ' + vr);
                        result.push('            set REG_DEST,%offset(' + vr + ')');
                        result.push('        %else');
                        result.push('            set REG_DEST,REG_STACK');
                        result.push('            add REG_DEST,%offset(' + vr + ')');
                        result.push('        %end');
                        result.push('    %else');
                        addOffsetToDest(value);
                        result.push('    %end');
                        result.push('%end');
                    }

                    result.push('%if_pointer ' + vr);
                    result.push('    %rem operator ' + operator.command); // Rem test, should be ignored...
                    result.push('    set REG_SRC,REG_STACK');
                    result.push('    set REG_STACK,' + recordVar.result);
                    result.push('    ' + operator.command + ' %REG_STACK,REG_DEST');
                    result.push('    set REG_STACK,REG_SRC');
                    result.push('%else');
                    result.push('    %if_record ' + vr);
                    result.push('        set REG_SRC,' + recordVar.result);
                    result.push('        copy %sizeof(' + vr + ')');
                    result.push('    %else');
                    result.push('        set REG_SRC,REG_STACK');
                    result.push('        set REG_STACK,' + recordVar.result);
                    result.push('        ' + operator.command + ' %REG_STACK,REG_DEST');
                    result.push('        set REG_STACK,REG_SRC');
                    result.push('    %end');
                    result.push('%end');
                } else if (valueCalculation) {
                    tempVar = numericExpressionCompiler.compileToTempVar(result, valueCalculation);
                    result.push('set ' + vr + ',' + tempVar + '_1');
                } else if (numericExpressionCompiler.isComposite(value)) {
                    var recordVar = numericExpressionCompiler.compileCompositeVar(result, value);
                    var tempVar = recordVar.result;
                    result.push('set REG_SRC,REG_STACK');
                    result.push('set REG_STACK,' + tempVar);
                    result.push('set REG_DEST,%REG_STACK');
                    result.push('set REG_STACK,REG_SRC');
                    result.push('set ' + tempVar + ',REG_DEST');
                    result.push('set ' + vr + ',' + tempVar);
                } else {
                    vr = vr.trim();
                    result.push('%if_pointer ' + vr);

                    if (value.substr(0, 1) === '&') {
                        result.push('    %if_global ' + value);
                        result.push('        set REG_DEST,%offset(' + value + ')');
                        result.push('    %else');
                        result.push('        set REG_DEST,REG_STACK');
                        result.push('        add REG_DEST,%offset(' + value + ')');
                        result.push('    %end');
                        result.push('    ' + operator.command + ' ' + vr + ',REG_DEST');
                    } else {
                        result.push('    set REG_SRC,REG_STACK');
                        result.push('    set REG_STACK,' + vr);
                        result.push('    ' + operator.command + ' %REG_STACK,' + value);
                        result.push('    set REG_STACK,REG_SRC');
                    }

                    result.push('%else');
                    result.push('    %if_pointer ' + value);
                    result.push('        set REG_SRC,REG_STACK');
                    result.push('        set REG_STACK,' + value);
                    result.push('        set REG_DEST,%REG_STACK');
                    result.push('        set REG_STACK,REG_SRC');
                    result.push('        ' + operator.command + ' ' + vr + ',REG_DEST');
                    result.push('    %else');
                    result.push('        %if_record ' + vr);
                    result.push('            %if_global ' + vr);
                    result.push('                set REG_DEST,%offset(' + vr + ')');
                    result.push('            %else');
                    result.push('                set REG_DEST,REG_STACK');
                    result.push('                add REG_DEST,%offset(' + vr + ')');
                    result.push('            %end');
                    result.push('            %if_global ' + value);
                    result.push('                set REG_SRC,%offset(' + value + ')');
                    result.push('            %else');
                    result.push('                set REG_SRC,REG_STACK');
                    result.push('                add REG_SRC,%offset(' + value + ')');
                    result.push('            %end');
                    result.push('            copy %sizeof(' + vr + ')');
                    result.push('        %else');
                    result.push('        ' + operator.command + ' ' + vr + ',' + value);
                    result.push('        %end');
                    result.push('    %end');
                    result.push('%end');
                }

                return result;
            };

            this.compileProcCall = function(line, procCall) {
                var numericExpressionCompiler = this._numericExpressionCompiler;
                var hasExpression             = false;
                var params                    = procCall.params;
                var param                     = '';
                var p                         = [];
                var i                         = 0;

                function addParam(value) {
                    var calculation = false;
                    var arrayIndex  = false;
                    var composite   = false;

                    if (!((value.substr(0, 1) === '[') && (value.substr(-1) === ']'))) {
                        calculation   = numericExpressionCompiler.isCalculation(value);
                        arrayIndex    = numericExpressionCompiler.isArrayIndex(value);
                        composite     = numericExpressionCompiler.isComposite(value);
                    }
                    hasExpression = hasExpression || !!calculation || !!arrayIndex || composite;

                    p.push({
                        value:       value.trim(),
                        calculation: calculation,
                        arrayIndex:  arrayIndex,
                        composite:   composite
                    });
                }

                var expectParam = false;
                while (i < params.length) {
                    var c = params[i++];
                    switch (c) {
                        case '[':
                        case '(':
                            var openC  = c;
                            var closeC = {'[': ']', '(': ')'}[c];
                            var count  = 1;
                            param += c;
                            while ((count > 0) && (i < params.length)) {
                                c = params[i++];
                                param += c;
                                if (c === openC) {
                                    count++;
                                } else if (c === closeC) {
                                    count--;
                                }
                            }
                            break;

                        case ',':
                            addParam(param.trim());
                            expectParam = true;
                            param       = '';
                            break;

                        default:
                            param += c;
                            break;
                    }
                }

                param = param.trim();
                if (param === '') {
                    if (expectParam) {
                        // todo: add location information...
                        throw new Error('#' + wheel.compiler.error.SYNTAX_ERROR_PARAM_EXPECTED + ' Syntax error parameter expected.');
                    }
                } else {
                    addParam(param);
                }

                //if (!hasExpression) {
                //    return [line];
                //}

                var result       = [];
                var outputParams = [];
                var tempVar;
                for (var i = 0; i < p.length; i++) {
                    param = p[i];
                    if (param.calculation) {
                        outputParams.push(numericExpressionCompiler.compileToTempVar(result, param.calculation) + '_1');
                    } else if (param.composite || param.arrayIndex) {
                        var recordVar = numericExpressionCompiler.compileCompositeVar(result, param.value);
                        tempVar = recordVar.result;
                        result.push('set REG_SRC,REG_STACK');
                        result.push('set REG_STACK,' + tempVar);
                        result.push('set REG_DEST,%REG_STACK');
                        result.push('set REG_STACK,REG_SRC');
                        result.push('set ' + tempVar + ',REG_DEST');
                        outputParams.push(tempVar);
                    } else {
                        /*var tempParamVar = numericExpressionCompiler.createTempVarName();
                        result.push('number ' + tempParamVar);
                        result.push('%if_pointer ' + param.value);
                        result.push('    set  REG_SRC, REG_STACK');
                        result.push('    set  REG_STACK,' + param.value);
                        result.push('    set  REG_DEST, %REG_STACK');
                        result.push('    set  REG_STACK,REG_SRC');
                        result.push('    set  ' + tempParamVar + ',REG_DEST');
                        result.push('%else');
                        result.push('    %if_record ' + param.value);
                        result.push('        number ' + tempParamVar);
                        result.push('    %else');
                        result.push('        set  ' + tempParamVar + ',' + param.value);
                        result.push('    %end');
                        result.push('%end');*/
                        outputParams.push(param.value);
                    }
                }
                result.push(procCall.name + '(' + outputParams.join(',') + ')');

                return result;
            };

            this.compileLineBasic = function(line, output) {
                var result  = [line];
                var command = line.trim();
                var i       = line.indexOf(' ');
                (i === -1) || (command = line.substr(0, i).trim());

                switch (command) {
                    case 'asm':
                        return this.compileAsm();

                    case 'proc':
                        return this.compileProc(line);

                    case 'endp':
                        return this.compileEndProc(line);

                    case 'record':
                        return this.compileRecord(line);

                    case 'endr':
                        return this.compileEndRecord(line);

                    case 'for':
                        return this.compileFor(line.substr(i - line.length));

                    case 'repeat':
                        return this.compileRepeat(line);

                    case 'while':
                        return this.compileWhile(line.substr(i - line.length), output);

                    case 'break':
                        return this.compileBreak(line, output.length);

                    case 'if':
                        return this.compileIf(line.substr(i - line.length), output);

                    case 'else':
                        return this.compileElse(output);

                    case 'select':
                        return this.compileSelect(line.substr(i - line.length));

                    case 'case':
                        return this.compileCase(line.substr(i - line.length), output);

                    case 'end':
                        return this.compileEnd(output);

                    case 'set':
                        this.throwErrorIfScriptMode();
                        break;

                    case 'add':
                        this.throwErrorIfScriptMode();
                        break;

                    case 'sub':
                        this.throwErrorIfScriptMode();
                        break;

                    case 'mul':
                        this.throwErrorIfScriptMode();
                        break;

                    case 'div':
                        this.throwErrorIfScriptMode();
                        break;

                    case 'mod':
                        this.throwErrorIfScriptMode();
                        break;

                    case 'inc':
                        this.throwErrorIfScriptMode();
                        break;

                    case 'dec':
                        this.throwErrorIfScriptMode();
                        break;

                    case 'copy':
                        this.throwErrorIfScriptMode();
                        break;

                    case 'cmp':
                        this.throwErrorIfScriptMode();
                        break;

                    case 'jmpc':
                        this.throwErrorIfScriptMode();
                        break;

                    case 'module':
                        this.throwErrorIfScriptMode();
                        break;

                    case 'addr':
                        this.throwErrorIfScriptMode();
                        break;

                    default:
                        var procCall = this._numericExpressionCompiler.isProcCall(line);
                        if (procCall) {
                            return this.compileProcCall(line, procCall);
                        } else {
                            var operator = this._numericExpressionCompiler.hasOperator(line);
                            if (operator) {
                                return this.compileOperator(line, operator);
                            }
                        }
                        break;
                }

                return result;
            };

            this.compile = function(filename, lines) {
                var output    = [];
                var sourceMap = [];

                this._forStack.length    = 0;
                this._ifStack.length     = 0;
                this._selectStack.length = 0;
                this._endStack.length    = 0;

                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i].trim();
                    if (line === '') {
                        continue;
                    }

                    var location = {
                            filename:   filename,
                            lineNumber: i
                        };

                    var codeLines = this.compileLineBasic(line, output);
                    for (var j = 0; j < codeLines.length; j++) {
                        output.push(codeLines[j]);
                        sourceMap.push(location);
                    }
                }

                //for (var i = 0; i < output.length; i++) {
                //    console.log(i + ']', output[i]);
                //}
                return {
                    output:    output,
                    sourceMap: sourceMap
                };
            };
        })
    );
})();