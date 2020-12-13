/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const t        = require('../../compiler/tokenizer/tokenizer');
const Iterator = require('../../compiler/tokenizer/TokenIterator').Iterator;

const IGNORE_WHEN_START_LEXEMES = [
        t.LEXEME_END,
        t.LEXEME_PROC,
        t.LEXEME_IF,
        t.LEXEME_ELSEIF,
        t.LEXEME_FOR,
        t.LEXEME_WHILE,
        t.LEXEME_REPEAT,
        t.LEXEME_BREAK,
        t.LEXEME_CASE,
        t.LEXEME_UNION,
        t.LEXEME_WITH,
        '#',
        ';'
    ];

const META_COMMANDS = [
        t.LEXEME_META_PROJECT,
        t.LEXEME_META_INCLUDE,
        t.LEXEME_META_DEFINE,
        t.LEXEME_META_IMAGE,
        t.LEXEME_META_TEXT,
        t.LEXEME_META_RESOURCE,
        t.LEXEME_META_DATA,
        t.LEXEME_META_LINE,
        t.LEXEME_META_FORMAT,
        t.LEXEME_META_NOFORMAT,
        t.LEXEME_META_DISPLAY,
        t.LEXEME_META_HEAP,
        t.LEXEME_META_OPTIMIZER,
        t.LEXEME_META_RANGECHECK,
        t.LEXEME_META_DATATYPE,
        t.LEXEME_META_STRINGLENGTH,
        t.LEXEME_META_STRINGCOUNT,
        t.LEXEME_META_BREAK
    ];

const ALPHA_NUM = '0123456789abcdefghijklmnopqrstuvwxyz_';

