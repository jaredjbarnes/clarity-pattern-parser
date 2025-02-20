'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function defaultVisitor(node) {
    return node;
}
class Node {
    get type() {
        return this._type;
    }
    get name() {
        return this._name;
    }
    get value() {
        return this.toString();
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
    get isLeaf() {
        return !this.hasChildren;
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
    findChildIndex(node) {
        return this._children.indexOf(node);
    }
    spliceChildren(index, deleteCount, ...items) {
        const removedItems = this._children.splice(index, deleteCount, ...items);
        removedItems.forEach(i => i._parent = null);
        items.forEach(i => i._parent = this);
        return removedItems;
    }
    removeAllChildren() {
        this.spliceChildren(0, this._children.length);
    }
    replaceChild(newNode, referenceNode) {
        const index = this.findChildIndex(referenceNode);
        if (index > -1) {
            this.spliceChildren(index, 1, newNode);
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
        const index = this.findChildIndex(referenceNode);
        if (index > -1) {
            this._children.splice(index, 0, newNode);
        }
    }
    appendChild(newNode) {
        this.append(newNode);
    }
    append(...nodes) {
        nodes.forEach((newNode) => {
            newNode._parent = this;
            this._children.push(newNode);
        });
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
    findRoot() {
        let pattern = this;
        while (true) {
            if (pattern.parent == null) {
                return pattern;
            }
            pattern = pattern.parent;
        }
    }
    findAncestor(predicate) {
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
    walkBreadthFirst(callback) {
        const queue = [this];
        while (queue.length > 0) {
            const current = queue.shift();
            callback(current);
            queue.push(...current.children);
        }
    }
    transform(visitors) {
        const childrenCopy = this._children.slice();
        const visitor = visitors[this.name] == null ? defaultVisitor : visitors[this.name];
        const children = childrenCopy.map(c => c.transform(visitors));
        this.removeAllChildren();
        this.append(...children);
        return visitor(this);
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
    compact() {
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
        let runningOffset = startIndex;
        if (this.children.length === 0) {
            length = this._value.length;
        }
        else {
            for (let x = 0; x < this.children.length; x++) {
                const child = this.children[x];
                const childLength = child.normalize(runningOffset);
                runningOffset += childLength;
                length += childLength;
            }
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
            startIndex: this.startIndex,
            endIndex: this.endIndex,
            children: this._children.map(c => c.toCycleFreeObject()),
        };
    }
    toJson(space) {
        return JSON.stringify(this.toCycleFreeObject(), null, space);
    }
    isEqual(node) {
        return node.toJson(0) === this.toJson(0);
    }
    static createValueNode(type, name, value = "") {
        return new Node(type, name, 0, 0, [], value);
    }
    static createNode(type, name, children = []) {
        const value = children.map(c => c.toString()).join("");
        return new Node(type, name, 0, 0, children, value);
    }
}

function compact(node, nodeMap) {
    node.walkBreadthFirst(n => {
        if (nodeMap[n.name]) {
            n.compact();
        }
    });
    return node;
}

function remove(node, nodeMap) {
    node.walkBreadthFirst(n => {
        if (nodeMap[n.name]) {
            n.remove();
        }
    });
    return node;
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
    constructor(startIndex, lastIndex, pattern) {
        this.firstIndex = startIndex;
        this.startIndex = startIndex;
        this.lastIndex = lastIndex;
        this.endIndex = lastIndex + 1;
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
        this._records = [];
        this._cache = {};
        this._isCacheEnabled = true;
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
    get records() {
        return this._records;
    }
    get nodes() {
        return this._nodes;
    }
    get patterns() {
        return this._patterns;
    }
    recordMatch(pattern, node, cache = false) {
        const record = {
            pattern,
            ast: node,
            error: null
        };
        if (cache && this._isCacheEnabled) {
            this._cache[this._buildKeyFromRecord(record)] = record;
        }
        if (this._isRecording) {
            this._patterns.push(pattern);
            this._nodes.push(node);
            this._records.push(record);
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
    getRecord(pattern, startIndex) {
        const record = this._cache[`${pattern.id}|${startIndex}`];
        if (record == null) {
            return null;
        }
        return record;
    }
    _buildKeyFromRecord(record) {
        let startIndex = 0;
        if (record.ast != null) {
            startIndex = record.ast.startIndex;
        }
        if (record.error != null) {
            startIndex = record.error.startIndex;
        }
        return `${record.pattern.id}|${startIndex}`;
    }
    recordErrorAt(startIndex, lastIndex, pattern, cache = false) {
        const error = new ParseError(startIndex, lastIndex, pattern);
        const record = {
            pattern,
            ast: null,
            error
        };
        if (cache) {
            this._cache[this._buildKeyFromRecord(record)] = record;
        }
        this._currentError = error;
        if (this._furthestError === null || lastIndex > this._furthestError.lastIndex) {
            this._furthestError = error;
        }
        if (this._isRecording) {
            this._errors.push(error);
            this.records.push(record);
        }
    }
    resolveError() {
        this._currentError = null;
    }
    startRecording() {
        this._isRecording = true;
    }
    stopRecording() {
        this._isRecording = false;
    }
    disableCache() {
        this._isCacheEnabled = false;
    }
    enableCache() {
        this._isCacheEnabled = true;
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
    get records() {
        return this._history.records;
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
        this._length = [...text].length;
        this._history = new CursorHistory();
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
    recordMatch(pattern, node, cache = false) {
        this._history.recordMatch(pattern, node, cache);
    }
    recordErrorAt(startIndex, lastIndex, onPattern, cache = false) {
        this._history.recordErrorAt(startIndex, lastIndex, onPattern, cache);
    }
    getRecord(pattern, startIndex) {
        return this._history.getRecord(pattern, startIndex);
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
    disableCache() {
        this._history.disableCache();
    }
    enableCache() {
        this._history.enableCache();
    }
}

function execPattern(pattern, text, record = false) {
    const cursor = new Cursor(text);
    if (cursor.length === 0) {
        return { ast: null, cursor };
    }
    record && cursor.startRecording();
    let ast = pattern.parse(cursor);
    const resultLength = ast == null ? 0 : ast.value.length;
    if (ast != null) {
        const isMatch = ast.value === text;
        if (!isMatch && !cursor.hasError) {
            ast = null;
            cursor.recordErrorAt(resultLength, cursor.length, pattern);
        }
    }
    else {
        cursor.recordErrorAt(resultLength, cursor.length, pattern);
    }
    return {
        ast: ast,
        cursor
    };
}

function testPattern(pattern, text, record = false) {
    const result = execPattern(pattern, text, record);
    return !result.cursor.hasError;
}

let idIndex$a = 0;
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
    get token() {
        return this._token;
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
    get startedOnIndex() {
        return this._firstIndex;
    }
    constructor(name, value) {
        if (value.length === 0) {
            throw new Error("Value Cannot be empty.");
        }
        this._id = `literal-${idIndex$a++}`;
        this._type = "literal";
        this._name = name;
        this._token = value;
        this._runes = Array.from(value);
        this._parent = null;
        this._firstIndex = 0;
        this._lastIndex = 0;
        this._endIndex = 0;
    }
    test(text, record = false) {
        return testPattern(this, text, record);
    }
    exec(text, record = false) {
        return execPattern(this, text, record);
    }
    parse(cursor) {
        // This is a major optimization when backtracking happens.
        // Most parsing will be cached.
        const record = cursor.getRecord(this, cursor.index);
        if (record != null) {
            if (record.ast != null) {
                const node = new Node(this._type, this._name, record.ast.firstIndex, record.ast.lastIndex, [], record.ast.value);
                cursor.recordMatch(this, node);
                cursor.moveTo(node.lastIndex);
                return node;
            }
            if (record.error) {
                cursor.recordErrorAt(record.error.startIndex, record.error.lastIndex, this);
                cursor.moveTo(record.error.lastIndex);
                return null;
            }
        }
        this._firstIndex = cursor.index;
        const passed = this._tryToParse(cursor);
        if (passed) {
            cursor.resolveError();
            const node = this._createNode();
            cursor.recordMatch(this, node, true);
            return node;
        }
        cursor.recordErrorAt(this._firstIndex, this._endIndex, this);
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
                this._lastIndex = this._firstIndex + this._token.length - 1;
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
        return new Node("literal", this._name, this._firstIndex, this._lastIndex, undefined, this._token);
    }
    clone(name = this._name) {
        const clone = new Literal(name, this._token);
        clone._id = this._id;
        return clone;
    }
    getTokens() {
        return [this._token];
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
    isEqual(pattern) {
        return pattern.type === this.type && pattern._token === this._token;
    }
}

let idIndex$9 = 0;
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
    get regex() {
        return this._originalRegexString;
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
    get startedOnIndex() {
        return this._firstIndex;
    }
    constructor(name, regex) {
        this._node = null;
        this._cursor = null;
        this._firstIndex = 0;
        this._substring = "";
        this._tokens = [];
        this._id = `regex-${idIndex$9++}`;
        this._type = "regex";
        this._name = name;
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
    test(text, record = false) {
        return testPattern(this, text, record);
    }
    exec(text, record = false) {
        return execPattern(this, text, record);
    }
    parse(cursor) {
        // This is a major optimization when backtracking happens.
        // Most parsing will be cached.
        const record = cursor.getRecord(this, cursor.index);
        if (record != null) {
            if (record.ast != null) {
                const node = new Node(this._type, this._name, record.ast.firstIndex, record.ast.lastIndex, [], record.ast.value);
                cursor.recordMatch(this, node);
                cursor.moveTo(node.lastIndex);
                return node;
            }
            if (record.error) {
                cursor.recordErrorAt(record.error.startIndex, record.error.lastIndex, this);
                cursor.moveTo(record.error.lastIndex);
                return null;
            }
        }
        this._firstIndex = cursor.index;
        this.resetState(cursor);
        this.tryToParse(cursor);
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
        if (result != null && result[0].length > 0 && result.index === 0) {
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
        cursor.recordMatch(this, this._node, true);
    }
    processError(cursor) {
        cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
        this._node = null;
    }
    clone(name = this._name) {
        const clone = new Regex(name, this._originalRegexString);
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
    isEqual(pattern) {
        return pattern.type === this.type && pattern._originalRegexString === this._originalRegexString;
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

let idIndex$8 = 0;
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
    get startedOnIndex() {
        return this._firstIndex;
    }
    constructor(name, referencePatternName) {
        this._id = `reference-${idIndex$8++}`;
        this._type = "reference";
        this._name = name;
        this._referencePatternName = referencePatternName || name;
        this._parent = null;
        this._pattern = null;
        this._cachedPattern = null;
        this._children = [];
        this._firstIndex = 0;
        this._cachedAncestors = false;
        this._recursiveAncestors = [];
    }
    test(text, record = false) {
        return testPattern(this, text, record);
    }
    exec(text, record = false) {
        return execPattern(this, text, record);
    }
    parse(cursor) {
        this._firstIndex = cursor.index;
        const pattern = this.getReferencePatternSafely();
        this._cacheAncestors(pattern.id);
        if (this._isBeyondRecursiveAllowance()) {
            cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
            return null;
        }
        return pattern.parse(cursor);
    }
    _cacheAncestors(id) {
        if (!this._cachedAncestors) {
            this._cachedAncestors = true;
            let pattern = this.parent;
            while (pattern != null) {
                if (pattern.id === id) {
                    this._recursiveAncestors.push(pattern);
                }
                pattern = pattern.parent;
            }
        }
    }
    _isBeyondRecursiveAllowance() {
        let depth = 0;
        for (let pattern of this._recursiveAncestors) {
            if (pattern.startedOnIndex === this.startedOnIndex) {
                depth++;
                if (depth > 0) {
                    return true;
                }
            }
        }
        return false;
    }
    getReferencePatternSafely() {
        if (this._pattern === null) {
            let pattern = null;
            if (this._cachedPattern == null) {
                pattern = this._findPattern();
            }
            else {
                pattern = this._cachedPattern;
            }
            if (pattern === null) {
                throw new Error(`Couldn't find '${this._referencePatternName}' pattern within tree.`);
            }
            const clonedPattern = pattern.clone(this._name);
            clonedPattern.parent = this;
            this._pattern = clonedPattern;
            this._children = [this._pattern];
        }
        return this._pattern;
    }
    _findPattern() {
        let pattern = this._parent;
        while (pattern != null) {
            if (pattern.type !== "context") {
                pattern = pattern.parent;
                continue;
            }
            const foundPattern = pattern.getPatternWithinContext(this._referencePatternName);
            if (foundPattern != null && this._isValidPattern(foundPattern)) {
                return foundPattern;
            }
            pattern = pattern.parent;
        }
        const root = this._getRoot();
        return findPattern(root, (pattern) => {
            return pattern.name === this._referencePatternName && this._isValidPattern(pattern);
        });
    }
    _isValidPattern(pattern) {
        if (pattern.type === "reference") {
            return false;
        }
        if (pattern.type === "context" && pattern.children[0].type === "reference") {
            return false;
        }
        return true;
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
        return this.getReferencePatternSafely().getTokens();
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
        return this.getReferencePatternSafely().getPatterns();
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
    clone(name = this._name) {
        const clone = new Reference(name, this._referencePatternName);
        clone._id = this._id;
        // Optimize future clones, by caching the pattern we already found.
        if (this._pattern != null) {
            clone._cachedPattern = this._pattern;
        }
        return clone;
    }
    isEqual(pattern) {
        return pattern.type === this.type && pattern.name === this.name;
    }
}

function clonePatterns(patterns) {
    return patterns.map(p => p.clone());
}

function isRecursivePattern(pattern) {
    let onPattern = pattern.parent;
    let depth = 0;
    while (onPattern != null) {
        if (onPattern.id === pattern.id) {
            depth++;
        }
        onPattern = onPattern.parent;
        if (depth > 1) {
            return true;
        }
    }
    return false;
}

let idIndex$7 = 0;
class Options {
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
    get startedOnIndex() {
        return this._firstIndex;
    }
    constructor(name, options, isGreedy = false) {
        if (options.length === 0) {
            throw new Error("Need at least one pattern with an 'options' pattern.");
        }
        const children = clonePatterns(options);
        this._assignChildrenToParent(children);
        this._id = `options-${idIndex$7++}`;
        this._type = "options";
        this._name = name;
        this._parent = null;
        this._children = children;
        this._firstIndex = 0;
        this._isGreedy = isGreedy;
    }
    _assignChildrenToParent(children) {
        for (const child of children) {
            child.parent = this;
        }
    }
    test(text, record = false) {
        return testPattern(this, text, record);
    }
    exec(text, record = false) {
        return execPattern(this, text, record);
    }
    parse(cursor) {
        this._firstIndex = cursor.index;
        const node = this._tryToParse(cursor);
        if (node != null) {
            cursor.moveTo(node.lastIndex);
            cursor.resolveError();
            return node;
        }
        cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
        return null;
    }
    _tryToParse(cursor) {
        const results = [];
        for (const pattern of this._children) {
            cursor.moveTo(this._firstIndex);
            let result = null;
            result = pattern.parse(cursor);
            if (this._isGreedy) {
                results.push(result);
            }
            if (result != null && !this._isGreedy) {
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
        for (const pattern of this._children) {
            if (isRecursivePattern(pattern)) {
                continue;
            }
            tokens.push(...pattern.getTokens());
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
            if (isRecursivePattern(pattern)) {
                continue;
            }
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
    clone(name = this._name) {
        const clone = new Options(name, this._children, this._isGreedy);
        clone._id = this._id;
        return clone;
    }
    isEqual(pattern) {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }
}

let idIndex$6 = 0;
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
    get min() {
        return this._min;
    }
    get max() {
        return this._max;
    }
    get startedOnIndex() {
        return this._firstIndex;
    }
    constructor(name, pattern, options = {}) {
        this._id = `finite-repeat-${idIndex$6++}`;
        this._type = "finite-repeat";
        this._name = name;
        this._parent = null;
        this._children = [];
        this._hasDivider = options.divider != null;
        this._min = options.min != null ? Math.max(options.min, 1) : 1;
        this._max = Math.max(this.min, options.max || this.min);
        this._trimDivider = options.trimDivider == null ? false : options.trimDivider;
        this._firstIndex = 0;
        for (let i = 0; i < this._max; i++) {
            const child = pattern.clone();
            child.parent = this;
            this._children.push(child);
            if (options.divider != null && (i < this._max - 1 || !this._trimDivider)) {
                const divider = options.divider.clone();
                divider.parent = this;
                this._children.push(divider);
            }
        }
    }
    parse(cursor) {
        this._firstIndex = cursor.index;
        const nodes = [];
        const modulo = this._hasDivider ? 2 : 1;
        let matchCount = 0;
        for (let i = 0; i < this._children.length; i++) {
            const childPattern = this._children[i];
            const runningIndex = cursor.index;
            const node = childPattern.parse(cursor);
            if (cursor.hasError) {
                break;
            }
            if (i % modulo === 0 && !cursor.hasError) {
                matchCount++;
            }
            if (node == null) {
                cursor.moveTo(runningIndex);
            }
            else {
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
            const isDividerLastMatch = this.children.length > 1 && nodes.length > 1 && nodes[nodes.length - 1].name === this.children[1].name;
            if (isDividerLastMatch) {
                const node = nodes.pop();
                cursor.moveTo(node.firstIndex);
            }
        }
        if (matchCount < this._min) {
            const lastIndex = cursor.index;
            cursor.moveTo(this._firstIndex);
            cursor.recordErrorAt(this._firstIndex, lastIndex, this);
            return null;
        }
        if (nodes.length === 0 && !cursor.hasError) {
            cursor.moveTo(this._firstIndex);
            return null;
        }
        const firstIndex = nodes[0].firstIndex;
        const lastIndex = nodes[nodes.length - 1].lastIndex;
        cursor.resolveError();
        cursor.moveTo(lastIndex);
        const node = new Node(this._type, this.name, firstIndex, lastIndex, nodes);
        return node;
    }
    test(text, record = false) {
        return testPattern(this, text, record);
    }
    exec(text, record = false) {
        return execPattern(this, text, record);
    }
    clone(name = this._name) {
        let min = this._min;
        let max = this._max;
        const clone = new FiniteRepeat(name, this._children[0], {
            divider: this._hasDivider ? this._children[1] : undefined,
            min,
            max,
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
    isEqual(pattern) {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }
}

let idIndex$5 = 0;
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
    get min() {
        return this._min;
    }
    get startedOnIndex() {
        return this._firstIndex;
    }
    constructor(name, pattern, options = {}) {
        const min = options.min != null ? Math.max(options.min, 1) : 1;
        const divider = options.divider;
        let children;
        if (divider != null) {
            children = [pattern.clone(), divider.clone()];
        }
        else {
            children = [pattern.clone()];
        }
        this._assignChildrenToParent(children);
        this._id = `infinite-repeat-${idIndex$5++}`;
        this._type = "infinite-repeat";
        this._name = name;
        this._min = min;
        this._parent = null;
        this._children = children;
        this._pattern = children[0];
        this._divider = children[1];
        this._firstIndex = 0;
        this._nodes = [];
        this._trimDivider = options.trimDivider == null ? false : options.trimDivider;
    }
    _assignChildrenToParent(children) {
        for (const child of children) {
            child.parent = this;
        }
    }
    test(text, record = false) {
        return testPattern(this, text, record);
    }
    exec(text, record = false) {
        return execPattern(this, text, record);
    }
    parse(cursor) {
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
            return node;
        }
        if (this._min > 0) {
            return null;
        }
        cursor.resolveError();
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
            const repeatNode = this._pattern.parse(cursor);
            const hasError = cursor.hasError;
            const hasNoErrorAndNoResult = !cursor.hasError && repeatNode == null;
            const hasDivider = this._divider != null;
            const hasNoDivider = !hasDivider;
            if (hasError) {
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
                if (hasNoErrorAndNoResult && hasNoDivider) {
                    // If we didn't match and didn't error we need to get out. Nothing different will happen.
                    break;
                }
                if (repeatNode != null) {
                    this._nodes.push(repeatNode);
                    if (!cursor.hasNext()) {
                        passed = true;
                        break;
                    }
                    cursor.next();
                }
                if (this._divider != null) {
                    const dividerStartIndex = cursor.index;
                    const dividerNode = this._divider.parse(cursor);
                    if (cursor.hasError) {
                        passed = true;
                        break;
                    }
                    else {
                        if (dividerNode == null) {
                            cursor.moveTo(dividerStartIndex);
                            if (repeatNode == null) {
                                // If neither the repeat pattern or divider pattern matched get out. 
                                passed = true;
                                break;
                            }
                        }
                        else {
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
        var _a;
        const hasDivider = this._divider != null;
        if (hasDivider &&
            this._trimDivider &&
            this._nodes[this._nodes.length - 1].name === ((_a = this._divider) === null || _a === void 0 ? void 0 : _a.name)) {
            const dividerNode = this._nodes.pop();
            cursor.moveTo(dividerNode.firstIndex);
        }
        if (this._nodes.length === 0) {
            cursor.moveTo(this._firstIndex);
            return null;
        }
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
        if (index === 0 && this._divider == null && this._parent) {
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
    clone(name = this._name) {
        let min = this._min;
        const clone = new InfiniteRepeat(name, this._pattern, {
            divider: this._divider == null ? undefined : this._divider,
            min: min,
            trimDivider: this._trimDivider
        });
        clone._id = this._id;
        return clone;
    }
    isEqual(pattern) {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }
}

let idIndex$4 = 0;
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
    get min() {
        return this._options.min;
    }
    get max() {
        return this._options.max;
    }
    get startedOnIndex() {
        return this._repeatPattern.startedOnIndex;
    }
    get pattern() {
        return this._pattern;
    }
    get options() {
        return this._options;
    }
    constructor(name, pattern, options = {}) {
        this._id = `repeat-${idIndex$4++}`;
        this._pattern = pattern;
        this._parent = null;
        this._options = Object.assign(Object.assign({}, options), { min: options.min == null ? 1 : options.min, max: options.max == null ? Infinity : options.max });
        if (this._options.max !== Infinity) {
            this._repeatPattern = new FiniteRepeat(name, pattern, this._options);
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
    clone(name = this.name) {
        let min = this._options.min;
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
    isEqual(pattern) {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }
}

const comment = new Regex("comment", "#[^\r\n]+");
comment.setTokens(["# "]);

function filterOutNull(nodes) {
    const filteredNodes = [];
    for (const node of nodes) {
        if (node !== null) {
            filteredNodes.push(node);
        }
    }
    return filteredNodes;
}

let idIndex$3 = 0;
class Sequence {
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
    get startedOnIndex() {
        return this._firstIndex;
    }
    constructor(name, sequence) {
        if (sequence.length === 0) {
            throw new Error("Need at least one pattern with a 'sequence' pattern.");
        }
        const children = clonePatterns(sequence);
        this._assignChildrenToParent(children);
        this._id = `sequence-${idIndex$3++}`;
        this._type = "sequence";
        this._name = name;
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
    test(text, record = false) {
        return testPattern(this, text, record);
    }
    exec(text, record = false) {
        return execPattern(this, text, record);
    }
    parse(cursor) {
        this._firstIndex = cursor.index;
        this._nodes = [];
        const passed = this.tryToParse(cursor);
        if (passed) {
            const node = this.createNode(cursor);
            if (node !== null) {
                cursor.recordMatch(this, node);
            }
            return node;
        }
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
                            if (this._areRemainingPatternsOptional(i)) {
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
                    if (lastNode === null && !this._areAllPatternsOptional()) {
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
    _areAllPatternsOptional() {
        return this._areRemainingPatternsOptional(-1);
    }
    _areRemainingPatternsOptional(fromIndex) {
        const startOnIndex = fromIndex + 1;
        const length = this._children.length;
        for (let i = startOnIndex; i < length; i++) {
            const pattern = this._children[i];
            if (pattern.type !== "optional") {
                return false;
            }
        }
        return true;
    }
    createNode(cursor) {
        const children = filterOutNull(this._nodes);
        if (children.length === 0) {
            cursor.moveTo(this._firstIndex);
            return null;
        }
        const lastIndex = children[children.length - 1].lastIndex;
        cursor.moveTo(lastIndex);
        return new Node("sequence", this._name, this._firstIndex, lastIndex, children);
    }
    getTokens() {
        const tokens = [];
        for (const pattern of this._children) {
            if (isRecursivePattern(pattern) && pattern === this._children[0]) {
                return tokens;
            }
            tokens.push(...pattern.getTokens());
            if (pattern.type !== "optional" && pattern.type !== "not") {
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
            if (isRecursivePattern(pattern) && pattern === this._children[0]) {
                return patterns;
            }
            patterns.push(...pattern.getPatterns());
            if (pattern.type !== "optional" && pattern.type !== "not") {
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
            if (child.type !== "optional") {
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
    clone(name = this._name) {
        const clone = new Sequence(name, this._children);
        clone._id = this._id;
        return clone;
    }
    isEqual(pattern) {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }
}

const literal$1 = new Regex("literal", '"(?:\\\\.|[^"\\\\])*"');
literal$1.setTokens(["[LITERAL]"]);

const tabs$1 = new Regex("tabs", "\\t+");
tabs$1.setTokens(["\t"]);
const spaces$1 = new Regex("spaces", "[ ]+");
spaces$1.setTokens([" "]);
const newLine$1 = new Regex("new-line", "(\\r?\\n)+");
newLine$1.setTokens(["\n"]);
const lineSpaces$1 = new Repeat("line-spaces", new Options("line-space", [tabs$1, spaces$1]));
const allSpaces = new Regex("all-spaces", "\\s+");
allSpaces.setTokens([" "]);

const name$1 = new Regex("name", "[a-zA-Z_-]+[a-zA-Z0-9_-]*");

const regexLiteral = new Regex("regex-literal", "/(\\\\/|[^/\\n\\r])*/");
regexLiteral.setTokens(["[REGEX_EXPRESSION]"]);

const patternName$3 = name$1.clone("pattern-name");
const anonymousLiterals = new Options("anonymous-literals", [
    literal$1,
    regexLiteral,
    patternName$3,
    new Reference("repeat-literal"),
]);
const anonymousWrappedLiterals = new Options("anonymous-wrapped-literals", [
    new Reference("take-until-literal"),
    new Reference("options-literal"),
    new Reference("sequence-literal"),
    new Reference("complex-anonymous-pattern")
]);

let idIndex$2 = 0;
class Optional {
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
    get startedOnIndex() {
        return this._children[0].startedOnIndex;
    }
    constructor(name, pattern) {
        this._id = `optional-${idIndex$2++}`;
        this._type = "optional";
        this._name = name;
        this._parent = null;
        this._children = [pattern.clone()];
        this._children[0].parent = this;
    }
    test(text, record = false) {
        return testPattern(this, text, record);
    }
    exec(text, record = false) {
        return execPattern(this, text, record);
    }
    parse(cursor) {
        const firstIndex = cursor.index;
        const node = this._children[0].parse(cursor);
        if (cursor.hasError) {
            cursor.resolveError();
            cursor.moveTo(firstIndex);
            return null;
        }
        else {
            return node;
        }
    }
    clone(name = this._name) {
        const clone = new Optional(name, this._children[0]);
        clone._id = this._id;
        return clone;
    }
    getTokens() {
        return this._children[0].getTokens();
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
        return this._children[0].getPatterns();
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
    isEqual(pattern) {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }
}

const inlinePatternOpenParen = new Literal("anonymous-pattern-open-paren", "(");
const inlinePatternCloseParen = new Literal("anonymous-pattern-close-paren", ")");
const optionalLineSpaces$4 = new Optional("optional-line-spaces", lineSpaces$1);
const complexAnonymousPattern = new Sequence("complex-anonymous-pattern", [
    inlinePatternOpenParen,
    optionalLineSpaces$4,
    anonymousWrappedLiterals,
    optionalLineSpaces$4,
    inlinePatternCloseParen,
]);
const anonymousPattern = new Options("anonymous-pattern", [
    anonymousLiterals,
    complexAnonymousPattern
]);

const optionalSpaces$3 = new Optional("optional-spaces", spaces$1);
const openBracket$2 = new Literal("repeat-open-bracket", "{");
const closeBracket$2 = new Literal("repeat-close-bracket", "}");
const comma$1 = new Literal("comma", ",");
const integer = new Regex("integer", "([1-9][0-9]*)|0");
integer.setTokens(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
const min = new Optional("optional-min", integer.clone("min"));
const max = new Optional("optional-max", integer.clone("max"));
const trimKeyword = new Literal("trim-keyword", "trim");
const trimFlag = new Optional("optional-trim-flag", new Sequence("trim-flag", [lineSpaces$1, trimKeyword]));
const bounds = new Sequence("bounds", [
    openBracket$2,
    optionalSpaces$3,
    min,
    optionalSpaces$3,
    comma$1,
    optionalSpaces$3,
    max,
    closeBracket$2
]);
const exactCount = new Sequence("exact-count", [
    openBracket$2,
    optionalSpaces$3,
    integer,
    optionalSpaces$3,
    closeBracket$2,
]);
const quantifierShorthand = new Regex("quantifier-shorthand", "\\*|\\+");
quantifierShorthand.setTokens(["*", "+"]);
const quantifier = new Options("quantifier", [
    quantifierShorthand,
    exactCount,
    bounds
]);
const openParen$1 = new Literal("repeat-open-paren", "(");
const closeParen$1 = new Literal("repeat-close-paren", ")");
const dividerComma = new Regex("divider-comma", "\\s*,\\s*");
dividerComma.setTokens([", "]);
const patternName$2 = name$1.clone("pattern-name");
const repeatPattern = new Options("repeat-pattern", [patternName$2, anonymousPattern]);
const repeatDividerPattern = repeatPattern.clone("repeat-divider-pattern");
const repeatDividerSection = new Sequence("repeat-divider-section", [dividerComma, repeatDividerPattern, trimFlag]);
const repeatOptionalDividerSection = new Optional("repeat-optional-divider-section", repeatDividerSection);
const repeatLiteral = new Sequence("repeat-literal", [
    openParen$1,
    optionalSpaces$3,
    repeatPattern,
    repeatOptionalDividerSection,
    optionalSpaces$3,
    closeParen$1,
    new Sequence("quantifier-section", [quantifier]),
]);

const optionalNot = new Optional("optional-not", new Literal("not", "!"));
const optionalIsOptional$1 = new Optional("optional-is-optional", new Literal("is-optional", "?"));
const patternName$1 = name$1.clone("pattern-name");
const patterns$2 = new Options("sequence-patterns", [patternName$1, anonymousPattern]);
const pattern$1 = new Sequence("sequence-child-pattern", [
    optionalNot,
    patterns$2,
    optionalIsOptional$1,
]);
const divider$1 = new Regex("sequence-divider", "\\s*[+]\\s*");
divider$1.setTokens([" + "]);
const sequenceLiteral = new Repeat("sequence-literal", pattern$1, { divider: divider$1, min: 2, trimDivider: true });

const patternName = name$1.clone("pattern-name");
patternName.setTokens(["[PATTERN_NAME]"]);
const patterns$1 = new Sequence("patterns", [
    new Options("options-patterns", [patternName, anonymousPattern]),
    new Optional("optional-right-associated", new Literal("right-associated", " right"))
]);
const defaultDivider = new Regex("default-divider", "\\s*[|]\\s*");
defaultDivider.setTokens(["|"]);
const greedyDivider = new Regex("greedy-divider", "\\s*[<][|][>]\\s*");
greedyDivider.setTokens(["<|>"]);
const divider = new Options("options-divider", [defaultDivider, greedyDivider]);
const optionsLiteral = new Repeat("options-literal", patterns$1, { divider, min: 2, trimDivider: true });

const anyChar = new Literal("any-char", "?");
const upTo = new Literal("up-to", "->");
const wall = new Literal("wall", "|");
const optionalLineSpaces$3 = new Optional("optional-line-spaces", lineSpaces$1);
const takeUntilLiteral = new Sequence("take-until-literal", [
    anyChar,
    optionalLineSpaces$3,
    upTo,
    optionalLineSpaces$3,
    wall,
    optionalLineSpaces$3,
    new Reference("pattern")
]);

const aliasLiteral = name$1.clone("alias-literal");
aliasLiteral.setTokens(["[ALIAS_LITERAL]"]);
const optionalIsOptional = new Optional("optional-flag", new Literal("is-optional", "?"));
const configurableAnonymousPattern = new Sequence("configurable-anonymous-pattern", [anonymousPattern, optionalIsOptional]);
const pattern = new Options("pattern", [
    literal$1,
    regexLiteral,
    repeatLiteral,
    takeUntilLiteral,
    aliasLiteral,
    optionsLiteral,
    sequenceLiteral,
    configurableAnonymousPattern,
], true);

const colon = new Literal("colon", ":");
const comma = new Regex("comma", "\\s*,\\s*");
const openBracket$1 = new Literal("open-bracket", "{");
const closeBracket$1 = new Literal("close-bracket", "}");
const openSquareBracket = new Literal("open-square-bracket", "[");
const closeSquareBracket = new Literal("close-square-bracket", "]");
const optionalAllSpaces = new Optional("optional-all-spaces", allSpaces);
const stringLiteral = new Regex("string-literal", '"(?:\\\\.|[^"\\\\])*"');
const numberLiteral = new Regex("number-literal", '[+-]?\\d+(\\.\\d+)?([eE][+-]?\\d+)?');
const nullLiteral = new Literal("null-literal", "null");
const trueLiteral = new Literal("true-literal", "true");
const falseLiteral = new Literal("false-literal", "false");
const booleanLiteral = new Options("", [trueLiteral, falseLiteral]);
const objectKey = stringLiteral.clone("object-key");
const objectProperty = new Sequence("object-property", [
    objectKey,
    optionalAllSpaces,
    colon,
    optionalAllSpaces,
    new Reference("literal"),
]);
const objectProperies = new Repeat("object-properties", objectProperty, { divider: comma });
const objectLiteral = new Sequence("object-literal", [
    openBracket$1,
    optionalAllSpaces,
    new Optional("optional-object-properties", objectProperies),
    optionalAllSpaces,
    closeBracket$1
]);
const arrayItems = new Repeat("array-items", new Reference("literal"), { divider: comma });
const arrayLiteral = new Sequence("array-literal", [
    openSquareBracket,
    optionalAllSpaces,
    new Optional("optional-array-items", arrayItems),
    optionalAllSpaces,
    closeSquareBracket,
]);
const literal = new Options("literal", [
    objectLiteral,
    arrayLiteral,
    stringLiteral,
    booleanLiteral,
    nullLiteral,
    numberLiteral,
]);
const decoratorPrefix = new Literal("decorator-prefix", "@");
const decoratorName = name$1.clone("decorator-name");
const openParen = new Literal("open-paren", "(");
const closeParen = new Literal("close-paren", ")");
const methodDecoration = new Sequence("method-decorator", [
    decoratorPrefix,
    decoratorName,
    optionalAllSpaces,
    openParen,
    optionalAllSpaces,
    new Optional("optional-args", literal),
    optionalAllSpaces,
    closeParen
]);
const nameDecoration = new Sequence("name-decorator", [
    decoratorPrefix,
    decoratorName,
]);
const decoratorStatement = new Options("decorator-statement", [
    methodDecoration,
    nameDecoration,
]);

const optionalSpaces$2 = new Optional("optional-spaces", spaces$1);
const assignOperator = new Literal("assign-operator", "=");
const assignStatement = new Sequence("assign-statement", [
    optionalSpaces$2,
    name$1,
    optionalSpaces$2,
    assignOperator,
    optionalSpaces$2,
    pattern,
]);
const statement = new Options("statement", [decoratorStatement, assignStatement, name$1.clone("export-name")]);

const bodyLineContent = new Options("body-line-content", [
    comment,
    statement
]);
const optionalLineSpaces$2 = new Optional("optional-line-spaces", lineSpaces$1);
const bodyLine = new Sequence("body-line", [
    optionalLineSpaces$2,
    new Optional("optional-body-line-content", bodyLineContent),
    optionalLineSpaces$2,
]);
const body = new Optional("optional-body", new Repeat("body", bodyLine, { divider: newLine$1 }));

const optionalSpaces$1 = new Optional("optional-spaces", allSpaces);
const optionalLineSpaces$1 = new Optional("optional-line-spaces", lineSpaces$1);
const importNameDivider = new Regex("import-name-divider", "(\\s+)?,(\\s+)?");
importNameDivider.setTokens([", "]);
const name = new Regex("import-name", "[^}\\s,]+");
name.setTokens(["[IMPORT_NAME]"]);
const importKeyword = new Literal("import", "import");
const useParamsKeyword = new Literal("use-params", "use params");
const asKeyword = new Literal("as", "as");
const fromKeyword = new Literal("from", "from");
const openBracket = new Literal("open-bracket", "{");
const closeBracket = new Literal("close-bracket", "}");
const equal = new Literal("equal", "=");
const importNameAlias = name.clone("import-name-alias");
const importAlias = new Sequence("import-alias", [name, lineSpaces$1, asKeyword, lineSpaces$1, importNameAlias]);
const importedNames = new Repeat("imported-names", new Options("import-names", [importAlias, name]), { divider: importNameDivider });
const paramName = name.clone("param-name");
const defaultParamName = name.clone("default-param-name");
const paramNameWithDefault = new Sequence("param-name-with-default-value", [
    paramName,
    new Optional("optional-param-default", new Sequence("param-default", [
        optionalLineSpaces$1,
        equal,
        optionalLineSpaces$1,
        defaultParamName,
    ])),
]);
const paramNames = new Repeat("param-names", paramNameWithDefault, { divider: importNameDivider });
const resource = literal$1.clone("resource");
const useParams = new Sequence("import-params", [
    useParamsKeyword,
    optionalLineSpaces$1,
    openBracket,
    optionalSpaces$1,
    paramNames,
    optionalSpaces$1,
    closeBracket
]);
const withParamsKeyword = new Literal("with-params", "with params");
const withParamsStatement = new Optional("optional-with-params-statement", new Sequence("with-params-statement", [
    withParamsKeyword,
    optionalLineSpaces$1,
    openBracket,
    optionalSpaces$1,
    body,
    optionalSpaces$1,
    closeBracket
]));
const importFromStatement = new Sequence("import-from", [
    importKeyword,
    optionalLineSpaces$1,
    openBracket,
    optionalSpaces$1,
    importedNames,
    optionalSpaces$1,
    closeBracket,
    optionalLineSpaces$1,
    fromKeyword,
    optionalLineSpaces$1,
    resource,
    optionalLineSpaces$1,
    withParamsStatement
]);
const importStatement = new Options("import-statement", [
    useParams,
    importFromStatement
]);

const tabs = new Regex("tabs", "\\t+");
const spaces = new Regex("spaces", "[ ]+");
const newLine = new Regex("new-line", "(\\r?\\n)+");
spaces.setTokens([" "]);
tabs.setTokens(["\t"]);
newLine.setTokens(["\n"]);
const lineSpaces = new Repeat("line-spaces", new Options("line-space", [tabs, spaces]));
const optionalLineSpaces = new Optional("optional-line-spaces", lineSpaces);
const headLineContent = new Options("head-line-content", [
    comment,
    importStatement
]);
const headLine = new Sequence("head-line-content", [
    optionalLineSpaces,
    headLineContent,
    optionalLineSpaces,
]);
const head = new Optional("optional-head", new Repeat("head", headLine, { divider: newLine }));
const optionalSpaces = new Optional("optional-spaces", allSpaces);
const grammar = new Sequence("grammar", [
    optionalSpaces,
    head,
    optionalSpaces,
    body,
    optionalSpaces
]);

let idIndex$1 = 0;
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
    get startedOnIndex() {
        return this.children[0].startedOnIndex;
    }
    constructor(name, pattern) {
        this._id = `not-${idIndex$1++}`;
        this._type = "not";
        this._name = name;
        this._parent = null;
        this._children = [pattern.clone()];
        this._children[0].parent = this;
    }
    test(text, record = false) {
        return testPattern(this, text, record);
    }
    exec(text, record = false) {
        return execPattern(this, text, record);
    }
    parse(cursor) {
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
    isEqual(pattern) {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }
}

let contextId = 0;
class Context {
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
    get startedOnIndex() {
        return this.children[0].startedOnIndex;
    }
    getPatternWithinContext(name) {
        if (this._name === name || this._referencePatternName === name) {
            return this;
        }
        return this._patterns[name] || null;
    }
    getPatternsWithinContext() {
        return Object.assign({}, this._patterns);
    }
    constructor(name, pattern, context = []) {
        this._id = `context-${contextId++}`;
        this._type = "context";
        this._name = name;
        this._parent = null;
        this._patterns = {};
        this._referencePatternName = name;
        const clonedPattern = pattern.clone();
        context.forEach(p => this._patterns[p.name] = p);
        clonedPattern.parent = this;
        this._pattern = clonedPattern;
        this._children = [clonedPattern];
    }
    parse(cursor) {
        return this._pattern.parse(cursor);
    }
    exec(text, record) {
        return this._pattern.exec(text, record);
    }
    test(text, record) {
        return this._pattern.test(text, record);
    }
    clone(name = this._name) {
        const clone = new Context(name, this._pattern.clone(name), Object.values(this._patterns));
        clone._referencePatternName = this._referencePatternName;
        clone._id = this._id;
        return clone;
    }
    getTokens() {
        return this._pattern.getTokens();
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
        return this._pattern.getPatterns();
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
        return this._pattern.find(predicate);
    }
    isEqual(pattern) {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }
}

var Association;
(function (Association) {
    Association[Association["left"] = 0] = "left";
    Association[Association["right"] = 1] = "right";
})(Association || (Association = {}));
class PrecedenceTree {
    constructor(precedenceMap = {}, associationMap = {}) {
        this._prefixPlaceholder = Node.createNode("placeholder", "prefix-placeholder");
        this._prefixNode = null;
        this._postfixPlaceholder = Node.createNode("placeholder", "postfix-placeholder");
        this._postfixNode = null;
        this._binaryPlaceholder = Node.createNode("placeholder", "binary-placeholder");
        this._atomNode = null;
        this._binaryNode = null;
        this._precedenceMap = precedenceMap;
        this._associationMap = associationMap;
        this._revertBinary = () => { };
    }
    addPrefix(name, ...prefix) {
        const lastPrefixNode = this._prefixNode;
        if (lastPrefixNode == null) {
            const node = Node.createNode("expression", name, [...prefix]);
            this._prefixNode = node;
            this._prefixNode.append(this._prefixPlaceholder);
            return;
        }
        const node = Node.createNode("expression", name, [...prefix]);
        this._prefixPlaceholder.replaceWith(node);
        node.append(this._prefixPlaceholder);
        this._prefixNode = node;
    }
    addPostfix(name, ...postfix) {
        const lastPostfixNode = this._postfixNode;
        if (lastPostfixNode == null) {
            const node = Node.createNode("expression", name, [this._postfixPlaceholder, ...postfix]);
            this._postfixNode = node;
            return;
        }
        const node = Node.createNode("expression", name, [lastPostfixNode, ...postfix]);
        this._postfixNode = node;
    }
    addBinary(name, ...delimiterNode) {
        const lastBinaryNode = this._binaryNode;
        const lastPrecendece = this._getPrecedenceFromNode(this._binaryNode);
        const precedence = this._getPrecedence(name);
        const association = this._associationMap[name];
        const lastAtomNode = this._compileAtomNode();
        if (lastAtomNode == null) {
            throw new Error("Cannot add a binary without an atom node.");
        }
        this._binaryPlaceholder.remove();
        if (lastBinaryNode == null) {
            const node = Node.createNode("expression", name, [lastAtomNode, ...delimiterNode, this._binaryPlaceholder]);
            this._binaryNode = node;
            this._revertBinary = () => {
                lastAtomNode.remove();
                this._binaryNode = lastAtomNode;
            };
            return;
        }
        if (precedence === lastPrecendece && association === Association.right) {
            const node = Node.createNode("expression", name, [lastAtomNode, ...delimiterNode, this._binaryPlaceholder]);
            lastBinaryNode.appendChild(node);
            this._revertBinary = () => {
                node.replaceWith(lastAtomNode);
                this._binaryNode = lastBinaryNode;
            };
            this._binaryNode = node;
        }
        else if (precedence === lastPrecendece) {
            const node = Node.createNode("expression", name, []);
            lastBinaryNode.replaceWith(node);
            lastBinaryNode.appendChild(lastAtomNode);
            node.append(lastBinaryNode, ...delimiterNode, this._binaryPlaceholder);
            this._revertBinary = () => {
                lastBinaryNode.remove();
                node.replaceWith(lastBinaryNode);
                this._binaryNode = lastBinaryNode;
            };
            this._binaryNode = node;
        }
        else if (precedence > lastPrecendece) {
            let ancestor = lastBinaryNode.parent;
            let root = lastBinaryNode;
            while (ancestor != null) {
                const nodePrecedence = this._precedenceMap[ancestor.name];
                if (nodePrecedence > precedence) {
                    break;
                }
                root = ancestor;
                ancestor = ancestor.parent;
            }
            lastBinaryNode.appendChild(lastAtomNode);
            const node = Node.createNode("expression", name, []);
            root.replaceWith(node);
            node.append(root, ...delimiterNode, this._binaryPlaceholder);
            this._revertBinary = () => {
                root.remove();
                node.replaceWith(root);
                this._binaryNode = root;
            };
            this._binaryNode = node;
        }
        else {
            const node = Node.createNode("expression", name, [lastAtomNode, ...delimiterNode, this._binaryPlaceholder]);
            lastBinaryNode.appendChild(node);
            this._revertBinary = () => {
                lastAtomNode.remove();
                node.replaceWith(lastAtomNode);
                this._binaryNode = lastBinaryNode;
            };
            this._binaryNode = node;
        }
    }
    _getPrecedenceFromNode(node) {
        if (node == null) {
            return 0;
        }
        return this._getPrecedence(node.name);
    }
    _getPrecedence(name) {
        if (this._precedenceMap[name] != null) {
            return this._precedenceMap[name];
        }
        return 0;
    }
    _compileAtomNode() {
        let node = this._atomNode;
        if (this._prefixNode != null && this._atomNode != null) {
            node = this._prefixNode.findRoot();
            this._prefixPlaceholder.replaceWith(this._atomNode);
        }
        if (this._postfixNode != null && node != null) {
            this._postfixPlaceholder.replaceWith(node);
            node = this._postfixNode;
        }
        this._prefixNode = null;
        this._atomNode = null;
        this._postfixNode = null;
        if (node == null) {
            return null;
        }
        return node.findRoot();
    }
    addAtom(node) {
        this._atomNode = node;
    }
    hasAtom() {
        return this._atomNode != null;
    }
    commit() {
        if (this._binaryNode == null) {
            return this._compileAtomNode();
        }
        const atomNode = this._compileAtomNode();
        if (atomNode == null) {
            this._revertBinary();
            let root = this._binaryNode.findRoot();
            this.reset();
            return root;
        }
        else {
            this._binaryPlaceholder.replaceWith(atomNode);
            const root = this._binaryNode.findRoot();
            this.reset();
            return root;
        }
    }
    reset() {
        this._prefixNode = null;
        this._atomNode = null;
        this._postfixNode = null;
        this._binaryNode = null;
    }
}

let indexId$1 = 0;
class Expression {
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
        return this._patterns;
    }
    get prefixPatterns() {
        return this._prefixPatterns;
    }
    get atomPatterns() {
        return this._atomPatterns;
    }
    get postfixPatterns() {
        return this._postfixPatterns;
    }
    get binaryPatterns() {
        return this._binaryPatterns;
    }
    get originalPatterns() {
        return this._originalPatterns;
    }
    get startedOnIndex() {
        return this._firstIndex;
    }
    constructor(name, patterns) {
        if (patterns.length === 0) {
            throw new Error("Need at least one pattern with an 'expression' pattern.");
        }
        this._id = `expression-${indexId$1++}`;
        this._type = "expression";
        this._name = name;
        this._originalName = name;
        this._parent = null;
        this._firstIndex = 0;
        this._atomPatterns = [];
        this._prefixPatterns = [];
        this._prefixNames = [];
        this._postfixPatterns = [];
        this._postfixNames = [];
        this._binaryPatterns = [];
        this._binaryNames = [];
        this._associationMap = {};
        this._precedenceMap = {};
        this._originalPatterns = patterns;
        this._shouldStopParsing = false;
        this._hasOrganized = false;
        this._patterns = [];
        this._precedenceTree = new PrecedenceTree({}, {});
    }
    _organizePatterns(patterns) {
        const finalPatterns = [];
        patterns.forEach((pattern) => {
            if (this._isAtom(pattern)) {
                const atom = pattern.clone();
                atom.parent = this;
                this._atomPatterns.push(atom);
                finalPatterns.push(atom);
            }
            else if (this._isPrefix(pattern)) {
                const name = this._extractName(pattern);
                const prefix = this._extractPrefix(pattern);
                prefix.parent = this;
                this._prefixPatterns.push(prefix);
                this._prefixNames.push(name);
                finalPatterns.push(prefix);
            }
            else if (this._isPostfix(pattern)) {
                const name = this._extractName(pattern);
                const postfix = this._extractPostfix(pattern);
                postfix.parent = this;
                this._postfixPatterns.push(postfix);
                this._postfixNames.push(name);
                finalPatterns.push(postfix);
            }
            else if (this._isBinary(pattern)) {
                const name = this._extractName(pattern);
                const binary = this._extractBinary(pattern);
                binary.parent = this;
                this._precedenceMap[name] = this._binaryPatterns.length;
                this._binaryPatterns.push(binary);
                this._binaryNames.push(name);
                if (pattern.type === "right-associated") {
                    this._associationMap[name] = Association.right;
                }
                else {
                    this._associationMap[name] = Association.left;
                }
                finalPatterns.push(binary);
            }
        });
        this._patterns = finalPatterns;
        this._precedenceTree = new PrecedenceTree(this._precedenceMap, this._associationMap);
        return finalPatterns;
    }
    _extractName(pattern) {
        if (pattern.type === "right-associated") {
            return pattern.children[0].name;
        }
        return pattern.name;
    }
    _isPrefix(pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);
        const lastChild = pattern.children[pattern.children.length - 1];
        const referenceCount = this._referenceCount(pattern);
        const lastChildIsReference = this._isRecursiveReference(lastChild);
        return lastChildIsReference &&
            referenceCount === 1;
    }
    _extractPrefix(pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);
        return new Sequence(`${pattern.name}-prefix`, pattern.children.slice(0, -1));
    }
    _isAtom(pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);
        const firstChild = pattern.children[0];
        const lastChild = pattern.children[pattern.children.length - 1];
        const firstChildIsReference = this._isRecursiveReference(firstChild);
        const lastChildIsReference = this._isRecursiveReference(lastChild);
        return !firstChildIsReference && !lastChildIsReference;
    }
    _isPostfix(pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);
        const firstChild = pattern.children[0];
        const referenceCount = this._referenceCount(pattern);
        const firstChildIsReference = this._isRecursiveReference(firstChild);
        return firstChildIsReference &&
            referenceCount === 1;
    }
    _extractPostfix(pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);
        return new Sequence(`${pattern.name}-postfix`, pattern.children.slice(1));
    }
    _isBinary(pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);
        const firstChild = pattern.children[0];
        const lastChild = pattern.children[pattern.children.length - 1];
        const firstChildIsReference = this._isRecursiveReference(firstChild);
        const lastChildIsReference = this._isRecursiveReference(lastChild);
        return firstChildIsReference && lastChildIsReference && pattern.children.length > 2;
    }
    _extractBinary(pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);
        const children = pattern.children.slice(1, -1);
        const binarySequence = new Sequence(`${pattern.name}-delimiter`, children);
        return binarySequence;
    }
    _unwrapAssociationIfNecessary(pattern) {
        if (pattern.type === "right-associated") {
            pattern = pattern.children[0];
        }
        if (pattern.type === "reference") {
            pattern.parent = this;
            pattern = pattern.getReferencePatternSafely();
            pattern.parent = null;
        }
        return pattern;
    }
    _referenceCount(pattern) {
        return pattern.children.filter(p => this._isRecursiveReference(p)).length;
    }
    _isRecursiveReference(pattern) {
        if (pattern == null) {
            return false;
        }
        return pattern.name === this._originalName;
    }
    build() {
        if (!this._hasOrganized) {
            this._hasOrganized = true;
            this._organizePatterns(this._originalPatterns);
        }
    }
    parse(cursor) {
        this._firstIndex = cursor.index;
        this.build();
        // If there are not any atom nodes then nothing can be found.
        if (this._atomPatterns.length < 1) {
            cursor.moveTo(this._firstIndex);
            cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
            return null;
        }
        const node = this._tryToParse(cursor);
        if (node != null) {
            node.normalize(this._firstIndex);
            cursor.moveTo(node.lastIndex);
            cursor.resolveError();
            return node;
        }
        cursor.moveTo(this._firstIndex);
        cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
        return null;
    }
    _tryToParse(cursor) {
        this._shouldStopParsing = false;
        while (true) {
            cursor.resolveError();
            this._tryToMatchPrefix(cursor);
            if (this._shouldStopParsing) {
                break;
            }
            this._tryToMatchAtom(cursor);
            if (this._shouldStopParsing) {
                break;
            }
            this._tryToMatchPostfix(cursor);
            if (this._shouldStopParsing) {
                break;
            }
            if (this._precedenceTree.hasAtom()) {
                this._tryToMatchBinary(cursor);
                if (this._shouldStopParsing) {
                    break;
                }
            }
            else {
                break;
            }
        }
        return this._precedenceTree.commit();
    }
    _tryToMatchPrefix(cursor) {
        let onIndex = cursor.index;
        for (let i = 0; i < this._prefixPatterns.length; i++) {
            const pattern = this._prefixPatterns[i];
            const name = this._prefixNames[i];
            const node = pattern.parse(cursor);
            if (node != null) {
                this._precedenceTree.addPrefix(name, ...node.children);
                if (cursor.hasNext()) {
                    cursor.next();
                    onIndex = cursor.index;
                    i = -1;
                    continue;
                }
                else {
                    this._shouldStopParsing = true;
                    break;
                }
            }
            else {
                cursor.moveTo(onIndex);
                cursor.resolveError();
            }
        }
    }
    _tryToMatchAtom(cursor) {
        let onIndex = cursor.index;
        for (let i = 0; i < this._atomPatterns.length; i++) {
            cursor.moveTo(onIndex);
            const pattern = this._atomPatterns[i];
            const node = pattern.parse(cursor);
            if (node != null) {
                this._precedenceTree.addAtom(node);
                if (cursor.hasNext()) {
                    cursor.next();
                }
                else {
                    this._shouldStopParsing = true;
                }
                break;
            }
            else {
                cursor.resolveError();
                cursor.moveTo(onIndex);
            }
        }
    }
    _tryToMatchPostfix(cursor) {
        let onIndex = cursor.index;
        for (let i = 0; i < this._postfixPatterns.length; i++) {
            const pattern = this._postfixPatterns[i];
            const name = this._postfixNames[i];
            const node = pattern.parse(cursor);
            if (node != null) {
                this._precedenceTree.addPostfix(name, ...node.children);
                if (cursor.hasNext()) {
                    cursor.next();
                    onIndex = cursor.index;
                    i = -1;
                    continue;
                }
                else {
                    this._shouldStopParsing = true;
                    break;
                }
            }
            else {
                cursor.moveTo(onIndex);
                cursor.resolveError();
            }
        }
    }
    _tryToMatchBinary(cursor) {
        let onIndex = cursor.index;
        let foundMatch = false;
        if (this.binaryPatterns.length === 0) {
            this._shouldStopParsing = true;
        }
        for (let i = 0; i < this._binaryPatterns.length; i++) {
            cursor.moveTo(onIndex);
            const pattern = this._binaryPatterns[i];
            const name = this._binaryNames[i];
            const node = pattern.parse(cursor);
            if (node != null) {
                foundMatch = true;
                this._precedenceTree.addBinary(name, ...node.children);
                if (cursor.hasNext()) {
                    cursor.next();
                }
                else {
                    this._shouldStopParsing = true;
                }
                break;
            }
            else {
                cursor.moveTo(onIndex);
                cursor.resolveError();
            }
        }
        if (!foundMatch) {
            this._shouldStopParsing = true;
        }
    }
    test(text, record = false) {
        return testPattern(this, text, record);
    }
    exec(text, record = false) {
        return execPattern(this, text, record);
    }
    getTokens() {
        const atomTokens = this._atomPatterns.map(p => p.getTokens()).flat();
        const prefixTokens = this.prefixPatterns.map(p => p.getTokens()).flat();
        return [...prefixTokens, ...atomTokens];
    }
    getTokensAfter(childReference) {
        if (this._prefixPatterns.includes(childReference) || this._binaryPatterns.includes(childReference)) {
            const atomTokens = this._atomPatterns.map(p => p.getTokens()).flat();
            const prefixTokens = this.prefixPatterns.map(p => p.getTokens()).flat();
            return [...prefixTokens, ...atomTokens];
        }
        if (this._atomPatterns.includes(childReference)) {
            const postfixTokens = this.prefixPatterns.map(p => p.getTokens()).flat();
            if (postfixTokens.length === 0) {
                return this._binaryPatterns.map(p => p.getTokens()).flat();
            }
            return postfixTokens;
        }
        if (this._postfixPatterns.includes(childReference)) {
            const postfixTokens = this.postfixPatterns.map(p => p.getTokens()).flat();
            const binaryTokens = this._binaryPatterns.map(p => p.getTokens()).flat();
            return [...postfixTokens, ...binaryTokens];
        }
        return [];
    }
    getNextTokens() {
        if (this._parent == null) {
            return [];
        }
        return this._parent.getTokensAfter(this);
    }
    getPatterns() {
        const atomPatterns = this._atomPatterns.map(p => p.getPatterns()).flat();
        const prefixPatterns = this.prefixPatterns.map(p => p.getPatterns()).flat();
        return [...prefixPatterns, ...atomPatterns];
    }
    getPatternsAfter(childReference) {
        if (this._prefixPatterns.includes(childReference) || this._binaryPatterns.includes(childReference)) {
            const atomPatterns = this._atomPatterns.map(p => p.getPatterns()).flat();
            const prefixPatterns = this.prefixPatterns.map(p => p.getPatterns()).flat();
            return [...prefixPatterns, ...atomPatterns];
        }
        if (this._atomPatterns.includes(childReference)) {
            const postfixPatterns = this.prefixPatterns.map(p => p.getPatterns()).flat();
            if (postfixPatterns.length === 0) {
                return this._binaryPatterns.map(p => p.getPatterns()).flat();
            }
            return postfixPatterns;
        }
        if (this._postfixPatterns.includes(childReference)) {
            const postfixPaterns = this.postfixPatterns.map(p => p.getPatterns()).flat();
            const binaryPatterns = this._binaryPatterns.map(p => p.getPatterns()).flat();
            return [...postfixPaterns, ...binaryPatterns];
        }
        return [];
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
    clone(name = this._name) {
        const clone = new Expression(name, this._originalPatterns);
        clone._originalName = this._originalName;
        clone._id = this._id;
        return clone;
    }
    isEqual(pattern) {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }
}

let idIndex = 0;
class TakeUntil {
    get id() {
        return this._id;
    }
    get type() {
        return this._type;
    }
    get name() {
        return this._name;
    }
    get children() {
        return this._children;
    }
    get parent() {
        return this._parent;
    }
    set parent(pattern) {
        this._parent = pattern;
    }
    get startedOnIndex() {
        return this._startedOnIndex;
    }
    constructor(name, terminatingPattern) {
        this._id = String(idIndex++);
        this._type = "take-until";
        this._name = name;
        this._parent = null;
        this._terminatingPattern = terminatingPattern;
        this._children = [this._terminatingPattern];
        this._tokens = [];
        this._startedOnIndex = 0;
        this._shouldCache = terminatingPattern.type === "literal" || terminatingPattern.type === "regex";
    }
    parse(cursor) {
        // We can use caching if our terminating pattern is a literal or a regex.
        if (this._shouldCache) {
            // This is a major optimization when backtracking happens.
            // Most parsing will be cached.
            const record = cursor.getRecord(this, cursor.index);
            if (record != null) {
                if (record.ast != null) {
                    const node = new Node(this._type, this._name, record.ast.firstIndex, record.ast.lastIndex, [], record.ast.value);
                    cursor.recordMatch(this, node);
                    cursor.moveTo(node.lastIndex);
                    return node;
                }
                if (record.error) {
                    cursor.recordErrorAt(record.error.startIndex, record.error.lastIndex, this);
                    cursor.moveTo(record.error.lastIndex);
                    return null;
                }
            }
        }
        let cursorIndex = cursor.index;
        let foundMatch = false;
        this._startedOnIndex = cursor.index;
        let terminatingResult = this._terminatingPattern.parse(cursor);
        cursor.resolveError();
        if (terminatingResult == null) {
            foundMatch = true;
            cursor.moveTo(cursorIndex);
            cursorIndex += 1;
            cursor.hasNext() && cursor.next();
        }
        while (true) {
            terminatingResult = this._terminatingPattern.parse(cursor);
            cursor.resolveError();
            if (terminatingResult == null) {
                cursor.moveTo(cursorIndex);
                cursorIndex += 1;
                if (cursor.hasNext()) {
                    cursor.next();
                }
                else {
                    break;
                }
            }
            else {
                break;
            }
        }
        if (foundMatch) {
            cursor.moveTo(cursorIndex - 1);
            const value = cursor.getChars(this.startedOnIndex, cursorIndex - 1);
            const node = Node.createValueNode(this._type, this._name, value);
            cursor.recordMatch(this, node, this._shouldCache);
            return node;
        }
        else {
            cursor.moveTo(this.startedOnIndex);
            cursor.recordErrorAt(this._startedOnIndex, this._startedOnIndex, this);
            return null;
        }
    }
    exec(text, record) {
        return execPattern(this, text, record);
    }
    test(text, record) {
        return testPattern(this, text, record);
    }
    clone(name = this.name) {
        const clone = new TakeUntil(name, this._terminatingPattern);
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
    isEqual(pattern) {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }
}

let indexId = 0;
class RightAssociated {
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
    get startedOnIndex() {
        return this._children[0].startedOnIndex;
    }
    constructor(pattern) {
        this._id = `right-associated-${indexId++}`;
        this._type = "right-associated";
        this._name = "";
        this._parent = null;
        this._children = [pattern.clone()];
    }
    parse(cursor) {
        return this.children[0].parse(cursor);
    }
    exec(text, record) {
        return this.children[0].exec(text, record);
    }
    test(text, record) {
        return this.children[0].test(text, record);
    }
    clone(_name) {
        const clone = new RightAssociated(this.children[0]);
        clone._id = this._id;
        return clone;
    }
    getTokens() {
        return this.children[0].getTokens();
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
        return this.children[0].getPatterns();
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
        return this.children[0].find(predicate);
    }
    isEqual(pattern) {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }
}

function generateErrorMessage(pattern, cursor) {
    const furthestMatch = cursor.leafMatch;
    if (furthestMatch == null || furthestMatch.node == null || furthestMatch.pattern == null) {
        const suggestions = cleanSuggestions(pattern.getTokens()).join(", ");
        return `Error at line 1, column 1. Hint: ${suggestions}`;
    }
    const endIndex = furthestMatch.node.endIndex;
    if (endIndex === 0) {
        const suggestions = cleanSuggestions(pattern.getTokens()).join(", ");
        return `Error at line 1, column 1. Hint: ${suggestions}`;
    }
    const lastPattern = furthestMatch.pattern;
    const suggestions = cleanSuggestions(lastPattern.getNextTokens());
    const strUpToError = cursor.getChars(0, endIndex);
    const lines = strUpToError.split("\n");
    const lastLine = lines[lines.length - 1];
    const line = lines.length;
    const column = lastLine.length;
    return `Error at line ${line}, column ${column}. Hint: ${suggestions}`;
}
function cleanSuggestions(suggestions) {
    return suggestions.map(s => s.trim()).filter(s => s.length > 0);
}

const tokens = (pattern, arg) => {
    if (pattern.type === "regex" && Array.isArray(arg)) {
        const regex = pattern;
        const tokens = [];
        arg.forEach(token => {
            if (typeof token === "string") {
                tokens.push(token);
            }
        });
        regex.setTokens(tokens);
    }
};

let anonymousIndexId = 0;
const defaultDecorators = {
    tokens: tokens
};
const patternNodes = {
    "literal": true,
    "regex-literal": true,
    "options-literal": true,
    "sequence-literal": true,
    "repeat-literal": true,
    "alias-literal": true,
    "take-until-literal": true,
    "configurable-anonymous-pattern": true
};
class ParseContext {
    constructor(params, decorators = {}) {
        this.patternsByName = new Map();
        this.importedPatternsByName = new Map();
        this.paramsByName = new Map();
        params.forEach(p => this.paramsByName.set(p.name, p));
        this.decorators = Object.assign(Object.assign({}, decorators), defaultDecorators);
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
        this._parseContext = new ParseContext(this._params, options.decorators || {});
    }
    import(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const grammarFile = yield this._resolveImport(path, null);
            const grammar = new Grammar({
                resolveImport: this._resolveImport,
                originResource: grammarFile.resource,
                params: this._params,
                decorators: this._parseContext.decorators
            });
            return grammar.parse(grammarFile.expression);
        });
    }
    parse(expression) {
        return __awaiter(this, void 0, void 0, function* () {
            this._parseContext = new ParseContext(this._params, this._parseContext.decorators);
            const ast = this._tryToParse(expression);
            yield this._resolveImports(ast);
            this._buildPatterns(ast);
            return this._buildPatternRecord();
        });
    }
    parseString(expression) {
        this._parseContext = new ParseContext(this._params, this._parseContext.decorators);
        const ast = this._tryToParse(expression);
        if (this._hasImports(ast)) {
            throw new Error("Cannot use imports on parseString, use parse instead.");
        }
        this._buildPatterns(ast);
        return this._buildPatternRecord();
    }
    _buildPatternRecord() {
        const patterns = {};
        const allPatterns = Array.from(this._parseContext.patternsByName.values());
        allPatterns.forEach(p => {
            patterns[p.name] = new Context(p.name, p, allPatterns.filter(o => o !== p));
        });
        return patterns;
    }
    _tryToParse(expression) {
        const { ast, cursor } = grammar.exec(expression, true);
        if (ast == null) {
            const message = generateErrorMessage(grammar, cursor);
            throw new Error(`[Invalid Grammar] ${message}`);
        }
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
        const body = ast.find(n => n.name === "body" && n.findAncestor(n => n.name === "head") == null);
        if (body == null) {
            return;
        }
        const statements = body.findAll(n => n.name === "assign-statement");
        statements.forEach((n) => {
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
                case "options-literal": {
                    this._saveOptions(n);
                    break;
                }
                case "sequence-literal": {
                    this._saveSequence(n);
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
                case "take-until-literal": {
                    this._saveTakeUntil(n);
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
        this._applyDecorators(statementNode, literal);
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
        this._applyDecorators(statementNode, regex);
        this._parseContext.patternsByName.set(name, regex);
    }
    _buildRegex(name, node) {
        const value = node.value.slice(1, node.value.length - 1);
        return new Regex(name, value);
    }
    _saveOptions(statementNode) {
        const nameNode = statementNode.find(n => n.name === "name");
        const name = nameNode.value;
        const optionsNode = statementNode.find(n => n.name === "options-literal");
        const options = this._buildOptions(name, optionsNode);
        this._applyDecorators(statementNode, options);
        this._parseContext.patternsByName.set(name, options);
    }
    _buildOptions(name, node) {
        const patternNodes = node.children.filter(n => n.name !== "default-divider" && n.name !== "greedy-divider");
        const isGreedy = node.find(n => n.name === "greedy-divider") != null;
        const patterns = patternNodes.map(n => {
            const rightAssociated = n.find(n => n.name === "right-associated");
            if (rightAssociated != null) {
                return new RightAssociated(this._buildPattern(n.children[0]));
            }
            else {
                return this._buildPattern(n.children[0]);
            }
        });
        const hasRecursivePattern = patterns.some(p => this._isRecursive(name, p));
        if (hasRecursivePattern && !isGreedy) {
            try {
                const expression = new Expression(name, patterns);
                return expression;
            }
            catch (_a) { }
        }
        const options = new Options(name, patterns, isGreedy);
        return options;
    }
    _isRecursive(name, pattern) {
        if (pattern.type === "right-associated") {
            pattern = pattern.children[0];
        }
        return this._isRecursivePattern(name, pattern);
    }
    _isRecursivePattern(name, pattern) {
        if (pattern.type === "reference") {
            return true;
        }
        if (pattern.children.length === 0) {
            return false;
        }
        const firstChild = pattern.children[0];
        const lastChild = pattern.children[pattern.children.length - 1];
        const isLongEnough = pattern.children.length >= 2;
        return pattern.type === "sequence" && isLongEnough &&
            (firstChild.name === name ||
                lastChild.name === name);
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
                return this._buildRepeat(name, node);
            }
            case "options-literal": {
                return this._buildOptions(name, node);
            }
            case "sequence-literal": {
                return this._buildSequence(name, node);
            }
            case "take-until-literal": {
                return this._buildTakeUntil(name, node);
            }
            case "complex-anonymous-pattern": {
                return this._buildComplexAnonymousPattern(node);
            }
        }
        throw new Error(`Couldn't build node: ${node.name}.`);
    }
    _saveSequence(statementNode) {
        const nameNode = statementNode.find(n => n.name === "name");
        const name = nameNode.value;
        const sequenceNode = statementNode.find(n => n.name === "sequence-literal");
        const sequence = this._buildSequence(name, sequenceNode);
        this._applyDecorators(statementNode, sequence);
        this._parseContext.patternsByName.set(name, sequence);
    }
    _buildSequence(name, node) {
        const patternNodes = node.children.filter(n => n.name !== "sequence-divider");
        const patterns = patternNodes.map(n => {
            const patternNode = n.children[0].name === "not" ? n.children[1] : n.children[0];
            const isNot = n.find(n => n.name === "not") != null;
            const isOptional = n.find(n => n.name === "is-optional");
            const pattern = this._buildPattern(patternNode);
            const finalPattern = isOptional ? new Optional(`optional-${pattern.name}`, pattern) : pattern;
            if (isNot) {
                return new Not(`not-${finalPattern.name}`, finalPattern);
            }
            return finalPattern;
        });
        return new Sequence(name, patterns);
    }
    _saveRepeat(statementNode) {
        const nameNode = statementNode.find(n => n.name === "name");
        const name = nameNode.value;
        const repeatNode = statementNode.find(n => n.name === "repeat-literal");
        const repeat = this._buildRepeat(name, repeatNode);
        this._applyDecorators(statementNode, repeat);
        this._parseContext.patternsByName.set(name, repeat);
    }
    _buildRepeat(name, repeatNode) {
        let isOptional = false;
        const bounds = repeatNode.find(n => n.name === "bounds");
        const exactCount = repeatNode.find(n => n.name === "exact-count");
        const quantifier = repeatNode.find(n => n.name === "quantifier-shorthand");
        const trimDivider = repeatNode.find(n => n.name === "trim-flag") != null;
        const patterNode = repeatNode.children[1].type === "spaces" ? repeatNode.children[2] : repeatNode.children[1];
        const pattern = this._buildPattern(patterNode);
        const dividerSectionNode = repeatNode.find(n => n.name === "repeat-divider-section");
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
                isOptional = true;
            }
        }
        return isOptional ? new Optional(name, new Repeat(`inner-optional-${name}`, pattern, options)) : new Repeat(name, pattern, options);
    }
    _saveTakeUntil(statementNode) {
        const nameNode = statementNode.find(n => n.name === "name");
        const name = nameNode.value;
        const takeUntilNode = statementNode.find(n => n.name === "take-until-literal");
        const takeUntil = this._buildTakeUntil(name, takeUntilNode);
        this._applyDecorators(statementNode, takeUntil);
        this._parseContext.patternsByName.set(name, takeUntil);
    }
    _buildTakeUntil(name, takeUntilNode) {
        const patternNode = takeUntilNode.children[takeUntilNode.children.length - 1];
        const untilPattern = this._buildPattern(patternNode);
        return new TakeUntil(name, untilPattern);
    }
    _saveConfigurableAnonymous(node) {
        const nameNode = node.find(n => n.name === "name");
        const name = nameNode.value;
        const anonymousNode = node.find(n => n.name === "configurable-anonymous-pattern");
        const isOptional = node.children[1] != null;
        const anonymous = isOptional ? new Optional(name, this._buildPattern(anonymousNode.children[0])) : this._buildPattern(anonymousNode.children[0]);
        this._applyDecorators(node, anonymous);
        this._parseContext.patternsByName.set(name, anonymous);
    }
    _buildComplexAnonymousPattern(node) {
        const wrappedNode = node.children[1].name === "line-spaces" ? node.children[2] : node.children[1];
        return this._buildPattern(wrappedNode);
    }
    _resolveImports(ast) {
        return __awaiter(this, void 0, void 0, function* () {
            const importStatements = ast.findAll(n => {
                return n.name === "import-from" || n.name === "param-name-with-default-value";
            });
            for (const statement of importStatements) {
                if (statement.name === "import-from") {
                    yield this.processImport(statement);
                }
                else {
                    this.processUseParams(statement);
                }
            }
        });
    }
    processImport(importStatement) {
        return __awaiter(this, void 0, void 0, function* () {
            const parseContext = this._parseContext;
            const resourceNode = importStatement.find(n => n.name === "resource");
            const params = this._getParams(importStatement);
            const resource = resourceNode.value.slice(1, -1);
            const grammarFile = yield this._resolveImport(resource, this._originResource || null);
            const grammar = new Grammar({
                resolveImport: this._resolveImport,
                originResource: grammarFile.resource,
                params,
                decorators: this._parseContext.decorators
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
        });
    }
    processUseParams(paramName) {
        const defaultValueNode = paramName.find(n => n.name === "param-default");
        if (defaultValueNode === null) {
            return;
        }
        const nameNode = paramName.find(n => n.name === "param-name");
        const defaultNameNode = defaultValueNode.find(n => n.name === "default-param-name");
        if (nameNode == null || defaultNameNode == null) {
            return;
        }
        const name = nameNode.value;
        const defaultName = defaultNameNode.value;
        if (this._parseContext.paramsByName.has(name)) {
            return;
        }
        let pattern = this._parseContext.importedPatternsByName.get(defaultName);
        if (pattern == null) {
            pattern = new Reference(defaultName);
        }
        this._parseContext.importedPatternsByName.set(name, pattern);
    }
    _applyDecorators(statementNode, pattern) {
        const decorators = this._parseContext.decorators;
        const bodyLine = statementNode.parent;
        if (bodyLine == null) {
            return;
        }
        let prevSibling = bodyLine.previousSibling();
        let decoratorNodes = [];
        while (prevSibling != null) {
            if (prevSibling.find(n => n.name === "assign-statement")) {
                break;
            }
            decoratorNodes.push(prevSibling);
            prevSibling = prevSibling.previousSibling();
        }
        decoratorNodes = decoratorNodes.filter(n => n.find(n => n.name.includes("decorator")) != null);
        decoratorNodes.forEach((d) => {
            const nameNode = d.find(n => n.name === "decorator-name");
            if (nameNode == null || decorators[nameNode.value] == null) {
                return;
            }
            const nameDocorator = d.find(n => n.name === "name-decorator");
            if (nameDocorator != null) {
                decorators[nameNode.value](pattern);
                return;
            }
            const methodDecorator = d.find(n => n.name === "method-decorator");
            if (methodDecorator == null) {
                return;
            }
            methodDecorator.findAll(n => n.name.includes("space")).forEach(n => n.remove());
            const argsNode = methodDecorator.children[3];
            if (argsNode == null || argsNode.name === "close-paren") {
                decorators[nameNode.value](pattern);
            }
            else {
                decorators[nameNode.value](pattern, JSON.parse(argsNode.value));
            }
        });
    }
    _getParams(importStatement) {
        let params = [];
        const paramsStatement = importStatement.find(n => n.name === "with-params-statement");
        if (paramsStatement != null) {
            const statements = paramsStatement.find(n => n.name === "body");
            if (statements != null) {
                const expression = statements.toString();
                const importedValues = Array.from(this
                    ._parseContext
                    .importedPatternsByName
                    .values());
                const grammar = new Grammar({
                    params: [...importedValues, ...this._parseContext.paramsByName.values()],
                    originResource: this._originResource,
                    resolveImport: this._resolveImport,
                    decorators: this._parseContext.decorators
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
        const aliasPattern = this._getPattern(aliasName);
        // This solves the problem for an alias pointing to a reference.
        if (aliasPattern.type === "reference") {
            const reference = aliasPattern.clone(name);
            this._applyDecorators(statementNode, reference);
            this._parseContext.patternsByName.set(name, reference);
        }
        else {
            const alias = aliasPattern.clone(name);
            this._applyDecorators(statementNode, alias);
            this._parseContext.patternsByName.set(name, alias);
        }
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
            const lastIndex = cursor.getLastIndex() + 1;
            error = new ParseError(startIndex, lastIndex, this._pattern);
            errorAtIndex = startIndex;
        }
        else if (!isComplete && options.length === 0 && ast != null) {
            const startIndex = ast.endIndex;
            const lastIndex = cursor.getLastIndex() + 1;
            error = new ParseError(startIndex, lastIndex, this._pattern);
            errorAtIndex = startIndex;
        }
        else if (!isComplete && this._cursor.hasError && this._cursor.furthestError != null) {
            errorAtIndex = this.getFurthestPosition(cursor);
            error = new ParseError(errorAtIndex, errorAtIndex, this._pattern);
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
    getFurthestPosition(cursor) {
        const furthestError = cursor.furthestError;
        const furthestMatch = cursor.allMatchedNodes[cursor.allMatchedNodes.length - 1];
        if (furthestError && furthestMatch) {
            if (furthestError.lastIndex > furthestMatch.endIndex) {
                return furthestMatch.endIndex;
            }
            else {
                return furthestError.lastIndex;
            }
        }
        if (furthestError == null && furthestMatch != null) {
            return furthestMatch.endIndex;
        }
        if (furthestMatch == null && furthestError != null) {
            return furthestError.lastIndex;
        }
        return 0;
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
        const errors = this._cursor.errors.filter(e => e.lastIndex === this._cursor.length);
        const suggestions = errors.map(e => {
            const tokens = this._getTokensForPattern(e.pattern);
            const adjustedTokens = new Set();
            const currentText = this._cursor.getChars(e.startIndex, e.lastIndex);
            tokens.forEach((token) => {
                if (token.startsWith(currentText) && token.length > currentText.length) {
                    const difference = token.length - currentText.length;
                    const suggestedText = token.slice(-difference);
                    adjustedTokens.add(suggestedText);
                }
            });
            return Array.from(adjustedTokens).map(t => {
                return {
                    text: t,
                    startIndex: e.lastIndex,
                };
            });
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

const { expression } = patterns `
number = /[+-]?(\\d+(\\.\\d*)?|\\.\\d+)([eE][+-]?\\d+)?/
spaces = /\\s+/
single-quote-string-literal = /'(?:\\\\.|[^'\\\\])*'/
name = /[a-zA-Z_-]+[a-zA-Z0-9_-]*/
comma = /\\s*,\\s*/
wild-card = "*"
equal = "="
not-equal = "!="
starts-with = "^="
ends-with = "$="
contains = "*="
greater-than-or-equal = ">="
less-than-or-equal = "<="
greater-than = ">"
less-than = "<"
operators =      equal |
             not-equal | 
           starts-with | 
             ends-with | 
              contains | 
 greater-than-or-equal | 
    less-than-or-equal | 
          greater-than | 
             less-than
             
attribute-name = name
value = name
attribute-value = single-quote-string-literal | number | value
attribute-selector = "[" + spaces? + attribute-name + spaces? + operators + spaces? + attribute-value + "]"

adjacent = spaces? + "+" + spaces?
after = spaces? + "~" + spaces?
direct-child = spaces? + ">" + spaces?
descendant = spaces

combinators =  adjacent | after | direct-child | descendant
name-selector = name-selector-expression + attribute-selector
name-selector-expression = name-selector | name
node-selector = wild-card | attribute-selector | name-selector-expression
or-selector = (node-selector, comma){2}

selector-expression = expression + combinators + expression
expression = selector-expression | or-selector | node-selector 
`;
const selectorParser = expression;

const combinatorMap = {
    "adjacent": true,
    "after": true,
    "descendant": true,
    "direct-child": true
};
const operatorMap = {
    "equal": true,
    "not-equal": true,
    "starts-with": true,
    "ends-with": true,
    "contains": true,
    "greater-than-or-equal": true,
    "less-than-or-equal": true,
    "greater-than": true,
    "less-than": true
};
class Selector {
    constructor(selector) {
        this._selectedNodes = [];
        this._combinator = null;
        const result = selectorParser.exec(selector);
        if (result.ast == null) {
            const message = generateErrorMessage(selectorParser, result.cursor);
            throw new Error(`[Invalid Selector] ${message}`);
        }
        this._selectorAst = result.ast;
    }
    find(nodes) {
        this._selectedNodes = nodes;
        const ast = this._selectorAst;
        ast.walkUp((node) => {
            this._process(node);
        });
        return this._selectedNodes;
    }
    filter(nodes) {
        if (nodes.length < 1) {
            return [];
        }
        const nodeMap = new Map();
        nodes.forEach(n => nodeMap.set(n, n));
        this._selectedNodes = [nodes[0].findRoot()];
        const ast = this._selectorAst;
        ast.walkUp((node) => {
            this._process(node);
        });
        return this._selectedNodes.filter(n => nodeMap.has(n));
    }
    not(nodes) {
        if (nodes.length < 1) {
            return [];
        }
        this._selectedNodes = [nodes[0].findRoot()];
        const ast = this._selectorAst;
        ast.walkUp((node) => {
            this._process(node);
        });
        const selectedNodeMap = new Map();
        this._selectedNodes.forEach(n => selectedNodeMap.set(n, n));
        return nodes.filter(n => !selectedNodeMap.has(n));
    }
    parents(nodes) {
        if (nodes.length < 1) {
            return [];
        }
        this._selectedNodes = [nodes[0].findRoot()];
        const ast = this._selectorAst;
        ast.walkUp((node) => {
            this._process(node);
        });
        const result = new Set();
        const ancestorMap = new Map();
        this._selectedNodes.forEach(n => ancestorMap.set(n, true));
        nodes.forEach(n => {
            const ancestor = n.findAncestor(a => ancestorMap.has(a));
            if (ancestor != null) {
                result.add(ancestor);
            }
        });
        return Array.from(result);
    }
    _process(ast) {
        const nodeName = ast.name;
        if (nodeName === "wild-card") {
            this._selectedNodes = this._processWildCard();
        }
        else if (nodeName === "or-selector") {
            this._selectedNodes = this._processOrSelector(ast);
        }
        else if (nodeName === "name-selector" || (nodeName === "name" && (ast.parent == null || ast.parent.name === "selector-expression"))) {
            this._selectedNodes = this._processNameSelector(ast);
        }
        else if (nodeName === "attribute-selector" && (ast.parent == null || ast.parent.name === "selector-expression")) {
            this._selectedNodes = this._processAttributeSelector(ast);
        }
        else if (combinatorMap[nodeName]) {
            this._combinator = nodeName;
        }
        else if (nodeName === "selector-expression") {
            this._combinator = null;
        }
    }
    _processWildCard() {
        return this._selectedNodes.map(n => {
            return this._selectWithCombinator(n, () => true);
        }).flat();
    }
    _processOrSelector(ast) {
        const selectorNodes = ast.children.filter(n => n.name !== "comma");
        const set = new Set();
        const selectors = selectorNodes.map(n => new Selector(n.toString()));
        selectors.map(s => {
            return s.find(this._selectedNodes.slice());
        }).flat().forEach((node) => {
            set.add(node);
        });
        return Array.from(set);
    }
    _processNameSelector(ast) {
        if (ast.children.length > 1) {
            return this._selectedNodes.map(n => {
                const name = ast.children[0].value;
                return this._selectWithCombinator(n, (node) => {
                    return node.name === name && this._isAttributeMatch(node, ast);
                });
            }).flat();
        }
        else {
            return this._selectedNodes.map(n => {
                return this._selectWithCombinator(n, (node) => node.name === ast.value);
            }).flat();
        }
    }
    _processAttributeSelector(ast) {
        return this._selectedNodes.map(n => {
            return this._selectWithCombinator(n, (node) => {
                return this._isAttributeMatch(node, ast);
            });
        }).flat();
    }
    _selectWithCombinator(node, predicate) {
        if (this._combinator === "adjacent") {
            const sibling = node.nextSibling();
            if (sibling == null) {
                return [];
            }
            if (predicate(sibling)) {
                return [sibling];
            }
            else {
                return [];
            }
        }
        else if (this._combinator === "after") {
            const parent = node.parent;
            if (parent == null) {
                return [];
            }
            const index = parent.findChildIndex(node);
            const after = parent.children.slice(index + 1);
            return after.filter(predicate);
        }
        else if (this._combinator === "direct-child") {
            return node.children.filter(predicate);
        }
        else if (this._combinator === "descendant" || this._combinator == null) {
            return node.findAll(predicate);
        }
        else {
            return [];
        }
    }
    _isAttributeMatch(node, ast) {
        const name = this._getAttributeName(ast);
        const operator = this._getAttributeOperator(ast);
        const value = this._getAttributeValue(ast);
        const anyNode = node;
        if (anyNode[name] == null) {
            return false;
        }
        if (operator === "equal") {
            return anyNode[name] === value;
        }
        else if (operator === "not-equal") {
            return anyNode[name] !== value;
        }
        else if (operator === "starts-with") {
            return anyNode[name].toString().startsWith(value);
        }
        else if (operator === "ends-with") {
            return anyNode[name].toString().endsWith(value);
        }
        else if (operator === "contains") {
            return anyNode[name].toString().includes(value);
        }
        else if (operator === "greater-than-or-equal") {
            return anyNode[name] >= value;
        }
        else if (operator === "less-than-or-equal") {
            return anyNode[name] <= value;
        }
        else if (operator === "greater-than") {
            return anyNode[name] > value;
        }
        else if (operator === "less-than") {
            return anyNode[name] < value;
        }
        return false;
    }
    _getAttributeName(ast) {
        return ast.find(n => n.name === "attribute-name").value;
    }
    _getAttributeValue(ast) {
        let valueNode = ast.find(n => n.name === "single-quote-string-literal");
        if (valueNode != null) {
            return valueNode.value.slice(1, -1);
        }
        else {
            valueNode = ast.find(n => n.name === "value");
        }
        if (valueNode != null) {
            return valueNode.value;
        }
        else {
            valueNode = ast.find(n => n.name === "number");
        }
        return valueNode.value;
    }
    _getAttributeOperator(ast) {
        return ast.find(n => operatorMap[n.name]).name;
    }
}

class Query {
    constructor(context, prevQuery = null) {
        this._context = context;
        this._prevQuery = prevQuery;
    }
    toArray() {
        return this._context.slice();
    }
    // Modifiers
    append(visitor) {
        this._context.forEach(n => {
            const parent = n.parent;
            if (parent == null) {
                return;
            }
            const newNode = visitor(n);
            n.appendChild(newNode);
        });
        return this;
    }
    prepend(visitor) {
        this._context.forEach(n => {
            const parent = n.parent;
            if (parent == null) {
                return;
            }
            const newNode = visitor(n);
            n.insertBefore(newNode, n.children[0]);
        });
        return this;
    }
    after(visitor) {
        this._context.forEach(n => {
            const parent = n.parent;
            if (parent == null) {
                return;
            }
            const index = parent.findChildIndex(n);
            const newNode = visitor(n);
            parent.spliceChildren(index + 1, 0, newNode);
        });
        return this;
    }
    before(visitor) {
        this._context.forEach(n => {
            const parent = n.parent;
            if (parent == null) {
                return;
            }
            const index = parent.findChildIndex(n);
            const newNode = visitor(n);
            parent.spliceChildren(index, 0, newNode);
        });
        return this;
    }
    replaceWith(visitor) {
        this._context.forEach(n => {
            const newNode = visitor(n);
            n.replaceWith(newNode);
        });
        return this;
    }
    compact() {
        this._context.forEach(n => {
            n.compact();
        });
        return this;
    }
    setValue(value) {
        this.replaceWith((n) => {
            return Node.createValueNode(n.type, n.name, value);
        });
        return this;
    }
    normalize() {
        const first = this._context[0];
        if (first != null) {
            first.findRoot().normalize();
        }
    }
    remove() {
        this._context.forEach(n => {
            n.remove();
        });
        return this;
    }
    // Filters from the currently matched nodes
    slice(start, end) {
        return new Query(this._context.slice(start, end));
    }
    filter(selectorString) {
        const selector = new Selector(selectorString);
        const newContext = selector.filter(this._context);
        return new Query(newContext, this);
    }
    // Selects out of all descedants of currently matched nodes
    find(selectorString) {
        const selector = new Selector(selectorString);
        const newContext = selector.find(this._context);
        return new Query(newContext, this);
    }
    // Remove nodes from the set of matched nodes.
    not(selectorString) {
        const selector = new Selector(selectorString);
        const newContext = selector.not(this._context);
        return new Query(newContext, this);
    }
    // Select the parent of currently matched nodes
    parent() {
        const parents = this._context.map(n => n.parent);
        const result = new Set();
        parents.forEach((n) => {
            if (n != null) {
                result.add(n);
            }
        });
        return new Query(Array.from(result), this);
    }
    // Select the ancestors of currently matched nodes
    parents(selectorString) {
        const selector = new Selector(selectorString);
        const newContext = selector.parents(this._context);
        const result = new Set();
        newContext.forEach((n) => {
            if (n != null) {
                result.add(n);
            }
        });
        return new Query(Array.from(result), this);
    }
    first() {
        return new Query(this._context.slice(0, 1), this);
    }
    last() {
        return new Query(this._context.slice(-1), this);
    }
    // Pop query stack
    end() {
        if (this._prevQuery) {
            return this._prevQuery;
        }
        return this;
    }
    length() {
        return this._context.length;
    }
}

exports.AutoComplete = AutoComplete;
exports.Context = Context;
exports.Cursor = Cursor;
exports.CursorHistory = CursorHistory;
exports.Expression = Expression;
exports.Grammar = Grammar;
exports.Literal = Literal;
exports.Node = Node;
exports.Not = Not;
exports.Optional = Optional;
exports.Options = Options;
exports.ParseError = ParseError;
exports.Query = Query;
exports.Reference = Reference;
exports.Regex = Regex;
exports.Repeat = Repeat;
exports.RightAssociated = RightAssociated;
exports.Selector = Selector;
exports.Sequence = Sequence;
exports.compact = compact;
exports.generateErrorMessage = generateErrorMessage;
exports.grammar = grammar;
exports.patterns = patterns;
exports.remove = remove;
//# sourceMappingURL=index.js.map
