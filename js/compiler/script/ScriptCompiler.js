(function() {
    var wheel            = require('../../utils/base.js').wheel;
    var forLabelIndex    = 10000;
    var ifLabelIndex     = 10000;
    var selectLabelIndex = 10000;

    wheel(
        'compiler.script.ScriptCompiler',
        wheel.Class(function() {
            this.init = function(opts) {
                this._forStack           = [];
                this._ifStack            = [];
                this._selectStack        = [];
                this._endStack           = [];
                this._expressionCompiler = new wheel.compiler.script.ExpressionCompiler({scriptCompiler: this});
            };

            this.compileProc = function(line) {
                this._endStack.push('proc');
                return [line];
            };

            this.compileEndProc = function(line) {
                this._endStack.pop();
                return [line];
            };

            this.compileStruct = function(line) {
                this._endStack.push('struct');
                return [line];
            };

            this.compileEndStruct = function(line) {
                this._endStack.pop();
                return [line];
            };

            this.compileFor = function(s) {
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
                    vr:        vr
                });
                this._endStack.push('for');

                return [
                    'set ' + vr + ',' + start[1].trim(),
                    label + ':'
                ];
            };

            this.compileIf = function(s, output) {
                var compare = {
                        je:  '!=',
                        jne: '==',
                        jl:  '>=',
                        jg:  '<=',
                        jle: '>',
                        jge: '<'
                    };
                var jumps   = ['je', 'jne', 'jl', 'jg', 'jle', 'jge'];

                var j;
                var jump;
                for (j = 0; j < jumps.length; j++) {
                    jump = jumps[j];
                    var k = s.indexOf(compare[jump]);
                    if (k !== -1) {
                        break;
                    }
                }
                var parts = s.split(compare[jump]);
                var start = parts[0].trim();
                var end   = parts[1].trim();

                this._ifStack.push({
                    outputOffset: output.length + 1,
                    label:        '_____if_label' + (ifLabelIndex++)
                });
                this._endStack.push('if');

                return [
                    'cmp ' + start + ',' + end,
                    jump
                ];
            };

            this.compileElse = function(output) {
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
                if (!this._endStack.length) {
                    throw new Error('End without begin.');
                }
                var end = this._endStack.pop();
                switch (end) {
                    case 'if':
                        var ifItem = this._ifStack.pop();
                        output[ifItem.outputOffset] += ' ' + ifItem.label;
                        return [ifItem.label + ':'];

                    case 'select':
                        var selectItem = this._selectStack.pop();
                        var result     = [];

                        if (selectItem.outputOffset !== null) {
                            var label = selectItem.label + '_' + selectItem.caseIndex;
                            result.push(label + ':');
                            output[selectItem.outputOffset] += label;
                        }
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
                            loop.condition + ' ' + forItem.label
                        ];

                    case 'struct':
                        return ['ends'];

                    case 'proc':
                        return ['endp'];
                }
            };

            this.compileValueArray = function(result, tempVar, valueArray) {
                var expressionCompiler = this._expressionCompiler;
                var varIndexArray      = expressionCompiler.isArrayIndex(valueArray.index);
                var calculation        = expressionCompiler.isCalculation(valueArray.index);
                if (calculation) {
                    var tempIndexVar = expressionCompiler.compileToTempVar(result, calculation);
                    result.push('arrayr ' + tempVar + ',' + valueArray.array + ',' + tempIndexVar + '_1');
                } else if (varIndexArray) {
                    this.compileValueArray(result, tempVar, varIndexArray);
                    result.push('arrayr ' + tempVar + ',' + valueArray.array + ',' + tempVar);
                } else {
                    result.push('arrayr ' + tempVar + ',' + valueArray.array + ',' + valueArray.index);
                }
            };

            /**
             * Compile setting an array index...
            **/
            this.compileSetIndex = function(result, vrArray, value) {
                var expressionCompiler = this._expressionCompiler;

                var calculation = expressionCompiler.isCalculation(vrArray.index);
                if (calculation) {
                    tempVar = expressionCompiler.compileToTempVar(result, calculation);
                    result.push('arrayw ' + vrArray.array + ',' + tempVar + '_1,' + value);
                } else {
                    var vrIndexArray = expressionCompiler.isArrayIndex(vrArray.index);
                    if (vrIndexArray) {
                        var tempVar = expressionCompiler.createTempVarName();
                        expressionCompiler.declareNumber(result, tempVar);
                        this.compileValueArray(result, tempVar, vrIndexArray);

                        result.push('arrayw ' + vrArray.array + ',' + tempVar + ',' + value);
                    } else {
                        result.push('arrayw ' + vrArray.array + ',' + vrArray.index + ',' + value);
                    }
                }
            };

            this.compileGetIndex = function(result, valueArray, vr) {
                var expressionCompiler = this._expressionCompiler;

                var calculation = expressionCompiler.isCalculation(valueArray.index);
                if (calculation) {
                    tempVar = expressionCompiler.compileToTempVar(result, calculation);
                    result.push('arrayr ' + vr + ',' + valueArray.array + ',' + tempVar + '_1');
                } else {
                    var varIndexArray = expressionCompiler.isArrayIndex(valueArray.index);
                    if (varIndexArray) {
                        var tempVar = expressionCompiler.createTempVarName();
                        expressionCompiler.declareNumber(result, tempVar);
                        this.compileValueArray(result, tempVar, valueArray);

                        result.push('set ' + vr + ',' + tempVar);
                    } else {
                        result.push('arrayr ' + vr + ',' + valueArray.array + ',' + valueArray.index);
                    }
                }
            };

            this.compileOperator = function(line, operator) {
                var result             = [];
                var expressionCompiler = this._expressionCompiler;
                var parts              = line.split(operator.operator);
                var vr                 = parts[0].trim();
                var vrArray            = expressionCompiler.isArrayIndex(vr);
                var value              = parts[1].trim();
                var valueArray         = expressionCompiler.isArrayIndex(value);
                var calculation        = expressionCompiler.isCalculation(value);
                var tempVar;

                if (expressionCompiler.isStruct(vr)) {
                    var structVar = expressionCompiler.compileCompositeVar(result, vr);
                    if (calculation) {
                    } else if (vrArray && valueArray) {
                    } else if (vrArray) {
                    } else if (valueArray) {
                    } else {
                        result.push('set REG_SRC,REG_STACK');
                        result.push('set REG_STACK,' + structVar.result);
                        result.push('set %REG_STACK,' + value);
                        result.push('set REG_STACK,REG_SRC');
                    }
                } else {
                    if (calculation) {
                        tempVar = expressionCompiler.compileToTempVar(result, calculation);
                        if (vrArray) {
                            var indexCalculation = expressionCompiler.isCalculation(vrArray.index);
                            if (indexCalculation) {
                                var indexTempVar = expressionCompiler.compileToTempVar(result, indexCalculation);
                                result.push('arrayw ' + vrArray.array + ',' + indexTempVar + '_1,' + tempVar + '_1');
                            } else {
                                result.push('arrayw ' + vrArray.array + ',' + vrArray.index + ',' + tempVar + '_1');
                            }
                        } else {
                            result.push('set ' + vr + ',' + tempVar + '_1');
                        }
                    } else if (expressionCompiler.isStruct(value)) {
                        var structVar = expressionCompiler.compileCompositeVar(result, value);
                        result.push('set REG_SRC,REG_STACK');
                        result.push('set REG_STACK,' + structVar.result);
                        result.push('set REG_DEST,%REG_STACK');
                        result.push('set REG_STACK,REG_SRC');
                        result.push(operator.command + ' ' + vr.trim() + ',REG_DEST');
                    } else if (vrArray && valueArray) {
                        vr = expressionCompiler.createTempVarName();
                        expressionCompiler.declareNumber(result, vr);
                        this.compileGetIndex(result, valueArray, vr);
                        this.compileSetIndex(result, vrArray, vr);
                    } else if (vrArray) {
                        var structVar = expressionCompiler.compileCompositeVar(result, vr);
                        result.push('set REG_SRC,REG_STACK');
                        result.push('set REG_STACK,' + structVar.result);
                        result.push(operator.command + ' %REG_STACK,' + value);
                        result.push('set REG_STACK,REG_SRC');
                        //this.compileSetIndex(result, vrArray, value);
                    } else if (valueArray) {
                        this.compileGetIndex(result, valueArray, vr);
                    } else {
                        result.push(operator.command + ' ' + vr.trim() + ',' + value);
                    }
                }

                return result;
            };

            this.compileProcCall = function(line, procCall) {
                var expressionCompiler = this._expressionCompiler;
                var hasExpression      = false;
                var params             = procCall.params;
                var param              = '';
                var p                  = [];
                var i                  = 0;

                function addParam(value) {
                    var calculation = false;
                    var arrayIndex  = false;
                    if (!((value.substr(0, 1) === '[') && (value.substr(-1) === ']'))) {
                        calculation = expressionCompiler.isCalculation(value);
                        arrayIndex  = expressionCompiler.isArrayIndex(value);
                        (calculation || arrayIndex) && (hasExpression = true);
                    }

                    p.push({
                        value:       value,
                        calculation: calculation,
                        arrayIndex:  arrayIndex
                    });
                }

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
                            param = '';
                            break;

                        default:
                            param += c;
                            break;
                    }
                }
                (param.trim() !== '') && addParam(param);

                if (!hasExpression) {
                    return [line];
                }

                var result       = [];
                var outputParams = [];
                for (var i = 0; i < p.length; i++) {
                    param = p[i];
                    if (param.arrayIndex) {
                        var tempVar = expressionCompiler.createTempVarName();
                        expressionCompiler.declareNumber(result, tempVar);
                        this.compileValueArray(result, tempVar, param.arrayIndex);
                        outputParams.push(tempVar);
                    } else if (param.calculation) {
                        outputParams.push(expressionCompiler.compileToTempVar(result, param.calculation) + '_1');
                    } else {
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
                    case 'proc':
                        return this.compileProc(line);

                    case 'endp':
                        return this.compileEndProc(line);

                    case 'struct':
                        return this.compileStruct(line);

                    case 'ends':
                        return this.compileEndStruct(line);

                    case 'for':
                        return this.compileFor(line.substr(i - line.length));

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

                    default:
                        var procCall = this._expressionCompiler.isProcCall(line);
                        if (procCall) {
                            return this.compileProcCall(line, procCall);
                        } else {
                            var operator = this._expressionCompiler.hasOperator(line);
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

                for (var i = 0; i < output.length; i++) {
                    //console.log(i + ']', output[i]);
                }
                return {
                    output:    output,
                    sourceMap: sourceMap
                };
            };
        })
    );
})();