exports.SourceFormatter = class {
    constructor() {
        this._indentStack = [];
        this._output      = [];
    }

    toLength(s, length) {
        while (s.length < length) {
            s += ' ';
        }
        return s;
    }

    splitAtSpace(s, count) {
        let parts = [];
        let i     = 0;
        while ((i < s.length) && (parts.length < count - 1)) {
            while ((i < s.length) && (s[i] === ' ')) {
                i++;
            }
            let part = '';
            while ((i < s.length) && (s[i] !== ' ')) {
                if (s[i] === '"') { // Check if it's a string...
                    part += s[i];
                    i++;
                    while ((i < s.length) && (s[i] !== '"')) {
                        part += s[i];
                        i++;
                    }
                    part += s[i];
                    i++;
                    if (i >= s.length) {
                        break;
                    }
                }
                part += s[i];
                i++;
            }
            parts.push(part);
        }
        if (i < s.length) {
            parts.push(s.substr(i - s.length).trim());
        }
        return parts;
    }

    splitAtSpaceFilrered(s, count) {
        return this.splitAtSpace(s, count).filter((part) => part.length);
    }

    splitComment(s) {
        let i = 0;
        while (i < s.length) {
            if (s[i] === ';') {
                return {
                    line:    s.substr(0, i),
                    comment: s.substr(i + 1 - s.length).trim()
                };
            } else if (s[i] === '"') {
                i++;
                while ((i < s.length - 2) && (s[i] !== '"')) {
                    i++;
                }
            }
            i++;
        }
        return false;
    }

    splitAssignement(s) {
        for (let i = 0; i < IGNORE_WHEN_START_LEXEMES.length; i++) {
            if (s.trim().substr(0, IGNORE_WHEN_START_LEXEMES[i].length) === IGNORE_WHEN_START_LEXEMES[i]) {
                return false;
            }
        }
        let assignments = [
                t.LEXEME_ASSIGN,
                t.LEXEME_ASSIGN_ADD,
                t.LEXEME_ASSIGN_SUB,
                t.LEXEME_ASSIGN_MUL,
                t.LEXEME_ASSIGN_DIV
            ];
        let i = 1;
        while (i < s.length - 2) {
            if (s[i] === '"') {
                i++;
                while ((i < s.length - 2) && (s[i] !== '"')) {
                    i++;
                }
            } else {
                for (let j = 0; j < assignments.length; j++) {
                    let assignment = assignments[j];
                    if (s.substr(i, assignment.length) === assignment) {
                        return {
                            assignment: assignment,
                            dest:       s.substr(0, i).trim(),
                            source:     s.substr(i - s.length + assignment.length).trim()
                        };
                    }
                }
            }
            i++;
        }
        return false;
    }

    splitProcCall(s) {
        let finished = false;
        let i        = 0;
        const skipChars = (openChar, closeChar) => {
                let openCount = 1;
                i++;
                while ((i < s.length) && openCount) {
                    if (s[i] === openChar) {
                        openCount++;
                    } else if (s[i] === closeChar) {
                        openCount--;
                    }
                    i++;
                }
            };
        const findProcName = () => {
                let found        = false;
                let lastAlphaNum = '';
                while ((i < s.length) && !found) {
                    let c = s[i];
                    switch (c) {
                        case '[':
                            skipChars('[', ']');
                            break;
                        case '(':
                            if (lastAlphaNum === null) {
                                skipChars('(', ')');
                            } else {
                                found = true;
                            }
                            break;
                        default:
                            lastAlphaNum = (ALPHA_NUM.indexOf(c) === -1) ? null : c;
                            break;
                    }
                    i++;
                }
                return s.substr(0, i - 1);
            };
        const findParam = () => {
                let found = false;
                let start = i;
                while ((i < s.length) && !found) {
                    let c = s[i];
                    switch (c) {
                        case ',':
                        case ')':
                            found = true;
                            break;
                        case '(':
                            skipChars('(', ')');
                            i--;
                            break;
                        case '[':
                            skipChars('[', ']');
                            i--;
                            break;
                    }
                    i++;
                }
                return s.substr(start, i - start - 1).trim();
            };
        let result = {
                name:   findProcName(),
                params: []
            };
        while (!finished && (i < s.length)) {
            let param = findParam().trim();
            if (param !== '') {
                result.params.push(param);
            }
        }
        return result;
    }

    startsWith(s, items) {
        s = s.trim();
        for (let i = 0; i < items.length; i++) {
            if (s.indexOf(items[i]) === 0) {
                return items[i];
            }
        }
        return false;
    }

    startsWithSpace(s) {
        return s.length && (s[0] === ' ');
    }

    addToOutput(s) {
        let output = this._output;
        if (output.length) {
            output[output.length - 1] += s;
        } else {
            output.push(s);
        }
    }

    addLineToOutput(s) {
        this._output.push(s || '');
        return this;
    }

    getLastLine() {
        let output = this._output;
        if (output.length) {
            return output[output.length - 1];
        }
        return null;
    }

    getIndentSpace(back) {
        let space = '';
        this._indentStack.forEach((item) => {
            for (let i = 0; i < item.popCount; i++) {
                space += '    ';
            }
        });
        if (back && (space.length >= 4)) {
            space = space.substr(4, space.length - 4);
        }
        return space;
    }

    incIndent(popCount, isProc) {
        let indentStack = this._indentStack;
        if (isProc !== undefined) {
            indentStack.push({popCount: popCount, isProc: isProc});
        } else if (indentStack.length > 0) {
            indentStack.push({popCount: popCount, isProc: indentStack[indentStack.length - 1].isProc});
        } else {
            indentStack.push({popCount: popCount, isProc: false});
        }
        return this;
    }

    decIndent() {
        if (this._indentStack.length) {
            let popCount = this._indentStack.pop().popCount;
            if (popCount > 1) {
                this._indentStack.pop();
            }
        }
        return this;
    }

    rtrim(s) {
        while (s.length && ([' ', '\n', '\r', '\t'].indexOf(s[s.length - 1]) !== -1)) {
            s = s.substr(0, s.length - 1);
        }
        return s;
    }

    hasAssignment(s) {
        let lineAndComment = this.splitComment(s);
        if (lineAndComment) {
            s = lineAndComment.line;
        }
        return !!this.splitAssignement(s);
    }

    hasProcCall(s) {
        let lineAndComment = this.splitComment(s);
        if (lineAndComment) {
            s = lineAndComment.line;
        }
        let i = 1;
        while (i < s.length) {
            if ((s[i] === '(') && (ALPHA_NUM.indexOf(s[i - 1]) !== -1)) {
                return true;
            }
            i++;
        }
        return false;
    }

    formatExpressionUntilEol(iterator, token, line) {
        let lastToken;
        const lastLineCharIsSpace = () => {
                return line.length && (line[line.length - 1] === ' ');
            };
        while (token.lexeme !== t.LEXEME_NEWLINE) {
            lastToken = token;
            token     = iterator.next();
            if (!token) {
                break;
            }
            switch (token.cls) {
                case t.TOKEN_NUMERIC_OPERATOR:
                    line += (lastLineCharIsSpace() ? '' : ' ') + token.lexeme + ' ';
                    break;
                case t.TOKEN_BOOLEAN_OPERATOR:
                    line += (lastLineCharIsSpace() ? '' : ' ') + token.lexeme + ' ';
                    break;
                case t.TOKEN_ASSIGNMENT_OPERATOR:
                    line += (lastLineCharIsSpace() ? '' : ' ') + token.lexeme + ' ';
                    break;
                case t.TOKEN_COMMA:
                    line += token.lexeme + ' ';
                    break;
                case t.TOKEN_KEYWORD:
                    line += (lastLineCharIsSpace() ? '' : ' ') + token.lexeme + ' ';
                    break;
                default:
                    if (token.cls !== t.TOKEN_WHITE_SPACE) {
                        line += token.lexeme;
                    }
                    break;
            }
        }
        if (token && token.comment) {
            if (line.trim() === '') {
                line = ' ; ' + this.rtrim(token.comment);
            } else {
                line = this.rtrim(line) + ' ; ' + token.comment.trim();
            }
        }
        return line;
    }

    formatProcToken(iterator, token) {
        let indentStack = this._indentStack;
        let line        = token.lexeme + ' ';
        let expectType  = true;
        if (indentStack.length && indentStack[indentStack.length - 1].isProc) {
            this.addLineToOutput(this.getIndentSpace() + line + this.formatExpressionUntilEol(iterator, token, ''));
            return;
        }
        iterator.skipWhiteSpace();
        token = iterator.next();
        line += token.lexeme;
        token = iterator.peek();
        // Check if it's an object method...
        if (token.cls === t.TOKEN_DOT) {
            token = iterator.next();
            line += token.lexeme;
            token = iterator.next();
            if (token) {
                line += token.lexeme;
            }
        }
        while (token && (token.lexeme !== t.LEXEME_NEWLINE)) {
            token = iterator.next();
            switch (token.cls) {
                case t.TOKEN_IDENTIFIER:
                    line += token.lexeme;
                    if (expectType) {
                        line += ' ';
                        expectType = false;
                    }
                    break;
                case t.TOKEN_TYPE:
                    line += token.lexeme;
                    if (expectType) {
                        line += ' ';
                        expectType = false;
                    }
                    break;
                case t.TOKEN_COMMA:
                    line += token.lexeme + ' ';
                    expectType = true;
                    break;
                default:
                    if (token.cls !== t.TOKEN_WHITE_SPACE) {
                        line += token.lexeme;
                    }
                    break;
            }
        }
        if (token && token.comment) {
            line += ' ; ' + token.comment.trim();
        }
        this
            .addLineToOutput(line)
            .incIndent(1, true);
    }

    formatTokenAndExpression(iterator, token) {
        let line = this.formatExpressionUntilEol(iterator, token, '');
        this.addLineToOutput(this.getIndentSpace() + token.lexeme + (line.length ? ' ' : '') + line);
    }

    formatTokenAndExpressionIncIndent(iterator, token) {
        let line = this.formatExpressionUntilEol(iterator, token, '');
        this
            .addLineToOutput(this.getIndentSpace() + token.lexeme + (this.startsWithSpace(line) ? '' : ' ') + line)
            .incIndent(1);
    }

    formatSingleToken(iterator, token) {
        this
            .decIndent()
            .addLineToOutput(this.getIndentSpace() + this.formatExpressionUntilEol(iterator, token, token.lexeme))
            .incIndent(1);
    }

    formatSuperToken(iterator, token) {
        this.addLineToOutput(this.getIndentSpace() + token.lexeme + this.formatExpressionUntilEol(iterator, token, ''));
    }

    formatElseifToken(iterator, token) {
        let indent = this.getIndentSpace(true);
        let line  = this.formatExpressionUntilEol(iterator, token, '');
        this.addLineToOutput(indent + token.lexeme + (this.startsWithSpace(line) ? '' : ' ') + line);
    }

    formatSelectToken(iterator, token) {
        let line = this.formatExpressionUntilEol(iterator, token, '');
        this
            .addLineToOutput(this.getIndentSpace() + token.lexeme + (this.startsWithSpace(line) ? '' : ' ') + line)
            .incIndent(2);
    }

    formatCaseToken(iterator, token) {
        let indent = this.getIndentSpace(true);
        let line   = this.formatExpressionUntilEol(iterator, token, '');
        this.addLineToOutput(indent + token.lexeme + (this.startsWithSpace(line) ? '' : ' ') + line);
    }

    formatDefaultToken(iterator, token) {
        let indent = this.getIndentSpace(true);
        this.addLineToOutput(indent + token.lexeme + this.formatExpressionUntilEol(iterator, token, ''));
    }

    formatForToken(iterator, token) {
        let line = token.lexeme;
        while (token && (token.lexeme !== t.LEXEME_NEWLINE)) {
            token = iterator.next();
            if (token.cls !== t.TOKEN_WHITE_SPACE) {
                line += ' ' + token.lexeme;
            }
        }
        this
            .addLineToOutput(this.getIndentSpace() + line)
            .incIndent(1);
    }

    formatBreakToken(iterator, token) {
        let line = this.rtrim(this.formatExpressionUntilEol(iterator, token, token.lexeme + ' '));
        this.addLineToOutput(this.getIndentSpace() + line);
    }

    formatRepeatToken(iterator, token) {
        let line = this.rtrim(this.formatExpressionUntilEol(iterator, token, token.lexeme + ' '));
        this
            .addLineToOutput(this.getIndentSpace() + line)
            .incIndent(1);
    }

    formatEndToken(iterator, token) {
        let line     = token.lexeme;
        let popCount = 0;
        if (this._indentStack.length) {
            let popCount = this._indentStack.pop();
        }
        iterator.skipWhiteSpaceWithoutNewline();
        token = iterator.peek();
        if (token && (token.lexeme === t.LEXEME_NEWLINE) && token.comment) {
            line += ' ; ' + token.comment.trim();
            token.comment = false;
        }
        this.addLineToOutput(this.getIndentSpace() + line);
        if (popCount > 1) {
            this._indentStack.pop();
        }
        iterator.next();
    }

    formatKeywordToken(iterator, token) {
        switch (token.lexeme) {
            case t.LEXEME_PROC:    this.formatProcToken                  (iterator, token); break;
            case t.LEXEME_UNION:   this.formatSingleToken                (iterator, token); break;
            case t.LEXEME_ELSE:    this.formatSingleToken                (iterator, token); break;
            case t.LEXEME_REPEAT:  this.formatRepeatToken                (iterator, token); break;
            case t.LEXEME_BREAK:   this.formatBreakToken                 (iterator, token); break;
            case t.LEXEME_OBJECT:  this.formatTokenAndExpressionIncIndent(iterator, token); break;
            case t.LEXEME_RECORD:  this.formatTokenAndExpressionIncIndent(iterator, token); break;
            case t.LEXEME_WHILE:   this.formatTokenAndExpressionIncIndent(iterator, token); break;
            case t.LEXEME_IF:      this.formatTokenAndExpressionIncIndent(iterator, token); break;
            case t.LEXEME_WITH:    this.formatTokenAndExpressionIncIndent(iterator, token); break;
            case t.LEXEME_RET:     this.formatTokenAndExpression         (iterator, token); break;
            case t.LEXEME_ADDR:    this.formatTokenAndExpression         (iterator, token); break;
            case t.LEXEME_MOD:     this.formatTokenAndExpression         (iterator, token); break;
            case t.LEXEME_SUPER:   this.formatSuperToken                 (iterator, token); break;
            case t.LEXEME_ELSEIF:  this.formatElseifToken                (iterator, token); break;
            case t.LEXEME_SELECT:  this.formatSelectToken                (iterator, token); break;
            case t.LEXEME_CASE:    this.formatCaseToken                  (iterator, token); break;
            case t.LEXEME_DEFAULT: this.formatDefaultToken               (iterator, token); break;
            case t.LEXEME_FOR:     this.formatForToken                   (iterator, token); break;
            case t.LEXEME_END:     this.formatEndToken                   (iterator, token); break;
            default:
                this.addLineToOutput(token.lexeme + ' ' + this.formatExpressionUntilEol(iterator, token, ''));
                console.error('Unsupported keyword token:', token.lexeme);
                break;
        }
    }

    formatIdentifierToken(iterator, token) {
        let line = token.lexeme;
        iterator.skipWhiteSpace();
        token = iterator.next();
        if (token) {
            switch (token.cls) {
                case t.TOKEN_PARENTHESIS_OPEN:
                    line += token.lexeme;
                    break;
                case t.LEXEME_BRACKET_OPEN:
                    line += token.lexeme;
                    break;
                case t.TOKEN_ASSIGNMENT_OPERATOR:
                    line += ' ' + token.lexeme + ' ';
                    break;
                case t.TOKEN_DOT:
                    line += token.lexeme;
                    break;
                default:
                    line += ' ' + token.lexeme;
                    break;
            }
        }
        this.addLineToOutput(this.getIndentSpace() + line + this.formatExpressionUntilEol(iterator, token, ''));
    }

    formatPointerIdentifierToken(iterator, token) {
        let line = token.lexeme;
        iterator.skipWhiteSpace();
        token = iterator.next();
        if (token) {
            line += token.lexeme;
            token = iterator.next();
        }
        if (token) {
            switch (token.cls) {
                case t.TOKEN_PARENTHESIS_OPEN:
                    line += token.lexeme;
                    break;
                case t.LEXEME_BRACKET_OPEN:
                    line += token.lexeme;
                    break;
                case t.TOKEN_ASSIGNMENT_OPERATOR:
                    line += ' ' + token.lexeme + ' ';
                    break;
                default:
                    line += ' ' + token.lexeme;
                    break;
            }
        }
        this.addLineToOutput(this.getIndentSpace() + line + this.formatExpressionUntilEol(iterator, token, ''));
    }

    formatMeta(meta, firstLine) {
        let i          = firstLine;
        let output     = this._output;
        let parts      = [];
        let maxLength1 = 0;
        let maxLength2 = 0;
        while ((i < output.length) && (output[i].trim().indexOf(meta) === 0)) {
            let line           = output[i];
            let comment        = '';
            let lineAndComment = this.splitComment(line);
            if (lineAndComment) {
                comment = lineAndComment.comment;
                line    = lineAndComment.line;
            }
            let p    = this.splitAtSpaceFilrered(line, 3);
            let part = {p1: p[1] || '', p2: p[2] || '', comment: comment};
            parts.push(part);
            maxLength1 = Math.max(part.p1.length, maxLength1);
            maxLength2 = Math.max(part.p2.length, maxLength2);
            i++;
        }
        parts.forEach((part, index) => {
            output[firstLine + index] = (meta + ' ' +
                (maxLength1 ? (this.toLength(part.p1, maxLength1) + ' ') : '') +
                (maxLength2 ? (this.toLength(part.p2, maxLength2) + ' ') : '') +
                (part.comment ? ('; ' + part.comment) : '')).trim();
        });
        return i;
    }

    formatVars(firstLine) {
        let i          = firstLine;
        let output     = this._output;
        let parts      = [];
        let maxLength0 = 0;
        let maxLength1 = 0;
        while ((i < output.length) && (this.splitAtSpaceFilrered(output[i], 2).length >= 2)) {
            let line = output[i];
            if (this.startsWith(line, IGNORE_WHEN_START_LEXEMES) || this.hasProcCall(line)) {
                break;
            }
            let comment        = '';
            let lineAndComment = this.splitComment(line);
            if (lineAndComment) {
                comment = lineAndComment.comment;
                line    = lineAndComment.line;
            }
            let p    = this.splitAtSpaceFilrered(line, 2);
            let part = {p0: p[0] || '', p1: p[1] || '', comment: comment};
            parts.push(part);
            maxLength0 = Math.max(part.p0.length, maxLength0);
            maxLength1 = Math.max(part.p1.length, maxLength1);
            i++;
        }
        parts.forEach((part, index) => {
            // Keep the original indentation...
            let line   = output[firstLine + index];
            let indent = '';
            let i      = 0;
            while ((i < line.length) && (line[i] === ' ')) {
                indent += ' ';
                i++;
            }
            output[firstLine + index] = indent + (
                (maxLength0 ? (this.toLength(part.p0, maxLength0) + ' ') : '') +
                (maxLength1 ? (this.toLength(part.p1, maxLength1) + ' ') : '') +
                (part.comment ? ('; ' + part.comment) : '')
            ).trim();
        });
        return i;
    }

    formatAssignment(firstLine) {
        let i                = firstLine;
        let output           = this._output;
        let parts            = [];
        let maxLength0       = 0;
        let maxLength1       = 0;
        let assignmentLength = 1;
        while ((i < output.length) && this.hasAssignment(output[i])) {
            let line           = output[i];
            let lineAndComment = this.splitComment(line);
            let assignment     = this.splitAssignement(lineAndComment ? lineAndComment.line : line);
            assignment.comment = lineAndComment ? lineAndComment.comment : false;
            parts.push(assignment);
            maxLength1       = Math.max(assignment.dest.length,       maxLength1);
            maxLength0       = Math.max(assignment.source.length,     maxLength0);
            assignmentLength = Math.max(assignment.assignment.length, assignmentLength);
            i++;
        }
        parts.forEach((part, index) => {
            // Keep the original indentation...
            let line   = output[firstLine + index];
            let indent = '';
            let i      = 0;
            while ((i < line.length) && (line[i] === ' ')) {
                indent += ' ';
                i++;
            }
            output[firstLine + index] = indent + (
                (maxLength1 ? (this.toLength(part.dest, maxLength1) + ' ') : '') +
                (part.assignment + ' ').substr(0, assignmentLength) + ' ' +
                (maxLength0 ? (this.toLength(part.source, maxLength0) + ' ') : '') +
                (part.comment ? ('; ' + part.comment) : '')
            ).trim();
        });
        return i;
    }

    formatProcCall(firstLine) {
        let output         = this._output;
        let lineAndComment = this.splitComment(output[firstLine]);
        let startProc      = this.splitProcCall(lineAndComment ? lineAndComment.line : output[firstLine]);
        let lines          = [];
        let i              = firstLine;
        while (i < output.length) {
            let lineAndComment = this.splitComment(output[i]);
            let proc           = this.splitProcCall(lineAndComment ? lineAndComment.line : output[i]);
            if (proc.name !== startProc.name) {
                break;
            }
            lines.push({
                lineAndComment: lineAndComment,
                proc:           proc
            });
            i++;
        }
        if (lines.length <= 1) {
            return firstLine;
        }
        let paramLength = [];
        lines.forEach((line) => {
            line.proc.params.forEach((param, index) => {
                if (paramLength[index] === undefined) {
                    paramLength[index] = param.length;
                } else {
                    paramLength[index] = Math.max(param.length, paramLength[index]);
                }
            });
        });
        let maxLength = 0;
        lines.forEach((line, index) => {
            let s = startProc.name + '(';
            let j = line.proc.params.length - 1;
            line.proc.params.forEach((param, index) => {
                let p = param.trim() + ((index < j) ? ',' : '');
                s += this.toLength(p, (paramLength[index] || 1) + 2);
                maxLength = Math.max(maxLength, s.length);
            });
            s = this.rtrim(s) + ')';
            output[firstLine + index] = s;
        });
        lines.forEach((line, index) => {
            if (line.lineAndComment) {
                let s = output[firstLine + index];
                output[firstLine + index] = this.toLength(s, maxLength) + '; ' + line.lineAndComment.comment.trim();
            }
        });
        return i;
    }

    formatOutput() {
        let output = this._output;
        let i      = 0;
        while (i < output.length) {
            let line      = output[i];
            let startMeta = this.startsWith(line, META_COMMANDS);
            if (line.trim().indexOf(t.LEXEME_META_NOFORMAT) === 0) {
                while (i < output.length) {
                    if (line.trim().indexOf(t.LEXEME_META_FORMAT) === 0) {
                        break;
                    }
                    i++;
                }
            } else if (startMeta) {
                i = this.formatMeta(startMeta, i);
            } else if ((line.trim().indexOf(t.LEXEME_RECORD) === 0) || (line.trim().indexOf(t.LEXEME_OBJECT) === 0)) {
                i = this.formatVars(i + 1);
            } else if (this.hasAssignment(line)) {
                i = this.formatAssignment(i);
            } else if (!this.startsWith(line, IGNORE_WHEN_START_LEXEMES) && !this.hasProcCall(line) &&
                (this.splitAtSpaceFilrered(line, 2).length >= 2)) {
                i = this.formatVars(i);
            } else if (this.hasProcCall(line)) {
                i = this.formatProcCall(i);
            }
            i++;
        }
    }

    formatNoFormat(iterator, token) {
        let line = token.lexeme;
        let done = false;
        while (!done) {
            let token = iterator.next();
            if (!token) {
                this.addLineToOutput(line);
                break;
            }
            switch (token.cls) {
                case t.TOKEN_WHITE_SPACE:
                    if (token.lexeme === t.LEXEME_NEWLINE) {
                        if (token.comment) {
                            line += ';' + token.comment;
                        }
                        this.addLineToOutput(line);
                        line = '';
                    } else {
                        line += token.lexeme;
                    }
                    break;
                case t.TOKEN_META:
                    if (token.lexeme === t.LEXEME_META_FORMAT) {
                        if (line !== '') {
                            this.addLineToOutput(line);
                        }
                        line = token.lexeme;
                        iterator.skipWhiteSpaceWithoutNewline();
                        token = iterator.peek();
                        if (token && (token.lexeme === t.LEXEME_NEWLINE)) {
                            if (token.comment) {
                                line += ' ; ' + token.comment.trim();
                            }
                            iterator.next();
                        }
                        this.addLineToOutput(line);
                        done = true;
                    } else {
                        line += token.lexeme;
                    }
                    break;
                default:
                    line += token.lexeme;
                    break;
            }
        }
    }

    format(source) {
        let lastToken;
        let tokens   = new t.Tokenizer().tokenize(source).getTokens();
        let iterator = new Iterator({tokens: tokens});
        let line;
        while (true) {
            let token = iterator.next();
            if (!token) {
                break;
            }
            switch (token.cls) {
                case t.TOKEN_WHITE_SPACE:
                    let commentToken = null;
                    if (token.lexeme === t.LEXEME_NEWLINE) {
                        if (token.comment) {
                            commentToken = token;
                        } else if (this.getLastLine() !== '') {
                            this.addLineToOutput('');
                        }
                    } else if (token.comment) {
                        commentToken = token;
                    }
                    if (commentToken) {
                        let comment = this.rtrim(token.comment);
                        this.addLineToOutput(this.getIndentSpace() + ';' + ((comment.substr(0, 1) === ' ') ? '' : ' ') + comment);
                    }
                    break;
                case t.TOKEN_TYPE:
                    this.formatIdentifierToken(iterator, token);
                    break;
                case t.TOKEN_META:
                    if (token.lexeme === t.LEXEME_META_NOFORMAT) {
                        this.formatNoFormat(iterator, token);
                    } else {
                        line      = token.lexeme;
                        lastToken = null;
                        while (token && (token.lexeme !== t.LEXEME_NEWLINE)) {
                            token = iterator.next();
                            if (token && (token.cls !== t.TOKEN_WHITE_SPACE)) {
                                lastToken = token;
                                line += ' ' + token.lexeme;
                            }
                        }
                        if (lastToken && lastToken.comment) {
                            line += ' ; ' + lastToken.comment.trim();
                        } else if (token && token.comment) {
                            line += ' ; ' + token.comment.trim();
                        }
                        this.addLineToOutput(line);
                    }
                    break;
                case t.TOKEN_KEYWORD:
                    this.formatKeywordToken(iterator, token);
                    break;
                case t.TOKEN_POINTER:
                    this.formatPointerIdentifierToken(iterator, token);
                    break;
                case t.TOKEN_IDENTIFIER:
                    this.formatIdentifierToken(iterator, token);
                    break;
            }
        }
        this.formatOutput();
        return this._output.join('\n') + '\n';
    }
};
