/**
 * Wheel, copyright (c) 2020 - present by Arno van der Vegt
 * Distributed under an MIT license: https://arnovandervegt.github.io/wheel/license.txt
**/
const t        = require('../../compiler/tokenizer/tokenizer');
const Iterator = require('../../compiler/tokenizer/TokenIterator').Iterator;

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

    split(s, count) {
        let parts = [];
        let i     = 0;
        while ((i < s.length) && (parts.length < count - 1)) {
            while ((i < s.length) && (s[i] === ' ')) {
                i++;
            }
            let part = '';
            while ((i < s.length) && (s[i] !== ' ')) {
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

    getIndentSpace() {
        let space = '';
        this._indentStack.forEach((popCount) => {
            for (let i = 0; i < popCount; i++) {
                space += '    ';
            }
        });
        return space;
    }

    incIndent(popCount) {
        this._indentStack.push(popCount);
        return this;
    }

    decIndent() {
        if (this._indentStack.length) {
            let popCount = this._indentStack.pop();
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

    formatExpressionUntilEol(iterator, token) {
        let line = '';
        while (token && (token.lexeme !== t.LEXEME_NEWLINE)) {
            token = iterator.next();
            switch (token.cls) {
                case t.TOKEN_NUMERIC_OPERATOR:
                    line += ' ' + token.lexeme + ' ';
                    break;
                case t.TOKEN_BOOLEAN_OPERATOR:
                    line += ' ' + token.lexeme + ' ';
                    break;
                case t.TOKEN_ASSIGNMENT_OPERATOR:
                    line += ' ' + token.lexeme + ' ';
                    break;
                case t.TOKEN_COMMA:
                    line += token.lexeme + ' ';
                    break;
                default:
                    if (token.cls !== t.TOKEN_WHITE_SPACE) {
                        line += token.lexeme;
                    }
                    break;
            }
        }
        return line;
    }

    formatProcToken(iterator, token) {
        let line       = token.lexeme + ' ';
        let expectType = true;
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
        this
            .addLineToOutput(line)
            .incIndent(1);
    }

    formatRepeatToken(iterator, token) {
        let line = token.lexeme;
        this
            .addLineToOutput(this.getIndentSpace() + line)
            .incIndent(1);
        iterator.next();
    }

    formatTokenAndExpression(iterator, token) {
        this.addLineToOutput(this.getIndentSpace() + token.lexeme + ' ' + this.formatExpressionUntilEol(iterator, token));
    }

    formatTokenAndExpressionIncIndent(iterator, token) {
        this
            .addLineToOutput(this.getIndentSpace() + token.lexeme + ' ' + this.formatExpressionUntilEol(iterator, token))
            .incIndent(1);
    }

    formatSelectToken(iterator, token) {
        this
            .addLineToOutput(this.getIndentSpace() + token.lexeme + ' ' + this.formatExpressionUntilEol(iterator, token))
            .incIndent(2);
    }

    formatCaseToken(iterator, token) {
        let indent = this.getIndentSpace();
        if (indent.length >= 4) {
            indent = indent.substr(4, indent.length - 4);
        }
        this.addLineToOutput(indent + token.lexeme + ' ' + this.formatExpressionUntilEol(iterator, token));
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

    formatUnionToken(iterator, token) {
        let line = token.lexeme;
        iterator.skipWhiteSpace();
        this
            .decIndent()
            .addLineToOutput(this.getIndentSpace() + line)
            .incIndent(1);
    }

    formatEndToken(iterator, token) {
        let line     = token.lexeme;
        let popCount = 0;
        if (this._indentStack.length) {
            let popCount = this._indentStack.pop();
        }
        this.addLineToOutput(this.getIndentSpace() + line);
        if (popCount > 1) {
            this._indentStack.pop();
        }
        iterator.next();
    }

    formatKeywordToken(iterator, token) {
        switch (token.lexeme) {
            case t.LEXEME_UNION:  this.formatUnionToken                 (iterator, token); break;
            case t.LEXEME_PROC:   this.formatProcToken                  (iterator, token); break;
            case t.LEXEME_REPEAT: this.formatRepeatToken                (iterator, token); break;
            case t.LEXEME_OBJECT: this.formatTokenAndExpressionIncIndent(iterator, token); break;
            case t.LEXEME_RECORD: this.formatTokenAndExpressionIncIndent(iterator, token); break;
            case t.LEXEME_WHILE:  this.formatTokenAndExpressionIncIndent(iterator, token); break;
            case t.LEXEME_IF:     this.formatTokenAndExpressionIncIndent(iterator, token); break;
            case t.LEXEME_WITH:   this.formatTokenAndExpressionIncIndent(iterator, token); break;
            case t.LEXEME_RET:    this.formatTokenAndExpression         (iterator, token); break;
            case t.LEXEME_BREAK:  this.formatTokenAndExpression         (iterator, token); break;
            case t.LEXEME_SELECT: this.formatSelectToken                (iterator, token); break;
            case t.LEXEME_CASE:   this.formatCaseToken                  (iterator, token); break;
            case t.LEXEME_FOR:    this.formatForToken                   (iterator, token); break;
            case t.LEXEME_END:    this.formatEndToken                   (iterator, token); break;
            default:
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
                default:
                    line += ' ' + token.lexeme;
                    break;
            }
        }
        this.addLineToOutput(this.getIndentSpace() + line + this.formatExpressionUntilEol(iterator, token))
    }

    formatDefines(firstLine) {
        let i          = firstLine;
        let output     = this._output;
        let parts      = [];
        let maxLength1 = 0;
        let maxLength2 = 0;
        while ((i < output.length) && (output[i].trim().indexOf('#define') === 0)) {
            let line    = output[i];
            let comment = '';
            let j       = line.indexOf(';');
            if (j !== -1) {
                comment = line.substr(j + 1 - line.length).trim();
                line    = line.substr(0, j);
            }
            let p = this.split(line, 3).filter((part) => part.length);
            parts.push({p1: p[1], p2: p[2], comment: comment});
            maxLength1 = Math.max(p[1].length, maxLength1);
            maxLength2 = Math.max(p[2].length, maxLength2);
            i++;
        }
        parts.forEach((part, index) => {
            output[firstLine + index] = ('#define ' +
                this.toLength(part.p1, maxLength1) + ' ' +
                this.toLength(part.p2, maxLength2) + ' ' +
                (part.comment ? ('; ' + part.comment) : '')).trim();
        });
        return i;
    }

    formatOutput() {
        let output = this._output;
        let i      = 0;
        while (i < output.length) {
            let line = output[i];
            if (line.trim().indexOf('#define') === 0) {
                i = this.formatDefines(i);
            } else if (line.trim().indexOf('record') === 0) {
            }
            i++;
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
                    if (token.lexeme === t.LEXEME_NEWLINE) {
                        if (token.comment) {
                            this.addLineToOutput('; ' + this.rtrim(token.comment));
                        } else if (this.getLastLine() !== '') {
                            this.addLineToOutput('');
                        }
                    }
                    break;
                case t.TOKEN_TYPE:
                    this.formatIdentifierToken(iterator, token);
                    break;
                case t.TOKEN_META:
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
                        line += '; ' + lastToken.comment.trim();
                    }
                    this.addLineToOutput(line);
                    break;
                case t.TOKEN_KEYWORD:
                    this.formatKeywordToken(iterator, token);
                    break;
                case t.TOKEN_IDENTIFIER:
                    this.formatIdentifierToken(iterator, token);
                    break;
            }
        }
        this.formatOutput();
        return this._output.join('\n');
    }
};
