class Node {
    get type() {
        return this._type;
    }
    get name() {
        return this._name;
    }
    get firstIndex() {
        return this._firstIndex;
    }
    get lastIndex() {
        return this._lastIndex;
    }
    get startIndex() {
        return this._firstIndex;
    }
    get endIndex() {
        return this._lastIndex + 1;
    }
    get parent() {
        return this._parent;
    }
    get children() {
        return this._children;
    }
    get hasChildren() {
        return this._children.length > 0;
    }
    get value() {
        return this.toString();
    }
    constructor(type, name, firstIndex, lastIndex, children = [], value = "") {
        this._type = type;
        this._name = name;
        this._firstIndex = firstIndex;
        this._lastIndex = lastIndex;
        this._parent = null;
        this._children = children;
        this._value = value;
        this._children.forEach(c => c._parent = this);
    }
    removeChild(node) {
        const index = this._children.indexOf(node);
        if (index > -1) {
            this._children.splice(index, 1);
            node._parent = null;
        }
    }
    removeAllChildren() {
        this._children.forEach(c => c._parent = null);
        this._children.length = 0;
    }
    replaceChild(newNode, referenceNode) {
        const index = this._children.indexOf(referenceNode);
        if (index > -1) {
            this._children.splice(index, 1, newNode);
            newNode._parent = this;
            referenceNode._parent = null;
        }
    }
    replaceWith(newNode) {
        if (this._parent != null) {
            this._parent.replaceChild(newNode, this);
        }
    }
    insertBefore(newNode, referenceNode) {
        newNode._parent = this;
        if (referenceNode == null) {
            this._children.push(newNode);
            return;
        }
        const index = this._children.indexOf(referenceNode);
        if (index > -1) {
            this._children.splice(index, 0, newNode);
        }
    }
    appendChild(newNode) {
        newNode._parent = this;
        this._children.push(newNode);
    }
    spliceChildren(index, deleteCount, ...items) {
        const removedItems = this._children.splice(index, deleteCount, ...items);
        removedItems.forEach(i => i._parent = null);
        items.forEach(i => i._parent = this);
        return removedItems;
    }
    nextSibling() {
        if (this._parent == null) {
            return null;
        }
        const children = this._parent._children;
        const index = children.indexOf(this);
        if (index > -1 && index < children.length - 1) {
            return children[index + 1];
        }
        return null;
    }
    previousSibling() {
        if (this._parent == null) {
            return null;
        }
        const children = this._parent._children;
        const index = children.indexOf(this);
        if (index > -1 && index > 0) {
            return children[index - 1];
        }
        return null;
    }
    find(predicate) {
        return this.findAll(predicate)[0] || null;
    }
    findAll(predicate) {
        const matches = [];
        this.walkUp(n => {
            if (predicate(n)) {
                matches.push(n);
            }
        });
        return matches;
    }
    findAncester(predicate) {
        let parent = this._parent;
        while (parent != null) {
            if (predicate(parent)) {
                return parent;
            }
            parent = parent._parent;
        }
        return null;
    }
    walkUp(callback) {
        const childrenCopy = this._children.slice();
        childrenCopy.forEach(c => c.walkUp(callback));
        callback(this);
    }
    walkDown(callback) {
        const childrenCopy = this._children.slice();
        callback(this);
        childrenCopy.forEach(c => c.walkDown(callback));
    }
    flatten() {
        const nodes = [];
        this.walkDown((node) => {
            if (!node.hasChildren) {
                nodes.push(node);
            }
        });
        return nodes;
    }
    reduce() {
        const value = this.toString();
        this.removeAllChildren();
        this._value = value;
    }
    remove() {
        if (this._parent != null) {
            this._parent.removeChild(this);
        }
    }
    clone() {
        return new Node(this._type, this._name, this._firstIndex, this._lastIndex, this._children.map((c) => c.clone()), this._value);
    }
    normalize(startIndex = this._firstIndex) {
        let length = 0;
        if (this.children.length === 0) {
            length = this._value.length;
        }
        else {
            length = this.children.reduce((acc, c) => acc + c.normalize(acc + startIndex), startIndex);
        }
        this._firstIndex = startIndex;
        this._lastIndex = Math.max(startIndex + length - 1, 0);
        return length;
    }
    toString() {
        if (this._children.length === 0) {
            return this._value;
        }
        return this._children.map(c => c.toString()).join("");
    }
    toCycleFreeObject() {
        return {
            type: this._type,
            name: this._name,
            value: this.toString(),
            firstIndex: this._firstIndex,
            lastIndex: this._lastIndex,
            startIndex: this.startIndex,
            endIndex: this.endIndex,
            children: this._children.map(c => c.toCycleFreeObject()),
        };
    }
    toJson(space) {
        return JSON.stringify(this.toCycleFreeObject(), null, space);
    }
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

class ParseError {
    constructor(startIndex, endIndex, pattern) {
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.pattern = pattern;
    }
}

class CursorHistory {
    constructor() {
        this._isRecording = false;
        this._leafMatches = [{ pattern: null, node: null }];
        this._furthestError = null;
        this._currentError = null;
        this._rootMatch = { pattern: null, node: null };
        this._patterns = [];
        this._nodes = [];
        this._errors = [];
        this._trace = [];
    }
    get isRecording() {
        return this._isRecording;
    }
    get rootMatch() {
        return this._rootMatch;
    }
    get leafMatch() {
        return this._leafMatches[this._leafMatches.length - 1];
    }
    get leafMatches() {
        return this._leafMatches;
    }
    get furthestError() {
        return this._furthestError;
    }
    get errors() {
        return this._errors;
    }
    get error() {
        return this._currentError;
    }
    get nodes() {
        return this._nodes;
    }
    get patterns() {
        return this._patterns;
    }
    get trace() {
        return this._trace;
    }
    recordMatch(pattern, node) {
        if (this._isRecording) {
            this._patterns.push(pattern);
            this._nodes.push(node);
        }
        this._rootMatch.pattern = pattern;
        this._rootMatch.node = node;
        const leafMatch = this._leafMatches[this._leafMatches.length - 1];
        const isFurthestMatch = leafMatch.node === null || node.lastIndex > leafMatch.node.lastIndex;
        const isSameIndexMatch = leafMatch.node === null || node.lastIndex === leafMatch.node.lastIndex;
        if (isFurthestMatch) {
            // This is to save on GC churn.
            const match = this._leafMatches.pop();
            match.pattern = pattern;
            match.node = node;
            this._leafMatches.length = 0;
            this._leafMatches.push(match);
        }
        else if (isSameIndexMatch) {
            const isAncestor = this._leafMatches.some((m) => {
                var _a;
                let parent = (_a = m.pattern) === null || _a === void 0 ? void 0 : _a.parent;
                while (parent != null) {
                    if (parent === pattern.parent) {
                        return true;
                    }
                    parent = parent.parent;
                }
                return false;
            });
            if (!isAncestor) {
                this._leafMatches.unshift({ pattern, node });
            }
        }
    }
    recordErrorAt(firstIndex, lastIndex, pattern) {
        const error = new ParseError(firstIndex, lastIndex, pattern);
        this._currentError = error;
        if (this._furthestError === null || lastIndex > this._furthestError.endIndex) {
            this._furthestError = error;
        }
        if (this._isRecording) {
            this._errors.push(error);
        }
    }
    startRecording() {
        this._isRecording = true;
    }
    stopRecording() {
        this._isRecording = false;
    }
    resolveError() {
        this._currentError = null;
    }
    pushStackTrace(trace) {
        if (this._isRecording) {
            this._trace.push(trace);
        }
    }
}

class Cursor {
    get text() {
        return this._text;
    }
    get isOnFirst() {
        return this._index === 0;
    }
    get isOnLast() {
        return this._index === this.getLastIndex();
    }
    get isRecording() {
        return this._history.isRecording;
    }
    get rootMatch() {
        return this._history.rootMatch;
    }
    get allMatchedNodes() {
        return this._history.nodes;
    }
    get allMatchedPatterns() {
        return this._history.patterns;
    }
    get leafMatch() {
        return this._history.leafMatch;
    }
    get leafMatches() {
        return this._history.leafMatches;
    }
    get furthestError() {
        return this._history.furthestError;
    }
    get error() {
        return this._history.error;
    }
    get errors() {
        return this._history.errors;
    }
    get index() {
        return this._index;
    }
    get length() {
        return this._length;
    }
    get hasError() {
        return this._history.error != null;
    }
    get currentChar() {
        return this._text[this._index];
    }
    constructor(text) {
        this._text = text;
        this._index = 0;
        this._length = text.length;
        this._history = new CursorHistory();
        this._stackTrace = [];
    }
    hasNext() {
        return this._index + 1 < this._length;
    }
    next() {
        if (this.hasNext()) {
            this._index++;
        }
    }
    hasPrevious() {
        return this._index - 1 >= 0;
    }
    previous() {
        if (this.hasPrevious()) {
            this._index--;
        }
    }
    moveTo(position) {
        if (position >= 0 && position < this._length) {
            this._index = position;
        }
    }
    moveToFirstChar() {
        this._index = 0;
    }
    moveToLastChar() {
        this._index = this.getLastIndex();
    }
    getLastIndex() {
        return this._length - 1;
    }
    getChars(first, last) {
        return this._text.slice(first, last + 1);
    }
    recordMatch(pattern, node) {
        this._history.recordMatch(pattern, node);
    }
    recordErrorAt(firstIndex, lastIndex, onPattern) {
        this._history.recordErrorAt(firstIndex, lastIndex, onPattern);
    }
    resolveError() {
        this._history.resolveError();
    }
    startRecording() {
        this._history.startRecording();
    }
    stopRecording() {
        this._history.stopRecording();
    }
    startParseWith(pattern) {
        const patternName = pattern.name;
        const trace = {
            id: pattern.id,
            patternName,
            cursorIndex: this.index
        };
        if (this._stackTrace.find(p => p.id === pattern.id && this.index === p.cursorIndex)) {
            throw new Error(`Cyclical Pattern: ${this._stackTrace.map(r => `${r.patternName}#${r.id}{${r.cursorIndex}}`).join(" -> ")} -> ${patternName}#${pattern.id}{${this.index}}.`);
        }
        this._history.pushStackTrace(trace);
        this._stackTrace.push(trace);
    }
    endParse() {
        this._stackTrace.pop();
    }
    audit() {
        return this._history.trace.map(t => {
            const characters = this.getChars(t.cursorIndex, t.cursorIndex + 5);
            const context = `{${t.cursorIndex}}${characters}`;
            return `${t.patternName}-->${context}`;
        });
    }
}

let idIndex$8 = 0;
class Literal {
    get id() {
        return this._id;
    }
    get type() {
        return this._type;
    }
    get name() {
        return this._name;
    }
    get parent() {
        return this._parent;
    }
    set parent(pattern) {
        this._parent = pattern;
    }
    get children() {
        return [];
    }
    get isOptional() {
        return this._isOptional;
    }
    constructor(name, value, isOptional = false) {
        if (value.length === 0) {
            throw new Error("Value Cannot be empty.");
        }
        this._id = `literal-${idIndex$8++}`;
        this._type = "literal";
        this._name = name;
        this._literal = value;
        this._runes = Array.from(value);
        this._isOptional = isOptional;
        this._parent = null;
        this._firstIndex = 0;
        this._lastIndex = 0;
        this._endIndex = 0;
    }
    test(text) {
        const cursor = new Cursor(text);
        const ast = this.parse(cursor);
        return (ast === null || ast === void 0 ? void 0 : ast.value) === text;
    }
    exec(text, record = false) {
        const cursor = new Cursor(text);
        record && cursor.startRecording();
        const ast = this.parse(cursor);
        return {
            ast: (ast === null || ast === void 0 ? void 0 : ast.value) === text ? ast : null,
            cursor
        };
    }
    parse(cursor) {
        cursor.startParseWith(this);
        this._firstIndex = cursor.index;
        const passed = this._tryToParse(cursor);
        if (passed) {
            cursor.resolveError();
            const node = this._createNode();
            cursor.recordMatch(this, node);
            cursor.endParse();
            return node;
        }
        if (!this._isOptional) {
            cursor.recordErrorAt(this._firstIndex, this._endIndex, this);
            cursor.endParse();
            return null;
        }
        cursor.resolveError();
        cursor.moveTo(this._firstIndex);
        cursor.endParse();
        return null;
    }
    _tryToParse(cursor) {
        let passed = false;
        const literalRuneLength = this._runes.length;
        for (let i = 0; i < literalRuneLength; i++) {
            const literalRune = this._runes[i];
            const cursorRune = cursor.currentChar;
            if (literalRune !== cursorRune) {
                this._endIndex = cursor.index;
                break;
            }
            if (i + 1 === literalRuneLength) {
                this._lastIndex = this._firstIndex + this._literal.length - 1;
                passed = true;
                break;
            }
            if (!cursor.hasNext()) {
                this._endIndex = cursor.index + 1;
                break;
            }
            cursor.next();
        }
        return passed;
    }
    _createNode() {
        return new Node("literal", this._name, this._firstIndex, this._lastIndex, undefined, this._literal);
    }
    clone(name = this._name, isOptional = this._isOptional) {
        const clone = new Literal(name, this._literal, isOptional);
        clone._id = this._id;
        return clone;
    }
    getTokens() {
        return [this._literal];
    }
    getTokensAfter(_lastMatched) {
        return [];
    }
    getNextTokens() {
        if (this.parent == null) {
            return [];
        }
        return this.parent.getTokensAfter(this);
    }
    getPatterns() {
        return [this];
    }
    getPatternsAfter() {
        return [];
    }
    getNextPatterns() {
        if (this.parent == null) {
            return [];
        }
        return this.parent.getPatternsAfter(this);
    }
    find(_predicate) {
        return null;
    }
}

let idIndex$7 = 0;
class Regex {
    get id() {
        return this._id;
    }
    get type() {
        return this._type;
    }
    get name() {
        return this._name;
    }
    get parent() {
        return this._parent;
    }
    set parent(pattern) {
        this._parent = pattern;
    }
    get children() {
        return [];
    }
    get isOptional() {
        return this._isOptional;
    }
    constructor(name, regex, isOptional = false) {
        this._node = null;
        this._cursor = null;
        this._firstIndex = -1;
        this._substring = "";
        this._tokens = [];
        this._id = `regex-${idIndex$7++}`;
        this._type = "regex";
        this._name = name;
        this._isOptional = isOptional;
        this._parent = null;
        this._originalRegexString = regex;
        this._regex = new RegExp(`^${regex}`, "g");
        this.assertArguments();
    }
    assertArguments() {
        if (this._originalRegexString.length < 1) {
            throw new Error("Invalid Arguments: The regex string argument needs to be at least one character long.");
        }
        if (this._originalRegexString.charAt(0) === "^") {
            throw new Error("Invalid Arguments: The regex string cannot start with a '^' because it is expected to be in the middle of a string.");
        }
        if (this._originalRegexString.charAt(this._originalRegexString.length - 1) === "$") {
            throw new Error("Invalid Arguments: The regex string cannot end with a '$' because it is expected to be in the middle of a string.");
        }
    }
    test(text) {
        const cursor = new Cursor(text);
        const ast = this.parse(cursor);
        return (ast === null || ast === void 0 ? void 0 : ast.value) === text;
    }
    exec(text, record = false) {
        const cursor = new Cursor(text);
        record && cursor.startRecording();
        const ast = this.parse(cursor);
        return {
            ast: (ast === null || ast === void 0 ? void 0 : ast.value) === text ? ast : null,
            cursor
        };
    }
    parse(cursor) {
        cursor.startParseWith(this);
        this._firstIndex = cursor.index;
        this.resetState(cursor);
        this.tryToParse(cursor);
        cursor.endParse();
        return this._node;
    }
    resetState(cursor) {
        this._cursor = cursor;
        this._regex.lastIndex = 0;
        this._substring = this._cursor.text.substr(this._cursor.index);
        this._node = null;
    }
    tryToParse(cursor) {
        const result = this._regex.exec(this._substring);
        if (result != null && result.index === 0) {
            this.processResult(cursor, result);
        }
        else {
            this.processError(cursor);
        }
    }
    processResult(cursor, result) {
        const currentIndex = cursor.index;
        const newIndex = currentIndex + result[0].length - 1;
        this._node = new Node("regex", this._name, currentIndex, newIndex, undefined, result[0]);
        cursor.moveTo(newIndex);
        cursor.recordMatch(this, this._node);
    }
    processError(cursor) {
        if (!this._isOptional) {
            cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
        }
        this._node = null;
    }
    clone(name = this._name, isOptional = this._isOptional) {
        const clone = new Regex(name, this._originalRegexString, isOptional);
        clone._tokens = this._tokens.slice();
        clone._id = this._id;
        return clone;
    }
    getTokens() {
        return this._tokens;
    }
    getTokensAfter(_childReference) {
        return [];
    }
    getNextTokens() {
        if (this.parent == null) {
            return [];
        }
        return this.parent.getTokensAfter(this);
    }
    getPatterns() {
        return [this];
    }
    getPatternsAfter(_childReference) {
        return [];
    }
    getNextPatterns() {
        if (this.parent == null) {
            return [];
        }
        return this.parent.getPatternsAfter(this);
    }
    find(_predicate) {
        return null;
    }
    setTokens(tokens) {
        this._tokens = tokens;
    }
}

function findPattern(pattern, predicate) {
    let children = [];
    if (pattern.type === "reference") {
        children = [];
    }
    else {
        children = pattern.children;
    }
    for (const child of children) {
        const result = findPattern(child, predicate);
        if (result !== null) {
            return result;
        }
    }
    if (predicate(pattern)) {
        return pattern;
    }
    else {
        return null;
    }
}

let idIndex$6 = 0;
class Reference {
    get id() {
        return this._id;
    }
    get type() {
        return this._type;
    }
    get name() {
        return this._name;
    }
    get parent() {
        return this._parent;
    }
    set parent(pattern) {
        this._parent = pattern;
    }
    get children() {
        return this._children;
    }
    get isOptional() {
        return this._isOptional;
    }
    constructor(name, isOptional = false) {
        this._id = `reference-${idIndex$6++}`;
        this._type = "reference";
        this._name = name;
        this._parent = null;
        this._isOptional = isOptional;
        this._pattern = null;
        this._children = [];
    }
    test(text) {
        const cursor = new Cursor(text);
        const ast = this.parse(cursor);
        return (ast === null || ast === void 0 ? void 0 : ast.value) === text;
    }
    exec(text, record = false) {
        const cursor = new Cursor(text);
        record && cursor.startRecording();
        const ast = this.parse(cursor);
        return {
            ast: (ast === null || ast === void 0 ? void 0 : ast.value) === text ? ast : null,
            cursor
        };
    }
    parse(cursor) {
        return this._getPatternSafely().parse(cursor);
    }
    _getPatternSafely() {
        if (this._pattern === null) {
            const pattern = this._findPattern();
            if (pattern === null) {
                throw new Error(`Couldn't find '${this._name}' pattern within tree.`);
            }
            const clonedPattern = pattern.clone(this._name, this._isOptional);
            clonedPattern.parent = this;
            this._pattern = clonedPattern;
            this._children = [this._pattern];
        }
        return this._pattern;
    }
    _findPattern() {
        const root = this._getRoot();
        return findPattern(root, (pattern) => {
            return pattern.name === this._name && pattern.type !== "reference";
        });
    }
    _getRoot() {
        let node = this;
        while (true) {
            const parent = node.parent;
            if (parent == null) {
                break;
            }
            else {
                node = parent;
            }
        }
        return node;
    }
    getTokens() {
        return this._getPatternSafely().getTokens();
    }
    getTokensAfter(_lastMatched) {
        if (this._parent == null) {
            return [];
        }
        return this._parent.getTokensAfter(this);
    }
    getNextTokens() {
        if (this.parent == null) {
            return [];
        }
        return this.parent.getTokensAfter(this);
    }
    getPatterns() {
        return this._getPatternSafely().getPatterns();
    }
    getPatternsAfter(_childReference) {
        if (this._parent == null) {
            return [];
        }
        return this._parent.getPatternsAfter(this);
    }
    getNextPatterns() {
        if (this.parent == null) {
            return [];
        }
        return this.parent.getPatternsAfter(this);
    }
    find(_predicate) {
        return null;
    }
    clone(name = this._name, isOptional = this._isOptional) {
        const clone = new Reference(name, isOptional);
        clone._id = this._id;
        return clone;
    }
}

function clonePatterns(patterns, isOptional) {
    return patterns.map(p => p.clone(p.name, isOptional));
}

let idIndex$5 = 0;
class Or {
    get id() {
        return this._id;
    }
    get type() {
        return this._type;
    }
    get name() {
        return this._name;
    }
    get parent() {
        return this._parent;
    }
    set parent(pattern) {
        this._parent = pattern;
    }
    get children() {
        return this._children;
    }
    get isOptional() {
        return this._isOptional;
    }
    constructor(name, options, isOptional = false, isGreedy = false) {
        if (options.length === 0) {
            throw new Error("Need at least one pattern with an 'or' pattern.");
        }
        const children = clonePatterns(options, false);
        this._assignChildrenToParent(children);
        this._id = `or-${idIndex$5++}`;
        this._type = "or";
        this._name = name;
        this._parent = null;
        this._children = children;
        this._isOptional = isOptional;
        this._firstIndex = 0;
        this._isGreedy = isGreedy;
    }
    _assignChildrenToParent(children) {
        for (const child of children) {
            child.parent = this;
        }
    }
    test(text) {
        const cursor = new Cursor(text);
        const ast = this.parse(cursor);
        return (ast === null || ast === void 0 ? void 0 : ast.value) === text;
    }
    exec(text, record = false) {
        const cursor = new Cursor(text);
        record && cursor.startRecording();
        const ast = this.parse(cursor);
        return {
            ast: (ast === null || ast === void 0 ? void 0 : ast.value) === text ? ast : null,
            cursor
        };
    }
    parse(cursor) {
        cursor.startParseWith(this);
        this._firstIndex = cursor.index;
        const node = this._tryToParse(cursor);
        if (node != null) {
            cursor.moveTo(node.lastIndex);
            cursor.resolveError();
            cursor.endParse();
            return node;
        }
        if (!this._isOptional) {
            cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
            cursor.endParse();
            return null;
        }
        cursor.resolveError();
        cursor.moveTo(this._firstIndex);
        cursor.endParse();
        return null;
    }
    _tryToParse(cursor) {
        const results = [];
        for (const pattern of this._children) {
            cursor.moveTo(this._firstIndex);
            const result = pattern.parse(cursor);
            if (this._isGreedy) {
                results.push(result);
            }
            if (!cursor.hasError && !this._isGreedy) {
                return result;
            }
            cursor.resolveError();
        }
        const nonNullResults = results.filter(r => r != null);
        nonNullResults.sort((a, b) => b.endIndex - a.endIndex);
        return nonNullResults[0] || null;
    }
    getTokens() {
        const tokens = [];
        for (const child of this._children) {
            tokens.push(...child.getTokens());
        }
        return tokens;
    }
    getTokensAfter(_childReference) {
        if (this._parent === null) {
            return [];
        }
        return this._parent.getTokensAfter(this);
    }
    getNextTokens() {
        if (this._parent == null) {
            return [];
        }
        return this._parent.getTokensAfter(this);
    }
    getPatterns() {
        const patterns = [];
        for (const pattern of this._children) {
            patterns.push(...pattern.getPatterns());
        }
        return patterns;
    }
    getPatternsAfter(_childReference) {
        if (this._parent === null) {
            return [];
        }
        return this._parent.getPatternsAfter(this);
    }
    getNextPatterns() {
        if (this.parent == null) {
            return [];
        }
        return this.parent.getPatternsAfter(this);
    }
    find(predicate) {
        return findPattern(this, predicate);
    }
    clone(name = this._name, isOptional = this._isOptional) {
        const or = new Or(name, this._children, isOptional, this._isGreedy);
        or._id = this._id;
        return or;
    }
}

let idIndex$4 = 0;
class FiniteRepeat {
    get id() {
        return this._id;
    }
    get type() {
        return this._type;
    }
    get name() {
        return this._name;
    }
    get parent() {
        return this._parent;
    }
    set parent(value) {
        this._parent = value;
    }
    get children() {
        return this._children;
    }
    get isOptional() {
        return this._min === 0;
    }
    get min() {
        return this._min;
    }
    get max() {
        return this._max;
    }
    constructor(name, pattern, repeatAmount, options = {}) {
        this._id = `finite-repeat-${idIndex$4++}`;
        this._type = "finite-repeat";
        this._name = name;
        this._parent = null;
        this._children = [];
        this._hasDivider = options.divider != null;
        this._min = options.min != null ? options.min : 1;
        this._max = repeatAmount;
        this._trimDivider = options.trimDivider == null ? false : options.trimDivider;
        for (let i = 0; i < repeatAmount; i++) {
            this._children.push(pattern.clone(pattern.name));
            if (options.divider != null && (i < repeatAmount - 1 || !this._trimDivider)) {
                this._children.push(options.divider.clone(options.divider.name, false));
            }
        }
    }
    parse(cursor) {
        cursor.startParseWith(this);
        const startIndex = cursor.index;
        const nodes = [];
        const modulo = this._hasDivider ? 2 : 1;
        let matchCount = 0;
        for (let i = 0; i < this._children.length; i++) {
            const childPattern = this._children[i];
            const node = childPattern.parse(cursor);
            if (i % modulo === 0 && !cursor.hasError) {
                matchCount++;
            }
            if (cursor.hasError) {
                cursor.resolveError();
                break;
            }
            if (node != null) {
                nodes.push(node);
                if (cursor.hasNext()) {
                    cursor.next();
                }
                else {
                    break;
                }
            }
        }
        if (this._trimDivider && this._hasDivider) {
            if (cursor.leafMatch.pattern === this.children[1]) {
                const node = nodes.pop();
                cursor.moveTo(node.firstIndex);
            }
        }
        if (matchCount < this._min) {
            const lastIndex = cursor.index;
            cursor.moveTo(startIndex);
            cursor.recordErrorAt(startIndex, lastIndex, this);
            cursor.endParse();
            return null;
        }
        else if (nodes.length === 0) {
            cursor.resolveError();
            cursor.moveTo(startIndex);
            cursor.endParse();
            return null;
        }
        const firstIndex = nodes[0].firstIndex;
        const lastIndex = nodes[nodes.length - 1].lastIndex;
        cursor.moveTo(lastIndex);
        cursor.endParse();
        return new Node(this._type, this.name, firstIndex, lastIndex, nodes);
    }
    test(text) {
        const cursor = new Cursor(text);
        const ast = this.parse(cursor);
        return (ast === null || ast === void 0 ? void 0 : ast.value) === text;
    }
    exec(text, record = false) {
        const cursor = new Cursor(text);
        record && cursor.startRecording();
        const ast = this.parse(cursor);
        return {
            ast: (ast === null || ast === void 0 ? void 0 : ast.value) === text ? ast : null,
            cursor
        };
    }
    clone(name = this._name, isOptional) {
        let min = this._min;
        if (isOptional != null) {
            if (isOptional) {
                min = 0;
            }
            else {
                min = Math.max(this._min, 1);
            }
        }
        const clone = new FiniteRepeat(name, this._children[0], this._max, {
            divider: this._hasDivider ? this._children[1] : undefined,
            min,
            trimDivider: this._trimDivider
        });
        clone._id = this._id;
        return clone;
    }
    getTokens() {
        return this._children[0].getTokens();
    }
    getTokensAfter(childReference) {
        const patterns = this.getPatternsAfter(childReference);
        const tokens = [];
        patterns.forEach(p => tokens.push(...p.getTokens()));
        return tokens;
    }
    getNextTokens() {
        if (this._parent == null) {
            return [];
        }
        return this._parent.getTokensAfter(this);
    }
    getPatterns() {
        return this._children[0].getPatterns();
    }
    getPatternsAfter(childReference) {
        const childIndex = this._children.indexOf(childReference);
        // If Reference Pattern isn't a child.
        if (childIndex === -1) {
            return [];
        }
        // If Reference Pattern is the last pattern. Ask for the parents next patterns 
        if (childIndex === this._children.length - 1) {
            if (this._parent == null) {
                return [];
            }
            else {
                return this._parent.getPatternsAfter(this);
            }
        }
        // Get the next childs patterns.
        const nextChild = this._children[childIndex + 1];
        return nextChild.getPatterns();
    }
    getNextPatterns() {
        if (this._parent == null) {
            return [];
        }
        return this._parent.getPatternsAfter(this);
    }
    find(predicate) {
        return findPattern(this, predicate);
    }
}

let idIndex$3 = 0;
class InfiniteRepeat {
    get id() {
        return this._id;
    }
    get type() {
        return this._type;
    }
    get name() {
        return this._name;
    }
    get parent() {
        return this._parent;
    }
    set parent(pattern) {
        this._parent = pattern;
    }
    get children() {
        return this._children;
    }
    get isOptional() {
        return this._min === 0;
    }
    get min() {
        return this._min;
    }
    constructor(name, pattern, options = {}) {
        const min = options.min != null ? options.min : 1;
        const divider = options.divider;
        let children;
        if (divider != null) {
            children = [pattern.clone(pattern.name, false), divider.clone(divider.name, false)];
        }
        else {
            children = [pattern.clone(pattern.name, false)];
        }
        this._assignChildrenToParent(children);
        this._id = `infinite-repeat-${idIndex$3++}`;
        this._type = "infinite-repeat";
        this._name = name;
        this._min = min;
        this._parent = null;
        this._children = children;
        this._pattern = children[0];
        this._divider = children[1];
        this._firstIndex = -1;
        this._nodes = [];
        this._trimDivider = options.trimDivider == null ? false : options.trimDivider;
    }
    _assignChildrenToParent(children) {
        for (const child of children) {
            child.parent = this;
        }
    }
    test(text) {
        const cursor = new Cursor(text);
        const ast = this.parse(cursor);
        return (ast === null || ast === void 0 ? void 0 : ast.value) === text;
    }
    exec(text, record = false) {
        const cursor = new Cursor(text);
        record && cursor.startRecording();
        const ast = this.parse(cursor);
        return {
            ast: (ast === null || ast === void 0 ? void 0 : ast.value) === text ? ast : null,
            cursor
        };
    }
    parse(cursor) {
        cursor.startParseWith(this);
        this._firstIndex = cursor.index;
        this._nodes = [];
        const passed = this._tryToParse(cursor);
        if (passed) {
            cursor.resolveError();
            const node = this._createNode(cursor);
            if (node != null) {
                cursor.moveTo(node.lastIndex);
                cursor.recordMatch(this, node);
            }
            cursor.endParse();
            return node;
        }
        if (this._min > 0) {
            cursor.endParse();
            return null;
        }
        cursor.resolveError();
        cursor.endParse();
        return null;
    }
    _meetsMin() {
        if (this._divider != null) {
            return Math.ceil(this._nodes.length / 2) >= this._min;
        }
        return this._nodes.length >= this._min;
    }
    _tryToParse(cursor) {
        const firstIndex = cursor.index;
        let passed = false;
        while (true) {
            const runningCursorIndex = cursor.index;
            const repeatedNode = this._pattern.parse(cursor);
            if (cursor.hasError) {
                const lastValidNode = this._getLastValidNode();
                if (lastValidNode != null) {
                    passed = true;
                }
                else {
                    cursor.moveTo(runningCursorIndex);
                    cursor.recordErrorAt(firstIndex, runningCursorIndex, this._pattern);
                    passed = false;
                }
                break;
            }
            else {
                if (repeatedNode != null) {
                    this._nodes.push(repeatedNode);
                    if (!cursor.hasNext()) {
                        passed = true;
                        break;
                    }
                    cursor.next();
                }
                if (this._divider != null) {
                    const dividerNode = this._divider.parse(cursor);
                    if (cursor.hasError) {
                        passed = true;
                        break;
                    }
                    else if (dividerNode != null) {
                        this._nodes.push(dividerNode);
                        if (!cursor.hasNext()) {
                            passed = true;
                            break;
                        }
                        cursor.next();
                    }
                }
            }
        }
        const hasMinimum = this._meetsMin();
        if (hasMinimum) {
            return passed;
        }
        else if (!hasMinimum && passed) {
            cursor.recordErrorAt(firstIndex, cursor.index, this);
            cursor.moveTo(this._firstIndex);
            return false;
        }
        return passed;
    }
    _createNode(cursor) {
        const hasDivider = this._divider != null;
        if (hasDivider &&
            this._trimDivider &&
            cursor.leafMatch.pattern === this._divider) {
            const dividerNode = this._nodes.pop();
            cursor.moveTo(dividerNode.firstIndex);
        }
        // if (this._nodes.length === 0) {
        //   cursor.moveTo(this._firstIndex);
        //   return null;
        // }
        const lastIndex = this._nodes[this._nodes.length - 1].lastIndex;
        cursor.moveTo(lastIndex);
        return new Node(this._type, this._name, this._firstIndex, lastIndex, this._nodes);
    }
    _getLastValidNode() {
        const nodes = this._nodes.filter((node) => node !== null);
        if (nodes.length === 0) {
            return null;
        }
        return nodes[nodes.length - 1];
    }
    getTokens() {
        return this._pattern.getTokens();
    }
    getTokensAfter(childReference) {
        const patterns = this.getPatternsAfter(childReference);
        const tokens = [];
        patterns.forEach(p => tokens.push(...p.getTokens()));
        return tokens;
    }
    getNextTokens() {
        if (this._parent == null) {
            return [];
        }
        return this._parent.getTokensAfter(this);
    }
    getPatterns() {
        return this._pattern.getPatterns();
    }
    getPatternsAfter(childReference) {
        let index = -1;
        const patterns = [];
        for (let i = 0; i < this._children.length; i++) {
            if (this._children[i] === childReference) {
                index = i;
            }
        }
        // If the last match isn't a child of this pattern.
        if (index === -1) {
            return [];
        }
        // If the last match was the repeated patterns, then suggest the divider.
        if (index === 0 && this._divider) {
            patterns.push(this._children[1]);
            if (this._parent) {
                patterns.push(...this._parent.getPatternsAfter(this));
            }
        }
        // Suggest the pattern because the divider was the last match.
        if (index === 1) {
            patterns.push(this._children[0]);
        }
        // If there is no divider then suggest the repeating pattern and the next pattern after.
        if (index === 0 && !this._divider && this._parent) {
            patterns.push(this._children[0]);
            patterns.push(...this._parent.getPatternsAfter(this));
        }
        return patterns;
    }
    getNextPatterns() {
        if (this._parent == null) {
            return [];
        }
        return this._parent.getPatternsAfter(this);
    }
    find(predicate) {
        return findPattern(this, predicate);
    }
    clone(name = this._name, isOptional) {
        let min = this._min;
        if (isOptional != null) {
            if (isOptional) {
                min = 0;
            }
            else {
                min = Math.max(this._min, 1);
            }
        }
        const clone = new InfiniteRepeat(name, this._pattern, {
            divider: this._divider == null ? undefined : this._divider,
            min: min,
            trimDivider: this._trimDivider
        });
        clone._id = this._id;
        return clone;
    }
}

let idIndex$2 = 0;
class Repeat {
    get id() {
        return this._id;
    }
    get type() {
        return this._repeatPattern.type;
    }
    get name() {
        return this._repeatPattern.name;
    }
    get parent() {
        return this._parent;
    }
    set parent(value) {
        this._parent = value;
    }
    get children() {
        return this._children;
    }
    get isOptional() {
        return this._repeatPattern.isOptional;
    }
    constructor(name, pattern, options = {}) {
        this._id = `repeat-${idIndex$2++}`;
        this._pattern = pattern;
        this._parent = null;
        this._options = Object.assign(Object.assign({}, options), { min: options.min == null ? 1 : options.min, max: options.max == null ? Infinity : options.max });
        if (this._options.max !== Infinity) {
            this._repeatPattern = new FiniteRepeat(name, pattern, this._options.max, this._options);
        }
        else {
            this._repeatPattern = new InfiniteRepeat(name, pattern, this._options);
        }
        this._children = [this._repeatPattern];
        this._repeatPattern.parent = this;
    }
    parse(cursor) {
        return this._repeatPattern.parse(cursor);
    }
    exec(text) {
        return this._repeatPattern.exec(text);
    }
    test(text) {
        return this._repeatPattern.test(text);
    }
    clone(name = this.name, isOptional) {
        let min = this._options.min;
        if (isOptional != null) {
            if (isOptional) {
                min = 0;
            }
            else {
                min = Math.max(this._options.min, 1);
            }
        }
        const clone = new Repeat(name, this._pattern, Object.assign(Object.assign({}, this._options), { min }));
        clone._id = this._id;
        return clone;
    }
    getTokens() {
        return this._repeatPattern.getTokens();
    }
    getTokensAfter(_childReference) {
        if (this._parent == null) {
            return [];
        }
        return this._parent.getTokensAfter(this);
    }
    getNextTokens() {
        if (this._parent == null) {
            return [];
        }
        return this._parent.getTokensAfter(this);
    }
    getPatterns() {
        return this._repeatPattern.getPatterns();
    }
    getPatternsAfter(_childReference) {
        if (this._parent == null) {
            return [];
        }
        return this._parent.getPatternsAfter(this);
    }
    getNextPatterns() {
        if (this._parent == null) {
            return [];
        }
        return this._parent.getPatternsAfter(this);
    }
    find(predicate) {
        return this._repeatPattern.find(predicate);
    }
}

const comment = new Regex("comment", "#[^\r\n]+");

function filterOutNull(nodes) {
    const filteredNodes = [];
    for (const node of nodes) {
        if (node !== null) {
            filteredNodes.push(node);
        }
    }
    return filteredNodes;
}

let idIndex$1 = 0;
class And {
    get id() {
        return this._id;
    }
    get type() {
        return this._type;
    }
    get name() {
        return this._name;
    }
    get parent() {
        return this._parent;
    }
    set parent(pattern) {
        this._parent = pattern;
    }
    get children() {
        return this._children;
    }
    get isOptional() {
        return this._isOptional;
    }
    constructor(name, sequence, isOptional = false) {
        if (sequence.length === 0) {
            throw new Error("Need at least one pattern with an 'and' pattern.");
        }
        const children = clonePatterns(sequence);
        this._assignChildrenToParent(children);
        this._id = `and-${idIndex$1++}`;
        this._type = "and";
        this._name = name;
        this._isOptional = isOptional;
        this._parent = null;
        this._children = children;
        this._firstIndex = -1;
        this._nodes = [];
    }
    _assignChildrenToParent(children) {
        for (const child of children) {
            child.parent = this;
        }
    }
    test(text) {
        const cursor = new Cursor(text);
        const ast = this.parse(cursor);
        return (ast === null || ast === void 0 ? void 0 : ast.value) === text;
    }
    exec(text, record = false) {
        const cursor = new Cursor(text);
        record && cursor.startRecording();
        const ast = this.parse(cursor);
        return {
            ast: (ast === null || ast === void 0 ? void 0 : ast.value) === text ? ast : null,
            cursor
        };
    }
    parse(cursor) {
        cursor.startParseWith(this);
        this._firstIndex = cursor.index;
        this._nodes = [];
        const passed = this.tryToParse(cursor);
        if (passed) {
            const node = this.createNode(cursor);
            if (node !== null) {
                cursor.recordMatch(this, node);
            }
            cursor.endParse();
            return node;
        }
        if (this._isOptional) {
            cursor.resolveError();
        }
        cursor.endParse();
        return null;
    }
    tryToParse(cursor) {
        let passed = false;
        for (let i = 0; i < this._children.length; i++) {
            const runningCursorIndex = cursor.index;
            const nextPatternIndex = i + 1;
            const hasMorePatterns = nextPatternIndex < this._children.length;
            const node = this._children[i].parse(cursor);
            const hasNoError = !cursor.hasError;
            const hadMatch = node !== null;
            if (hasNoError) {
                this._nodes.push(node);
                if (hasMorePatterns) {
                    if (hadMatch) {
                        if (cursor.hasNext()) {
                            // We had a match. Increment the cursor and use the next pattern.
                            cursor.next();
                            continue;
                        }
                        else {
                            // We are at the end of the text, it may still be valid, if all the
                            // following patterns are optional.
                            if (this.areRemainingPatternsOptional(i)) {
                                passed = true;
                                break;
                            }
                            // We didn't finish the parsing sequence.
                            cursor.recordErrorAt(this._firstIndex, cursor.index + 1, this);
                            break;
                        }
                    }
                    else {
                        // An optional pattern did not matched, try from the same spot on the next
                        // pattern.
                        cursor.moveTo(runningCursorIndex);
                        continue;
                    }
                }
                else {
                    // If we don't have any results from what we parsed then record error.
                    const lastNode = this.getLastValidNode();
                    if (lastNode === null) {
                        cursor.recordErrorAt(this._firstIndex, cursor.index, this);
                        break;
                    }
                    // The sequence was parsed fully.
                    passed = true;
                    break;
                }
            }
            else {
                // The pattern failed.
                cursor.moveTo(this._firstIndex);
                break;
            }
        }
        return passed;
    }
    getLastValidNode() {
        const nodes = filterOutNull(this._nodes);
        if (nodes.length === 0) {
            return null;
        }
        return nodes[nodes.length - 1];
    }
    areRemainingPatternsOptional(fromIndex) {
        const startOnIndex = fromIndex + 1;
        const length = this._children.length;
        for (let i = startOnIndex; i < length; i++) {
            const pattern = this._children[i];
            if (!pattern.isOptional) {
                return false;
            }
        }
        return true;
    }
    createNode(cursor) {
        const children = filterOutNull(this._nodes);
        const lastIndex = children[children.length - 1].lastIndex;
        cursor.moveTo(lastIndex);
        return new Node("and", this._name, this._firstIndex, lastIndex, children);
    }
    getTokens() {
        const tokens = [];
        for (const child of this._children) {
            tokens.push(...child.getTokens());
            if (!child.isOptional) {
                break;
            }
        }
        return tokens;
    }
    getTokensAfter(childReference) {
        const patterns = this.getPatternsAfter(childReference);
        const tokens = [];
        patterns.forEach(p => tokens.push(...p.getTokens()));
        return tokens;
    }
    getNextTokens() {
        if (this.parent == null) {
            return [];
        }
        return this.parent.getTokensAfter(this);
    }
    getPatterns() {
        const patterns = [];
        for (const pattern of this._children) {
            patterns.push(...pattern.getPatterns());
            if (!pattern.isOptional) {
                break;
            }
        }
        return patterns;
    }
    getPatternsAfter(childReference) {
        const patterns = [];
        let nextSiblingIndex = -1;
        let index = -1;
        for (let i = 0; i < this._children.length; i++) {
            if (this._children[i] === childReference) {
                nextSiblingIndex = i + 1;
                index = i;
                break;
            }
        }
        // The child reference isn't one of the child patterns.
        if (index === -1) {
            return [];
        }
        // The reference pattern is the last child. So ask the parent for the next pattern.
        if (nextSiblingIndex === this._children.length && this._parent !== null) {
            return this._parent.getPatternsAfter(this);
        }
        // Send back as many optional patterns as possible.
        for (let i = nextSiblingIndex; i < this._children.length; i++) {
            const child = this._children[i];
            patterns.push(child);
            if (!child.isOptional) {
                break;
            }
            // If we are on the last child and its options then ask for the next pattern from the parent.
            if (i === this._children.length - 1 && this._parent !== null) {
                patterns.push(...this._parent.getPatternsAfter(this));
            }
        }
        return patterns;
    }
    getNextPatterns() {
        if (this.parent == null) {
            return [];
        }
        return this.parent.getPatternsAfter(this);
    }
    find(predicate) {
        return findPattern(this, predicate);
    }
    clone(name = this._name, isOptional = this._isOptional) {
        const clone = new And(name, this._children, isOptional);
        clone._id = this._id;
        return clone;
    }
}

const literal = new Regex("literal", '"(?:\\\\.|[^"\\\\])*"');

const tabs$1 = new Regex("tabs", "\\t+");
const spaces$1 = new Regex("spaces", "[ ]+");
const newLine$1 = new Regex("new-line", "(\\r?\\n)+");
spaces$1.setTokens([" "]);
tabs$1.setTokens(["\t"]);
newLine$1.setTokens(["\n"]);
const lineSpaces$1 = new Repeat("line-spaces", new Or("line-space", [tabs$1, spaces$1]));
const allSpaces = new Regex("all-spaces", "\\s+", true);

const name$1 = new Regex("name", "[a-zA-Z_-]+[a-zA-Z0-9_-]*");

const regexLiteral = new Regex("regex-literal", "/(\\\\/|[^/\\n\\r])*/");

const patternName$3 = name$1.clone("pattern-name");
const anonymousLiterals = new Or("anonymous-literals", [
    literal,
    regexLiteral,
    patternName$3,
    new Reference("repeat-literal"),
]);
const anonymousWrappedLiterals = new Or("anonymous-wrapped-literals", [
    new Reference("or-literal"),
    new Reference("and-literal"),
    new Reference("complex-anonymous-pattern")
]);

const inlinePatternOpenParen = new Literal("anonymous-pattern-open-paren", "(");
const inlinePatternCloseParen = new Literal("anonymous-pattern-close-paren", ")");
const optionalLineSpaces$1 = lineSpaces$1.clone(undefined, true);
const complexAnonymousPattern = new And("complex-anonymous-pattern", [
    inlinePatternOpenParen,
    optionalLineSpaces$1,
    anonymousWrappedLiterals,
    optionalLineSpaces$1,
    inlinePatternCloseParen,
]);
const anonymousPattern = new Or("anonymous-pattern", [
    anonymousLiterals,
    complexAnonymousPattern
]);

const optionalSpaces$2 = spaces$1.clone("optional-spaces", true);
const openBracket$1 = new Literal("open-bracket", "{");
const closeBracket$1 = new Literal("close-bracket", "}");
const comma = new Literal("comma", ",");
const integer = new Regex("integer", "([1-9][0-9]*)|0");
integer.setTokens(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
const optionalInteger = integer.clone("integer", true);
const trimFlag = new Literal("trim-flag", "t", true);
const optionalFlag = new And("optional-trim-flag", [
    optionalSpaces$2,
    comma,
    optionalSpaces$2,
    trimFlag,
], true);
const bounds = new And("bounds", [
    openBracket$1,
    optionalSpaces$2,
    optionalInteger.clone("min"),
    optionalSpaces$2,
    comma,
    optionalSpaces$2,
    optionalInteger.clone("max"),
    optionalFlag,
    optionalSpaces$2,
    closeBracket$1
]);
const justFlag = new And("bounds", [
    openBracket$1,
    trimFlag,
    closeBracket$1
]);
const exactCount = new And("exact-count", [
    openBracket$1,
    optionalSpaces$2,
    integer,
    optionalSpaces$2,
    closeBracket$1,
]);
const quantifierShorthand = new Regex("quantifier-shorthand", "\\*|\\+");
quantifierShorthand.setTokens(["*", "+"]);
const quantifier = new Or("quantifier", [
    quantifierShorthand,
    justFlag,
    exactCount,
    bounds
]);
const openParen = new Literal("repeat-open-paren", "(");
const closeParen = new Literal("repeat-close-paren", ")");
const dividerComma = new Regex("divider-comma", "\\s*,\\s*");
dividerComma.setTokens([", "]);
const patternName$2 = name$1.clone("pattern-name");
const patterns$3 = new Or("or-patterns", [patternName$2, anonymousPattern]);
const dividerPattern = patterns$3.clone("divider-pattern");
const repeatLiteral = new And("repeat-literal", [
    openParen,
    optionalSpaces$2,
    patterns$3,
    new And("optional-divider-section", [dividerComma, dividerPattern], true),
    optionalSpaces$2,
    closeParen,
    new And("quantifier-section", [quantifier]),
]);

const optionalNot = new Literal("not", "!", true);
const optionalIsOptional$1 = new Literal("is-optional", "?", true);
const patternName$1 = name$1.clone("pattern-name");
const patterns$2 = new Or("and-patterns", [patternName$1, anonymousPattern]);
const pattern$1 = new And("and-child-pattern", [
    optionalNot,
    patterns$2,
    optionalIsOptional$1,
]);
const divider$1 = new Regex("and-divider", "\\s*[+]\\s*");
divider$1.setTokens([" + "]);
const andLiteral = new Repeat("and-literal", pattern$1, { divider: divider$1, min: 2, trimDivider: true });

const patternName = name$1.clone("pattern-name");
const patterns$1 = new Or("or-patterns", [patternName, anonymousPattern]);
const divider = new Regex("or-divider", "\\s*[|]\\s*");
divider.setTokens([" | "]);
const orLiteral = new Repeat("or-literal", patterns$1, { divider, min: 2, trimDivider: true });

const aliasLiteral = name$1.clone("alias-literal");
const optionalIsOptional = new Literal("is-optional", "?", true);
const configurableAnonymousPattern = new And("configurable-anonymous-pattern", [anonymousPattern, optionalIsOptional]);
const pattern = new Or("pattern", [
    literal,
    regexLiteral,
    repeatLiteral,
    aliasLiteral,
    orLiteral,
    andLiteral,
    configurableAnonymousPattern,
], false, true);

const optionalSpaces$1 = spaces$1.clone("optional-spaces", true);
const assignOperator = new Literal("assign-operator", "=");
const assignStatement = new And("assign-statement", [
    optionalSpaces$1,
    name$1,
    optionalSpaces$1,
    assignOperator,
    optionalSpaces$1,
    pattern
]);
const statement = new Or("statement", [assignStatement, name$1.clone("export-name")]);

const bodyLineContent = new Or("body-line-content", [
    comment,
    statement
]);
const bodyLine = new And("body-line", [
    lineSpaces$1.clone("line-spaces", true),
    bodyLineContent,
    lineSpaces$1.clone("line-spaces", true),
]);
const body = new Repeat("body", bodyLine, { divider: newLine$1, min: 0 });

const optionalSpaces = allSpaces.clone("optional-spaces", true);
const optionalLineSpaces = lineSpaces$1.clone("options-line-spaces", true);
const importNameDivider = new Regex("import-name-divider", "(\\s+)?,(\\s+)?");
const importKeyword = new Literal("import", "import");
const useParamsKeyword = new Literal("use-params", "use params");
const asKeyword = new Literal("as", "as");
const fromKeyword = new Literal("from", "from");
const openBracket = new Literal("open-bracket", "{");
const closeBracket = new Literal("close-bracket", "}");
const name = new Regex("import-name", "[^}\\s,]+");
const importNameAlias = name.clone("import-name-alias");
const importAlias = new And("import-alias", [name, lineSpaces$1, asKeyword, lineSpaces$1, importNameAlias]);
const importedNames = new Repeat("imported-names", new Or("import-names", [importAlias, name]), { divider: importNameDivider });
const paramName = name.clone("param-name");
const paramNames = new Repeat("param-names", paramName, { divider: importNameDivider });
const resource = literal.clone("resource");
const useParams = new And("import-params", [
    useParamsKeyword,
    optionalLineSpaces,
    openBracket,
    optionalSpaces,
    paramNames,
    optionalSpaces,
    closeBracket
]);
const withParamsKeyword = new Literal("with-params", "with params");
const withParamsStatement = new And("with-params-statement", [
    withParamsKeyword,
    optionalLineSpaces,
    openBracket,
    optionalSpaces,
    body.clone("with-params-body"),
    optionalSpaces,
    closeBracket
], true);
const importFromStatement = new And("import-from", [
    importKeyword,
    optionalLineSpaces,
    openBracket,
    optionalSpaces,
    importedNames,
    optionalSpaces,
    closeBracket,
    optionalLineSpaces,
    fromKeyword,
    optionalLineSpaces,
    resource,
    optionalLineSpaces,
    withParamsStatement
]);
const importStatement = new Or("import-statement", [
    useParams,
    importFromStatement
]);

const tabs = new Regex("tabs", "\\t+");
const spaces = new Regex("spaces", "[ ]+");
const newLine = new Regex("new-line", "(\\r?\\n)+");
spaces.setTokens([" "]);
tabs.setTokens(["\t"]);
newLine.setTokens(["\n"]);
const lineSpaces = new Repeat("line-spaces", new Or("line-space", [tabs, spaces]));
const headLineContent = new Or("head-line-content", [
    comment,
    importStatement
]);
const headLine = new And("head-line-content", [
    lineSpaces.clone("line-spaces", true),
    headLineContent,
    lineSpaces.clone("line-spaces", true),
]);
const head = new Repeat("head", headLine, { divider: newLine, min: 0 });
const grammar = new And("grammar", [
    allSpaces,
    head,
    allSpaces,
    body,
    allSpaces
]);

let idIndex = 0;
class Not {
    get id() {
        return this._id;
    }
    get type() {
        return this._type;
    }
    get name() {
        return this._name;
    }
    get parent() {
        return this._parent;
    }
    set parent(pattern) {
        this._parent = pattern;
    }
    get children() {
        return this._children;
    }
    get isOptional() {
        return false;
    }
    constructor(name, pattern) {
        this._id = `not-${idIndex++}`;
        this._type = "not";
        this._name = name;
        this._parent = null;
        this._children = [pattern.clone(pattern.name, false)];
        this._children[0].parent = this;
    }
    test(text) {
        const cursor = new Cursor(text);
        this.parse(cursor);
        return !cursor.hasError;
    }
    exec(text, record = false) {
        const cursor = new Cursor(text);
        record && cursor.startRecording();
        const ast = this.parse(cursor);
        return {
            ast: (ast === null || ast === void 0 ? void 0 : ast.value) === text ? ast : null,
            cursor
        };
    }
    parse(cursor) {
        cursor.startParseWith(this);
        const firstIndex = cursor.index;
        this._children[0].parse(cursor);
        if (cursor.hasError) {
            cursor.resolveError();
            cursor.moveTo(firstIndex);
        }
        else {
            cursor.moveTo(firstIndex);
            cursor.resolveError();
            cursor.recordErrorAt(firstIndex, firstIndex, this);
        }
        cursor.endParse();
        return null;
    }
    clone(name = this._name) {
        const not = new Not(name, this._children[0]);
        not._id = this._id;
        return not;
    }
    getTokens() {
        const parent = this._parent;
        if (parent != null) {
            return parent.getTokensAfter(this);
        }
        return [];
    }
    getTokensAfter(_childReference) {
        const parent = this._parent;
        if (parent != null) {
            return parent.getTokensAfter(this);
        }
        return [];
    }
    getNextTokens() {
        if (this.parent == null) {
            return [];
        }
        return this.parent.getTokensAfter(this);
    }
    getPatterns() {
        return [...this.getNextPatterns().map(p => p.getPatterns()).flat()];
    }
    getPatternsAfter(_childReference) {
        const parent = this._parent;
        if (parent != null) {
            return parent.getPatternsAfter(this);
        }
        return [];
    }
    getNextPatterns() {
        if (this.parent == null) {
            return [];
        }
        return this.parent.getPatternsAfter(this);
    }
    find(predicate) {
        return predicate(this._children[0]) ? this._children[0] : null;
    }
}

const defaultOptions = { greedyPatternNames: [], customTokens: {} };
class AutoComplete {
    constructor(pattern, options = defaultOptions) {
        this._pattern = pattern;
        this._options = options;
        this._text = "";
    }
    suggestForWithCursor(cursor) {
        cursor.moveTo(0);
        this._cursor = cursor;
        this._text = cursor.text;
        this._cursor.startRecording();
        if (cursor.length === 0) {
            return {
                isComplete: false,
                options: this._createSuggestionsFromRoot(),
                error: new ParseError(0, 0, this._pattern),
                errorAtIndex: 0,
                cursor,
                ast: null
            };
        }
        let errorAtIndex = null;
        let error = null;
        const ast = this._pattern.parse(this._cursor);
        const isComplete = (ast === null || ast === void 0 ? void 0 : ast.value) === this._text;
        const options = this._getAllOptions();
        if (!isComplete && options.length > 0 && !this._cursor.hasError) {
            const startIndex = options.reduce((lowestIndex, o) => {
                return Math.min(lowestIndex, o.startIndex);
            }, Infinity);
            const endIndex = cursor.getLastIndex() + 1;
            error = new ParseError(startIndex, endIndex, this._pattern);
            errorAtIndex = startIndex;
        }
        else if (!isComplete && options.length === 0 && ast != null) {
            const startIndex = ast.endIndex;
            const endIndex = cursor.getLastIndex() + 1;
            error = new ParseError(startIndex, endIndex, this._pattern);
            errorAtIndex = startIndex;
        }
        else if (!isComplete && this._cursor.hasError && this._cursor.furthestError != null) {
            errorAtIndex = this._cursor.furthestError.endIndex;
            error = this._cursor.furthestError;
            errorAtIndex = options.reduce((errorAtIndex, option) => Math.max(errorAtIndex, option.startIndex), errorAtIndex);
        }
        return {
            isComplete: isComplete,
            options: options,
            error,
            errorAtIndex,
            cursor: cursor,
            ast,
        };
    }
    suggestFor(text) {
        return this.suggestForWithCursor(new Cursor(text));
    }
    _getAllOptions() {
        const errorMatches = this._getOptionsFromErrors();
        const leafMatches = this._cursor.leafMatches.map((m) => this._createSuggestionsFromMatch(m)).flat();
        const finalResults = [];
        [...leafMatches, ...errorMatches].forEach(m => {
            const index = finalResults.findIndex(f => m.text === f.text);
            if (index === -1) {
                finalResults.push(m);
            }
        });
        return finalResults;
    }
    _getOptionsFromErrors() {
        // These errored because the length of the string.
        const errors = this._cursor.errors.filter(e => e.endIndex === this._cursor.length);
        const suggestions = errors.map(e => {
            const tokens = this._getTokensForPattern(e.pattern);
            const adjustedTokens = tokens.map(t => t.slice(e.endIndex - e.startIndex));
            return this._createSuggestions(e.endIndex, adjustedTokens);
        });
        return suggestions.flat();
    }
    _createSuggestionsFromRoot() {
        const suggestions = [];
        const tokens = this._pattern.getTokens();
        for (const token of tokens) {
            if (suggestions.findIndex(s => s.text === token) === -1) {
                suggestions.push(this._createSuggestion("", token));
            }
        }
        return suggestions;
    }
    _createSuggestionsFromMatch(match) {
        if (match.pattern == null) {
            return this._createSuggestions(-1, this._getTokensForPattern(this._pattern));
        }
        const leafPattern = match.pattern;
        const parent = match.pattern.parent;
        if (parent !== null && match.node != null) {
            const patterns = leafPattern.getNextPatterns();
            const tokens = patterns.reduce((acc, pattern) => {
                acc.push(...this._getTokensForPattern(pattern));
                return acc;
            }, []);
            return this._createSuggestions(match.node.lastIndex, tokens);
        }
        else {
            return [];
        }
    }
    _getTokensForPattern(pattern) {
        const augmentedTokens = this._getAugmentedTokens(pattern);
        if (this._options.greedyPatternNames != null && this._options.greedyPatternNames.includes(pattern.name)) {
            const nextPatterns = pattern.getNextPatterns();
            const tokens = [];
            const nextPatternTokens = nextPatterns.reduce((acc, pattern) => {
                acc.push(...this._getTokensForPattern(pattern));
                return acc;
            }, []);
            for (let token of augmentedTokens) {
                for (let nextPatternToken of nextPatternTokens) {
                    tokens.push(token + nextPatternToken);
                }
            }
            return tokens;
        }
        else {
            return augmentedTokens;
        }
    }
    _getAugmentedTokens(pattern) {
        const customTokensMap = this._options.customTokens || {};
        const leafPatterns = pattern.getPatterns();
        const tokens = customTokensMap[pattern.name] || [];
        leafPatterns.forEach(p => {
            const augmentedTokens = customTokensMap[p.name] || [];
            tokens.push(...p.getTokens(), ...augmentedTokens);
        });
        return tokens;
    }
    _createSuggestions(lastIndex, tokens) {
        let substring = lastIndex === -1 ? "" : this._cursor.getChars(0, lastIndex);
        const suggestionStrings = [];
        const options = [];
        for (const token of tokens) {
            const suggestion = substring + token;
            const startsWith = suggestion.startsWith(substring);
            const alreadyExist = suggestionStrings.includes(suggestion);
            const isSameAsText = suggestion === this._text;
            if (startsWith && !alreadyExist && !isSameAsText) {
                suggestionStrings.push(suggestion);
                options.push(this._createSuggestion(this._cursor.text, suggestion));
            }
        }
        const reducedOptions = getFurthestOptions(options);
        reducedOptions.sort((a, b) => a.text.localeCompare(b.text));
        return reducedOptions;
    }
    _createSuggestion(fullText, suggestion) {
        const furthestMatch = findMatchIndex(suggestion, fullText);
        const text = suggestion.slice(furthestMatch);
        return {
            text: text,
            startIndex: furthestMatch,
        };
    }
    static suggestFor(text, pattern, options) {
        return new AutoComplete(pattern, options).suggestFor(text);
    }
    static suggestForWithCursor(cursor, pattern, options) {
        return new AutoComplete(pattern, options).suggestForWithCursor(cursor);
    }
}
function findMatchIndex(str1, str2) {
    let matchCount = 0;
    let minLength = str1.length;
    if (str2.length < minLength) {
        minLength = str2.length;
    }
    for (let i = 0; i < minLength; i++) {
        if (str1[i] === str2[i]) {
            matchCount++;
        }
        else {
            break;
        }
    }
    return matchCount;
}
function getFurthestOptions(options) {
    let furthestOptions = [];
    let furthestIndex = -1;
    for (const option of options) {
        if (option.startIndex > furthestIndex) {
            furthestIndex = option.startIndex;
            furthestOptions = [];
        }
        if (option.startIndex === furthestIndex) {
            furthestOptions.push(option);
        }
    }
    return furthestOptions;
}

let anonymousIndexId = 0;
const patternNodes = {
    "literal": true,
    "regex-literal": true,
    "or-literal": true,
    "and-literal": true,
    "repeat-literal": true,
    "alias-literal": true,
    "configurable-anonymous-pattern": true
};
class ParseContext {
    constructor(params) {
        this.patternsByName = new Map();
        this.importedPatternsByName = new Map();
        this.paramsByName = new Map();
        params.forEach(p => this.paramsByName.set(p.name, p));
    }
}
function defaultImportResolver(_path, _basePath) {
    throw new Error("No import resolver supplied.");
}
class Grammar {
    constructor(options = {}) {
        this._params = (options === null || options === void 0 ? void 0 : options.params) == null ? [] : options.params;
        this._originResource = (options === null || options === void 0 ? void 0 : options.originResource) == null ? null : options.originResource;
        this._resolveImport = options.resolveImport == null ? defaultImportResolver : options.resolveImport;
        this._parseContext = new ParseContext(this._params);
        this._autoComplete = new AutoComplete(grammar, {
            greedyPatternNames: ["spaces", "optional-spaces", "whitespace", "new-line"],
            customTokens: {
                "regex-literal": ["[Regular Expression]"],
                "literal": ["[String]"],
                "name": ["[Pattern Name]"],
                "pattern-name": ["[Pattern Name]"]
            }
        });
    }
    import(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const grammarFile = yield this._resolveImport(path, null);
            const grammar = new Grammar({
                resolveImport: this._resolveImport,
                originResource: grammarFile.resource,
                params: this._params
            });
            return grammar.parse(grammarFile.expression);
        });
    }
    parse(expression) {
        return __awaiter(this, void 0, void 0, function* () {
            this._parseContext = new ParseContext(this._params);
            const ast = this._tryToParse(expression);
            yield this._resolveImports(ast);
            this._buildPatterns(ast);
            return Object.fromEntries(this._parseContext.patternsByName);
        });
    }
    parseString(expression) {
        this._parseContext = new ParseContext(this._params);
        const ast = this._tryToParse(expression);
        if (this._hasImports(ast)) {
            throw new Error("Cannot use imports on parseString, use parse instead.");
        }
        this._buildPatterns(ast);
        return Object.fromEntries(this._parseContext.patternsByName);
    }
    _tryToParse(expression) {
        const { ast, cursor, options, isComplete } = this._autoComplete.suggestFor(expression);
        if (!isComplete) {
            const text = (cursor === null || cursor === void 0 ? void 0 : cursor.text) || "";
            const index = options.reduce((num, o) => Math.max(o.startIndex, num), 0);
            const foundText = text.slice(Math.max(index - 10, 0), index + 10);
            const expectedTexts = "'" + options.map(o => {
                const startText = text.slice(Math.max(o.startIndex - 10), o.startIndex);
                return startText + o.text;
            }).join("' or '") + "'";
            const message = `[Parse Error] Found: '${foundText}', expected: ${expectedTexts}.`;
            throw new Error(message);
        }
        // If it is complete it will always have a node. So we have to cast it.
        return ast;
    }
    _hasImports(ast) {
        const importBlock = ast.find(n => n.name === "import-block");
        if (importBlock == null) {
            return false;
        }
        return importBlock && importBlock.children.length > 0;
    }
    _buildPatterns(ast) {
        const body = ast.find(n => n.name === "body");
        if (body == null) {
            return;
        }
        body.findAll(n => n.name === "assign-statement").forEach((n) => {
            const patternNode = n.children.find(n => patternNodes[n.name] != null);
            if (patternNode == null) {
                return;
            }
            switch (patternNode.name) {
                case "literal": {
                    this._saveLiteral(n);
                    break;
                }
                case "regex-literal": {
                    this._saveRegex(n);
                    break;
                }
                case "or-literal": {
                    this._saveOr(n);
                    break;
                }
                case "and-literal": {
                    this._saveAnd(n);
                    break;
                }
                case "repeat-literal": {
                    this._saveRepeat(n);
                    break;
                }
                case "alias-literal": {
                    this._saveAlias(n);
                    break;
                }
                case "configurable-anonymous-pattern": {
                    this._saveConfigurableAnonymous(n);
                    break;
                }
            }
        });
        body.findAll(n => n.name === "export-name").forEach((n) => {
            const pattern = this._getPattern(n.value).clone();
            this._parseContext.patternsByName.set(n.value, pattern);
        });
    }
    _saveLiteral(statementNode) {
        const nameNode = statementNode.find(n => n.name === "name");
        const literalNode = statementNode.find(n => n.name === "literal");
        const name = nameNode.value;
        const literal = this._buildLiteral(name, literalNode);
        this._parseContext.patternsByName.set(name, literal);
    }
    _buildLiteral(name, node) {
        return new Literal(name, this._resolveStringValue(node.value));
    }
    _resolveStringValue(value) {
        return value.replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\b/g, '\b')
            .replace(/\\f/g, '\f')
            .replace(/\\v/g, '\v')
            .replace(/\\0/g, '\0')
            .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/\\u([0-9A-Fa-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/\\(.)/g, '$1').slice(1, -1);
    }
    _saveRegex(statementNode) {
        const nameNode = statementNode.find(n => n.name === "name");
        const regexNode = statementNode.find(n => n.name === "regex-literal");
        const name = nameNode.value;
        const regex = this._buildRegex(name, regexNode);
        this._parseContext.patternsByName.set(name, regex);
    }
    _buildRegex(name, node) {
        const value = node.value.slice(1, node.value.length - 1);
        return new Regex(name, value);
    }
    _saveOr(statementNode) {
        const nameNode = statementNode.find(n => n.name === "name");
        const name = nameNode.value;
        const orNode = statementNode.find(n => n.name === "or-literal");
        const or = this._buildOr(name, orNode);
        this._parseContext.patternsByName.set(name, or);
    }
    _buildOr(name, node) {
        const patternNodes = node.children.filter(n => n.name === "pattern-name");
        const patterns = patternNodes.map(n => this._buildPattern(n));
        const or = new Or(name, patterns, false, true);
        return or;
    }
    _buildPattern(node) {
        const type = node.name;
        const name = `anonymous-pattern-${anonymousIndexId++}`;
        switch (type) {
            case "pattern-name": {
                return this._getPattern(node.value).clone();
            }
            case "literal": {
                return this._buildLiteral(node.value.slice(1, -1), node);
            }
            case "regex-literal": {
                return this._buildRegex(node.value.slice(1, -1), node);
            }
            case "repeat-literal": {
                return this._buildRegex(name, node);
            }
            case "or-literal": {
                return this._buildOr(name, node);
            }
            case "and-literal": {
                return this._buildAnd(name, node);
            }
            case "complex-anonymous-pattern": {
                return this._buildComplexAnonymousPattern(node);
            }
        }
        throw new Error(`Couldn't build node: ${node.name}.`);
    }
    _saveAnd(statementNode) {
        const nameNode = statementNode.find(n => n.name === "name");
        const name = nameNode.value;
        const andNode = statementNode.find(n => n.name === "and-literal");
        const and = this._buildAnd(name, andNode);
        this._parseContext.patternsByName.set(name, and);
    }
    _buildAnd(name, node) {
        const patternNodes = node.children.filter(n => n.name !== "and-divider");
        const patterns = patternNodes.map(n => {
            const patternNode = n.children[0].name === "not" ? n.children[1] : n.children[0];
            const isNot = n.find(n => n.name === "not") != null;
            const isOptional = n.find(n => n.name === "is-optional") != null;
            const pattern = this._buildPattern(patternNode).clone(undefined, isOptional);
            if (isNot) {
                return new Not(`not-${pattern.name}`, pattern);
            }
            return pattern;
        });
        return new And(name, patterns);
    }
    _saveRepeat(statementNode) {
        const nameNode = statementNode.find(n => n.name === "name");
        const name = nameNode.value;
        const repeatNode = statementNode.find(n => n.name === "repeat-literal");
        const repeat = this._buildRepeat(name, repeatNode);
        this._parseContext.patternsByName.set(name, repeat);
    }
    _buildRepeat(name, repeatNode) {
        const bounds = repeatNode.find(n => n.name === "bounds");
        const exactCount = repeatNode.find(n => n.name === "exact-count");
        const quantifier = repeatNode.find(n => n.name === "quantifier-shorthand");
        const trimDivider = repeatNode.find(n => n.name === "trim-flag") != null;
        const patterNode = repeatNode.children[1].type === "optional-spaces" ? repeatNode.children[2] : repeatNode.children[1];
        const pattern = this._buildPattern(patterNode);
        const dividerSectionNode = repeatNode.find(n => n.name === "optional-divider-section");
        const options = {
            min: 1,
            max: Infinity
        };
        if (trimDivider) {
            options.trimDivider = trimDivider;
        }
        if (dividerSectionNode != null) {
            const dividerNode = dividerSectionNode.children[1];
            options.divider = this._buildPattern(dividerNode);
        }
        if (bounds != null) {
            const minNode = bounds.find(p => p.name === "min");
            const maxNode = bounds.find(p => p.name === "max");
            const min = minNode == null ? 0 : Number(minNode.value);
            const max = maxNode == null ? Infinity : Number(maxNode.value);
            options.min = min;
            options.max = max;
        }
        else if (exactCount != null) {
            const integerNode = exactCount.find(p => p.name === "integer");
            const integer = Number(integerNode.value);
            options.min = integer;
            options.max = integer;
        }
        else if (quantifier != null) {
            const type = quantifier.value;
            if (type === "+") {
                options.min = 1;
                options.max = Infinity;
            }
            else {
                options.min = 0;
                options.max = Infinity;
            }
        }
        return new Repeat(name, pattern.clone(pattern.name), options);
    }
    _saveConfigurableAnonymous(node) {
        const nameNode = node.find(n => n.name === "name");
        const name = nameNode.value;
        const anonymousNode = node.find(n => n.name === "complex-anonymous-pattern");
        const isOptional = node.children[1] != null;
        const anonymous = this._buildPattern(anonymousNode).clone(name, isOptional);
        this._parseContext.patternsByName.set(name, anonymous);
    }
    _buildComplexAnonymousPattern(node) {
        const wrappedNode = node.children[1].name === "line-spaces" ? node.children[2] : node.children[1];
        return this._buildPattern(wrappedNode);
    }
    _resolveImports(ast) {
        return __awaiter(this, void 0, void 0, function* () {
            const parseContext = this._parseContext;
            const importStatements = ast.findAll(n => n.name === "import-from");
            for (const importStatement of importStatements) {
                const resourceNode = importStatement.find(n => n.name === "resource");
                const params = this._getParams(importStatement);
                const resource = resourceNode.value.slice(1, -1);
                const grammarFile = yield this._resolveImport(resource, this._originResource || null);
                const grammar = new Grammar({
                    resolveImport: this._resolveImport,
                    originResource: grammarFile.resource,
                    params
                });
                try {
                    const patterns = yield grammar.parse(grammarFile.expression);
                    const importStatements = importStatement.findAll(n => n.name === "import-name" || n.name === "import-alias");
                    importStatements.forEach((node) => {
                        var _a, _b;
                        if (node.name === "import-name" && ((_a = node.parent) === null || _a === void 0 ? void 0 : _a.name) === "import-alias") {
                            return;
                        }
                        if (node.name === "import-name" && ((_b = node.parent) === null || _b === void 0 ? void 0 : _b.name) !== "import-alias") {
                            const importName = node.value;
                            if (parseContext.importedPatternsByName.has(importName)) {
                                throw new Error(`'${importName}' was already used within another import.`);
                            }
                            const pattern = patterns[importName];
                            if (pattern == null) {
                                throw new Error(`Couldn't find pattern with name: ${importName}, from import: ${resource}.`);
                            }
                            parseContext.importedPatternsByName.set(importName, pattern);
                        }
                        else {
                            const importNameNode = node.find(n => n.name === "import-name");
                            const importName = importNameNode.value;
                            const aliasNode = node.find(n => n.name === "import-name-alias");
                            const alias = aliasNode.value;
                            if (parseContext.importedPatternsByName.has(alias)) {
                                throw new Error(`'${alias}' was already used within another import.`);
                            }
                            const pattern = patterns[importName];
                            if (pattern == null) {
                                throw new Error(`Couldn't find pattern with name: ${importName}, from import: ${resource}.`);
                            }
                            parseContext.importedPatternsByName.set(alias, pattern.clone(alias));
                        }
                    });
                }
                catch (e) {
                    throw new Error(`Failed loading expression from: "${resource}". Error details: "${e.message}"`);
                }
            }
        });
    }
    _getParams(importStatement) {
        let params = [];
        const paramsStatement = importStatement.find(n => n.name === "with-params-statement");
        if (paramsStatement != null) {
            const statements = paramsStatement.find(n => n.name === "with-params-body");
            if (statements != null) {
                const expression = statements.toString();
                const importedValues = Array.from(this
                    ._parseContext
                    .importedPatternsByName
                    .values());
                const grammar = new Grammar({
                    params: importedValues,
                    originResource: this._originResource,
                    resolveImport: this._resolveImport
                });
                const patterns = grammar.parseString(expression);
                params = Array.from(Object.values(patterns));
            }
        }
        return params;
    }
    _getPattern(name) {
        let pattern = this._parseContext.patternsByName.get(name);
        if (pattern == null) {
            pattern = this._parseContext.importedPatternsByName.get(name);
        }
        if (pattern == null) {
            pattern = this._parseContext.paramsByName.get(name);
        }
        if (pattern == null) {
            return new Reference(name);
        }
        return pattern;
    }
    _saveAlias(statementNode) {
        const nameNode = statementNode.find(n => n.name === "name");
        const aliasNode = statementNode.find(n => n.name === "alias-literal");
        const aliasName = aliasNode.value;
        const name = nameNode.value;
        const alias = this._getPattern(aliasName).clone(name);
        this._parseContext.patternsByName.set(name, alias);
    }
    static parse(expression, options) {
        const grammar = new Grammar(options);
        return grammar.parse(expression);
    }
    static import(path, options) {
        const grammar = new Grammar(options);
        return grammar.import(path);
    }
    static parseString(expression, options) {
        const grammar = new Grammar(options);
        return grammar.parseString(expression);
    }
}

function arePatternsEqual(a, b) {
    if (a === b) {
        return true;
    }
    else if (a == null || b == null) {
        return false;
    }
    return a.type === b.type &&
        a.name === b.name &&
        a.isOptional === b.isOptional &&
        a.children.every((c, index) => arePatternsEqual(c, b.children[index]));
}

const kebabRegex = /-([a-z])/g; // Define the regex once
function kebabToCamelCase(str) {
    return str.replace(kebabRegex, (_, char) => char.toUpperCase());
}
function patterns(strings, ...values) {
    const combinedString = strings.reduce((result, str, i) => result + str + (values[i] || ''), '');
    const result = {};
    const patterns = Grammar.parseString(combinedString);
    Object.keys(patterns).forEach(k => {
        result[kebabToCamelCase(k)] = patterns[k];
    });
    return result;
}

export { And, AutoComplete, Cursor, CursorHistory, Grammar, Literal, Node, Not, Or, ParseError, Reference, Regex, Repeat, arePatternsEqual, grammar, patterns };
//# sourceMappingURL=index.esm.js.map
