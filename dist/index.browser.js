(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.clarityPatternParser = {}));
})(this, (function (exports) { 'use strict';

    function defaultVisitor(node) {
        return node;
    }
    let idIndex$b = 0;
    class Node {
        get id() {
            return this._id;
        }
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
            this._id = String(idIndex$b++);
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
        find(predicate, breadthFirst = false) {
            let match = null;
            if (breadthFirst) {
                this.walkBreadthFirst(n => {
                    if (predicate(n)) {
                        match = n;
                        return false;
                    }
                });
            }
            else {
                this.walkUp(n => {
                    if (predicate(n)) {
                        match = n;
                        return false;
                    }
                });
            }
            return match;
        }
        findAll(predicate, breadthFirst = false) {
            const matches = [];
            if (breadthFirst) {
                this.walkBreadthFirst(n => {
                    if (predicate(n)) {
                        matches.push(n);
                    }
                });
            }
            else {
                this.walkUp(n => {
                    if (predicate(n)) {
                        matches.push(n);
                    }
                });
            }
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
            var _a;
            const childrenCopy = this._children.slice();
            const result = childrenCopy.every(c => c.walkUp(callback));
            return ((_a = callback(this)) !== null && _a !== void 0 ? _a : true) && result;
        }
        walkDown(callback) {
            var _a;
            const childrenCopy = this._children.slice();
            return ((_a = callback(this)) !== null && _a !== void 0 ? _a : true) && childrenCopy.every(c => c.walkDown(callback));
        }
        walkBreadthFirst(callback) {
            const queue = [this];
            while (queue.length > 0) {
                const current = queue.shift();
                if (callback(current) === false) {
                    return false;
                }
                queue.push(...current.children);
            }
            return true;
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
            const node = new Node(this._type, this._name, this._firstIndex, this._lastIndex, this._children.map((c) => c.clone()), this._value);
            return node;
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
                id: this._id,
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
            return node._type === this._type &&
                node._name === this._name &&
                node._firstIndex === this._firstIndex &&
                node._lastIndex === this._lastIndex &&
                node._value === this._value &&
                this._children.every((child, index) => child.isEqual(node._children[index]));
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
        const strUpToError = cursor.substring(0, endIndex);
        const lines = strUpToError.split("\n");
        const lastLine = lines[lines.length - 1];
        const line = lines.length;
        const column = lastLine.length;
        return `Error at line ${line}, column ${column}. Hint: ${suggestions}`;
    }
    function cleanSuggestions(suggestions) {
        return suggestions.map(s => s.trim()).filter(s => s.length > 0);
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

    function clonePatterns(patterns) {
        return patterns.map(p => p.clone());
    }

    function filterOutNull(nodes) {
        const filteredNodes = [];
        for (const node of nodes) {
            if (node !== null) {
                filteredNodes.push(node);
            }
        }
        return filteredNodes;
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
        recordMatch(pattern, node) {
            const record = {
                pattern,
                ast: node,
                error: null
            };
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
        recordErrorAt(startIndex, lastIndex, pattern) {
            const error = new ParseError(startIndex, lastIndex, pattern);
            const record = {
                pattern,
                ast: null,
                error
            };
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
    }

    const segmenter = new Intl.Segmenter("und", { granularity: "grapheme" });
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
            const index = this.getCharStartIndex(this._index);
            return this.text.slice(index, index + this._charSize[index]);
        }
        constructor(text) {
            this._text = text;
            this._length = text.length;
            this._charSize = [];
            this._charMap = [];
            this._index = 0;
            this._history = new CursorHistory();
            let index = 0;
            for (const segment of segmenter.segment(text)) {
                const size = segment.segment.length;
                for (let i = 0; i < size; i++) {
                    this._charMap.push(index);
                    this._charSize.push(size);
                }
                index += size;
            }
        }
        hasNext() {
            const index = this._charMap[this._index];
            const charSize = this._charSize[index];
            return index + charSize < this._length;
        }
        next() {
            if (this.hasNext()) {
                const index = this._charMap[this._index];
                const size = this._charSize[index];
                this.moveTo(index + size);
            }
        }
        hasPrevious() {
            var _a;
            const index = this._charMap[this._index];
            const previousIndex = (_a = this._charMap[index - 1]) !== null && _a !== void 0 ? _a : -1;
            return previousIndex >= 0;
        }
        previous() {
            var _a;
            if (this.hasPrevious()) {
                const index = this._charMap[this._index];
                const previousIndex = (_a = this._charMap[index - 1]) !== null && _a !== void 0 ? _a : -1;
                this.moveTo(previousIndex);
            }
        }
        moveTo(position) {
            if (position >= 0 && position < this._length) {
                this._index = this._charMap[position];
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
        substring(first, last) {
            return this._text.slice(first, last + 1);
        }
        recordMatch(pattern, node) {
            this._history.recordMatch(pattern, node);
        }
        recordErrorAt(startIndex, lastIndex, onPattern) {
            this._history.recordErrorAt(startIndex, lastIndex, onPattern);
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
        getCharStartIndex(index) {
            return this._charMap[index];
        }
        getCharEndIndex(index) {
            var _a;
            let startIndex = this.getCharStartIndex(index);
            return (_a = startIndex + this._charSize[startIndex]) !== null && _a !== void 0 ? _a : 1;
        }
        getCharLastIndex(index) {
            var _a;
            return (_a = this.getCharEndIndex(index) - 1) !== null && _a !== void 0 ? _a : 0;
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
            this._id = `sequence-${idIndex$a++}`;
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
            if (this._prefixNode != null && this._postfixNode != null && this._atomNode != null) {
                let firstNode = this._prefixNode;
                let secondNode = this._postfixNode;
                let firstPlaceholder = this._prefixPlaceholder;
                let secondPlaceholder = this._postfixPlaceholder;
                const prefixName = this._prefixNode.name;
                const postfixName = this._postfixNode.name;
                const prefixPrecedence = this._getPrecedence(prefixName);
                const postfixPrecedence = this._getPrecedence(postfixName);
                // The Precedence is the index of the patterns, so its lower not higher :\
                if (prefixPrecedence > postfixPrecedence) {
                    firstNode = this._postfixNode;
                    secondNode = this._prefixNode;
                    firstPlaceholder = this._postfixPlaceholder;
                    secondPlaceholder = this._prefixPlaceholder;
                }
                node = firstNode.findRoot();
                firstPlaceholder.replaceWith(this._atomNode);
                secondPlaceholder.replaceWith(node);
                node = secondNode;
            }
            else {
                if (this._prefixNode != null && this._atomNode != null) {
                    node = this._prefixNode.findRoot();
                    this._prefixPlaceholder.replaceWith(this._atomNode);
                }
                if (this._postfixNode != null && node != null) {
                    this._postfixPlaceholder.replaceWith(node);
                    node = this._postfixNode;
                }
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
        get infixPatterns() {
            return this._infixPatterns;
        }
        // @deprecated use infixPatterns instead
        get binaryPatterns() {
            return this._infixPatterns;
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
            this._cachedParent = null;
            this._firstIndex = 0;
            this._atomPatterns = [];
            this._prefixPatterns = [];
            this._prefixNames = [];
            this._postfixPatterns = [];
            this._postfixNames = [];
            this._infixPatterns = [];
            this._infixNames = [];
            this._associationMap = {};
            this._precedenceMap = {};
            this._originalPatterns = patterns;
            this._shouldStopParsing = false;
            this._hasOrganized = false;
            this._patterns = [];
            this._precedenceTree = new PrecedenceTree({}, {});
            this._atomsIdToAncestorsMap = {};
        }
        _organizePatterns(patterns) {
            const finalPatterns = [];
            patterns.forEach((pattern, index) => {
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
                    this._precedenceMap[name] = index;
                    this._prefixPatterns.push(prefix);
                    this._prefixNames.push(name);
                    finalPatterns.push(prefix);
                }
                else if (this._isPostfix(pattern)) {
                    const name = this._extractName(pattern);
                    const postfix = this._extractPostfix(pattern);
                    postfix.parent = this;
                    this._precedenceMap[name] = index;
                    this._postfixPatterns.push(postfix);
                    this._postfixNames.push(name);
                    finalPatterns.push(postfix);
                }
                else if (this._isBinary(pattern)) {
                    const name = this._extractName(pattern);
                    const infix = this._extractInfix(pattern);
                    infix.parent = this;
                    this._precedenceMap[name] = index;
                    this._infixPatterns.push(infix);
                    this._infixNames.push(name);
                    if (pattern.type === "right-associated") {
                        this._associationMap[name] = Association.right;
                    }
                    else {
                        this._associationMap[name] = Association.left;
                    }
                    finalPatterns.push(infix);
                }
            });
            this._patterns = finalPatterns;
            this._precedenceTree = new PrecedenceTree(this._precedenceMap, this._associationMap);
            return finalPatterns;
        }
        _cacheAncestors() {
            for (let atom of this._atomPatterns) {
                const id = atom.id;
                const ancestors = this._atomsIdToAncestorsMap[id] = [];
                let pattern = this.parent;
                while (pattern != null) {
                    if (pattern.id === id) {
                        ancestors.push(pattern);
                    }
                    pattern = pattern.parent;
                }
            }
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
        _extractInfix(pattern) {
            pattern = this._unwrapAssociationIfNecessary(pattern);
            const children = pattern.children.slice(1, -1);
            const infixSequence = new Sequence(`${pattern.name}-delimiter`, children);
            return infixSequence;
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
            if (!this._hasOrganized || this._cachedParent !== this.parent) {
                this._cachedParent = this.parent;
                this._hasOrganized = true;
                this._organizePatterns(this._originalPatterns);
                this._cacheAncestors();
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
                if (this._isBeyondRecursiveAllowance(pattern, onIndex)) {
                    continue;
                }
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
        _isBeyondRecursiveAllowance(atom, onIndex) {
            const ancestors = this._atomsIdToAncestorsMap[atom.id];
            return ancestors.some(a => a.startedOnIndex === onIndex);
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
            if (this.infixPatterns.length === 0) {
                this._shouldStopParsing = true;
            }
            for (let i = 0; i < this._infixPatterns.length; i++) {
                cursor.moveTo(onIndex);
                const pattern = this._infixPatterns[i];
                const name = this._infixNames[i];
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
            this.build();
            const atomTokens = this._atomPatterns.map(p => p.getTokens()).flat();
            const prefixTokens = this.prefixPatterns.map(p => p.getTokens()).flat();
            return [...prefixTokens, ...atomTokens];
        }
        getTokensAfter(childReference) {
            this.build();
            if (this._prefixPatterns.includes(childReference) || this._infixPatterns.includes(childReference)) {
                const atomTokens = this._atomPatterns.map(p => p.getTokens()).flat();
                const prefixTokens = this.prefixPatterns.map(p => p.getTokens()).flat();
                return [...prefixTokens, ...atomTokens];
            }
            if (this._atomPatterns.includes(childReference)) {
                const postfixTokens = this.postfixPatterns.map(p => p.getTokens()).flat();
                const infixTokens = this._infixPatterns.map(p => p.getTokens()).flat();
                if (this._parent != null) {
                    return [...postfixTokens, ...infixTokens, ...this._parent.getNextTokens()];
                }
                return [...postfixTokens, ...infixTokens];
            }
            if (this._infixPatterns.includes(childReference)) {
                const atomTokens = this._atomPatterns.map(p => p.getTokens()).flat();
                return atomTokens;
            }
            if (this._postfixPatterns.includes(childReference)) {
                const postfixTokens = this.postfixPatterns.map(p => p.getTokens()).flat();
                const infixTokens = this._infixPatterns.map(p => p.getTokens()).flat();
                if (this._parent != null) {
                    return [...postfixTokens, ...infixTokens, ...this._parent.getNextTokens()];
                }
                return [...postfixTokens, ...infixTokens];
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
            this.build();
            const atomPatterns = this._atomPatterns.map(p => p.getPatterns()).flat();
            const prefixPatterns = this.prefixPatterns.map(p => p.getPatterns()).flat();
            return [...prefixPatterns, ...atomPatterns];
        }
        getPatternsAfter(childReference) {
            this.build();
            if (this._prefixPatterns.includes(childReference) || this._infixPatterns.includes(childReference)) {
                const atomPatterns = this._atomPatterns.map(p => p.getPatterns()).flat();
                const prefixPatterns = this.prefixPatterns.map(p => p.getPatterns()).flat();
                return [...prefixPatterns, ...atomPatterns];
            }
            if (this._atomPatterns.includes(childReference)) {
                const postfixPatterns = this.postfixPatterns.map(p => p.getPatterns()).flat();
                const infixPatterns = this._infixPatterns.map(p => p.getPatterns()).flat();
                if (this._parent != null) {
                    return [...postfixPatterns, ...infixPatterns, ...this._parent.getNextPatterns()];
                }
                return [...postfixPatterns, ...infixPatterns];
            }
            if (this._infixPatterns.includes(childReference)) {
                const atomPatterns = this._atomPatterns.map(p => p.getPatterns()).flat();
                return atomPatterns;
            }
            if (this._postfixPatterns.includes(childReference)) {
                const postfixPatterns = this.postfixPatterns.map(p => p.getPatterns()).flat();
                const infixPatterns = this._infixPatterns.map(p => p.getPatterns()).flat();
                if (this._parent != null) {
                    return [...postfixPatterns, ...infixPatterns, ...this._parent.getNextPatterns()];
                }
                return [...postfixPatterns, ...infixPatterns];
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

    let idIndex$9 = 0;
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
            this._id = `literal-${idIndex$9++}`;
            this._type = "literal";
            this._name = name;
            this._token = value;
            this._parent = null;
            this._firstIndex = 0;
            this._lastIndex = 0;
        }
        test(text, record = false) {
            return testPattern(this, text, record);
        }
        exec(text, record = false) {
            return execPattern(this, text, record);
        }
        parse(cursor) {
            this._firstIndex = cursor.index;
            this._lastIndex = cursor.index;
            const passed = this._tryToParse(cursor);
            if (passed) {
                cursor.resolveError();
                const node = this._createNode();
                cursor.recordMatch(this, node);
                return node;
            }
            cursor.recordErrorAt(this._firstIndex, this._lastIndex, this);
            return null;
        }
        _tryToParse(cursor) {
            const token = this._token;
            const compareToToken = cursor.text.slice(this._firstIndex, this._firstIndex + this._token.length);
            const length = Math.min(token.length, compareToToken.length);
            for (let i = 0; i < length; i++) {
                if (token[i] !== compareToToken[i]) {
                    this._lastIndex = this._firstIndex + i;
                    cursor.moveTo(this._lastIndex);
                    return false;
                }
            }
            if (token != compareToToken) {
                this._lastIndex = this._firstIndex + compareToToken.length - 1;
                cursor.moveTo(this._lastIndex);
                return false;
            }
            this._lastIndex = this._firstIndex + this._token.length - 1;
            cursor.moveTo(this._lastIndex);
            return true;
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

    let idIndex$8 = 0;
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
            this._id = `not-${idIndex$8++}`;
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

    let idIndex$7 = 0;
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
            this._id = `optional-${idIndex$7++}`;
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

    let idIndex$6 = 0;
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
            this._id = `options-${idIndex$6++}`;
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

    let idIndex$5 = 0;
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
            this._id = `reference-${idIndex$5++}`;
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
                    if (depth > 1) {
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

    let idIndex$4 = 0;
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
            this._id = `regex-${idIndex$4++}`;
            this._type = "regex";
            this._name = name;
            this._parent = null;
            this._originalRegexString = regex;
            this._regex = new RegExp(`^${regex}`, "gu");
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
            this._firstIndex = cursor.index;
            this.resetState(cursor);
            this.tryToParse(cursor);
            return this._node;
        }
        resetState(cursor) {
            this._cursor = cursor;
            this._regex.lastIndex = 0;
            this._substring = this._cursor.text.slice(this._cursor.index);
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
            const match = result[0];
            const lastIndex = cursor.getCharLastIndex(currentIndex + match.length - 1);
            this._node = new Node("regex", this._name, currentIndex, lastIndex, undefined, result[0]);
            cursor.moveTo(lastIndex);
            cursor.recordMatch(this, this._node);
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

    let idIndex$3 = 0;
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
            this._id = `finite-repeat-${idIndex$3++}`;
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
            const endedOnDivider = this._hasDivider && nodes.length % modulo === 0;
            if (this._trimDivider && endedOnDivider) {
                const node = nodes.pop();
                cursor.moveTo(node.firstIndex);
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

    let idIndex$2 = 0;
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
            this._id = `infinite-repeat-${idIndex$2++}`;
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
            this._patterns = [];
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
            this._patterns = [];
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
                        this._patterns.push(this._pattern);
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
                                this._patterns.push(this._divider);
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
            const hasDivider = this._divider != null;
            const lastPattern = this._patterns[this._patterns.length - 1];
            if (hasDivider &&
                this._trimDivider &&
                lastPattern === this._divider) {
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

    let idIndex$1 = 0;
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
            this._id = `repeat-${idIndex$1++}`;
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
        exec(text, record = false) {
            return this._repeatPattern.exec(text, record);
        }
        test(text, record = false) {
            return this._repeatPattern.test(text, record);
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
        }
        parse(cursor) {
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
                const value = cursor.substring(this.startedOnIndex, cursorIndex - 1);
                const node = Node.createValueNode(this._type, this._name, value);
                cursor.recordMatch(this, node);
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

    const syntax = new Literal("syntax", "syntax");
    const imprt = new Literal("import", "import");
    const useParams = new Literal("useParams", "use params");
    const withParams = new Literal("withParams", "with params");
    const from = new Literal("from", "from");
    const right = new Literal("right", "right");
    const ws = new Regex("ws", "\\s+");
    const ls = new Regex("ls", "[ \\t]+");
    const assign = new Literal("assign", "=");
    const bar = new Literal("|", "|");
    const greedyBar = new Literal("<|>", "<|>");
    const concat = new Literal("+", "+");
    const colon = new Literal(":", ":");
    const openParen = new Literal("(", "(");
    const closeParen = new Literal(")", ")");
    const openSquareBracket = new Literal("[", "[");
    const closeSquareBracket = new Literal("]", "]");
    const openBracket = new Literal("{", "{");
    const closeBracket = new Literal("}", "}");
    const comma = new Regex(",", "\\s*[,]\\s*");
    const trim = new Literal("trim", "trim");
    const not = new Literal("not", "!");
    const optional = new Literal("?", "?");
    const anyChar = new Literal("anyChar", "?");
    const upTo = new Literal("upTo", "->");
    const wall = new Literal("wall", "|");
    const asKeyword = new Literal("as", "as");
    const newLine = new Regex("newLine", "\\s*(\\r\\n|\\r|\\n)\\s*");
    const syntaxVersion = new Regex("syntaxVersion", "\\S*");
    const at = new Literal("@", "@");
    const optionalWS = new Optional("optionalWS", ws);
    const optionalLS = new Optional("optionalLS", ls);
    const literal = new Regex("literal", '"(?:\\\\.|[^"\\\\])*"');
    const regex = new Regex("regex", "\\/(?:\\\\.|[^\\/\\n\\r])*\\/");
    const integer = new Regex("integer", "[1-9][0-9]*|[0]");
    const name = new Regex("name", "[a-zA-Z_-]+[a-zA-Z0-9_-]*");
    const patternName = name.clone("patternName");
    const patternIdentifier = name.clone("patternIdentifier");
    const resource = literal.clone("resource");
    const comment = new Regex("comment", "#[^\\n\\r]*");
    const jsonString = literal.clone("jsonString");
    const jsonNumber = new Regex("jsonNumber", "-?\\d+(\\.\\d+)?");
    const trueLiteral = new Literal("trueLiteral", "true");
    const falseLiteral = new Literal("falseLiteral", "false");
    const jsonBoolean = new Options("jsonBoolean", [trueLiteral, falseLiteral]);
    const jsonNull = new Literal("jsonNull", "null");
    const jsonArrayItems = new Repeat("jsonArrayItems", new Reference("jsonValue"), { divider: comma, trimDivider: true });
    const jsonArray = new Sequence("jsonArray", [openSquareBracket, optionalWS, jsonArrayItems, optionalWS, closeSquareBracket]);
    const jsonObjectPropertyName = literal.clone("jsonObjectPropertyName");
    const jsonObjectProperty = new Sequence("jsonObjectProperty", [jsonObjectPropertyName, optionalWS, colon, optionalWS, new Reference("jsonValue")]);
    const jsonObjectProperties = new Repeat("jsonObjectProperties", jsonObjectProperty, { divider: comma, trimDivider: true });
    const jsonObject = new Sequence("jsonObject", [openBracket, optionalWS, new Optional("optionalJsonObjectProperties", jsonObjectProperties), optionalWS, closeBracket]);
    const jsonValue = new Options("jsonValue", [jsonString, jsonNumber, jsonBoolean, jsonNull, jsonArray, jsonObject]);
    const syntaxStatement = new Sequence("syntaxStatement", [syntax, optionalWS, syntaxVersion]);
    const decorationName = name.clone("decorationName");
    const methodDecorationStatement = new Sequence("methodDecorationStatement", [at, optionalWS, decorationName, optionalWS, openParen, optionalWS, new Optional("optionalJsonValue", jsonValue), optionalWS, closeParen]);
    const nameDecorationStatement = new Sequence("nameDecorationStatement", [at, optionalWS, decorationName]);
    const decorationStatement = new Options("decorationStatement", [methodDecorationStatement, nameDecorationStatement]);
    const defaultParamName = name.clone("defaultParamName");
    const paramDefault = new Sequence("paramDefault", [optionalLS, assign, optionalLS, defaultParamName]);
    const paramNameWithDefault = new Sequence("paramNameWithDefault", [patternName, new Optional("optionalParamDefault", paramDefault)]);
    const useParamPatterns = new Repeat("useParamPatterns", paramNameWithDefault, { divider: comma, trimDivider: true });
    const useParamsStatement = new Sequence("useParamsStatement", [useParams, optionalLS, openBracket, optionalWS, useParamPatterns, optionalWS, closeBracket]);
    const withParamExportPattern = patternName.clone("withParamExportPattern");
    const withParamStatement = new Options("withParamStatement", [new Reference("patternAssignment"), withParamExportPattern]);
    const withParamStatements = new Repeat("withParamStatements", withParamStatement, { divider: newLine, trimDivider: true });
    const withParamsExpr = new Sequence("withParamsExpr", [withParams, optionalLS, openBracket, optionalWS, withParamStatements, optionalWS, closeBracket]);
    const importNameAlias = name.clone("importNameAlias");
    const importAlias = new Sequence("importAlias", [patternName, ls, asKeyword, ls, importNameAlias]);
    const importNameOrAlias = new Options("importNameOrAlias", [importAlias, patternName]);
    const patternNames = new Repeat("patternNames", importNameOrAlias, { divider: comma, trimDivider: true });
    const importedPatterns = new Sequence("importedPatterns", [openBracket, optionalWS, patternNames, optionalWS, closeBracket]);
    const importStatement = new Sequence("importStatement", [imprt, optionalLS, importedPatterns, optionalLS, from, optionalLS, resource, optionalLS, new Optional("optionalWithParamsExpr", withParamsExpr)]);
    const repeatBounds = new Sequence("repeatBounds", [openBracket, optionalWS, new Optional("optionalInteger", integer), optionalWS, new Optional("optionalComma", comma), optionalWS, new Optional("optionalInteger", integer), optionalWS, closeBracket]);
    const oneOrMore = new Literal("oneOrMore", "+");
    const zeroOrMore = new Literal("zeroOrMore", "*");
    const repeatOptions = new Options("repeatOptions", [oneOrMore, zeroOrMore, repeatBounds]);
    const delimiter = new Sequence("delimiter", [comma, new Reference("patternExpr"), optionalWS, new Optional("optionalTrim", trim)]);
    const repeatExpr = new Sequence("repeatExpr", [openParen, optionalWS, new Reference("patternExpr"), optionalWS, new Optional("optionalDelimiter", delimiter), optionalWS, closeParen, repeatOptions]);
    const takeUntilExpr = new Sequence("takeUntilExpr", [anyChar, optionalLS, upTo, optionalLS, wall, optionalLS, new Reference("patternExpr")]);
    const sequenceExpr = new Sequence("sequenceExpr", [new Reference("patternExpr"), optionalWS, concat, optionalWS, new Reference("patternExpr")]);
    const optionsExpr = new Sequence("optionsExpr", [new Reference("patternExpr"), optionalWS, bar, optionalWS, new Reference("patternExpr")]);
    const greedyOptionsExpr = new Sequence("greedyOptionsExpr", [new Reference("patternExpr"), optionalWS, greedyBar, optionalWS, new Reference("patternExpr")]);
    const patternGroupExpr = new Sequence("patternGroupExpr", [openParen, optionalWS, new Reference("patternExpr"), optionalWS, closeParen]);
    const notExpr = new Sequence("notExpr", [not, optionalLS, new Reference("patternExpr")]);
    const optionalExpr = new Sequence("optionalExpr", [new Reference("patternExpr"), optionalLS, optional]);
    const rightAssociationExpr = new Sequence("rightAssociationExpr", [new Reference("patternExpr"), optionalLS, right]);
    const exportPattern = patternName.clone("exportPattern");
    const patternExpr = new Expression("patternExpr", [notExpr, optionalExpr, rightAssociationExpr, sequenceExpr, optionsExpr, greedyOptionsExpr, repeatExpr, patternGroupExpr, takeUntilExpr, literal, regex, patternIdentifier]);
    const patternAssignment = new Sequence("patternAssignment", [patternName, optionalWS, assign, optionalWS, patternExpr]);
    const statement = new Options("statement", [useParamsStatement, importStatement, patternAssignment, decorationStatement, exportPattern, comment]);
    const statements = new Repeat("statements", statement, { divider: newLine });
    const cpat = new Sequence("cpat", [optionalWS, new Optional("optionalSyntaxStatement", syntaxStatement), optionalWS, new Optional("optionalStatements", statements), optionalWS]);
    const grammar = cpat;

    let anonymousIndexId = 0;
    function defaultImportResolver(_path, _basePath) {
        throw new Error("No import resolver supplied.");
    }
    function defaultImportResolverSync(_path, _basePath) {
        throw new Error("No import resolver supplied.");
    }
    const defaultDecorators = {
        tokens: tokens
    };
    // Node names that are operators/whitespace and should be filtered during building
    const skipNodes = {
        "+": true,
        "|": true,
        "<|>": true,
        "optionalWS": true,
        "optionalLS": true,
        "ws": true,
        "ls": true,
    };
    class ParseContext {
        constructor(params, decorators = {}) {
            this.patternsByName = new Map();
            this.importedPatternsByName = new Map();
            this.paramsByName = new Map();
            params.forEach(p => this.paramsByName.set(p.name, p));
            this.decorators = Object.assign(Object.assign({}, decorators), defaultDecorators);
        }
        getImportedPatterns() {
            return Array.from(this.importedPatternsByName.values());
        }
        getParams() {
            return Array.from(this.paramsByName.values());
        }
    }
    class Grammar {
        constructor(options = {}) {
            this._options = options;
            this._params = options.params || [];
            this._originResource = options.originResource || null;
            this._parseContext = new ParseContext(this._params, options.decorators || {});
            this._resolveImport = options.resolveImport == null ? defaultImportResolver : options.resolveImport;
            this._resolveImportSync = options.resolveImportSync == null ? defaultImportResolverSync : options.resolveImportSync;
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
            this._resolveImportsSync(ast);
            this._buildPatterns(ast);
            return this._buildPatternRecord();
        }
        // --- Static convenience methods ---
        static parse(expression, options) {
            const g = new Grammar(options);
            return g.parse(expression);
        }
        static import(path, options) {
            const g = new Grammar(options);
            return g.import(path);
        }
        static parseString(expression, options) {
            const g = new Grammar(options);
            return g.parseString(expression);
        }
        // --- Parsing ---
        _tryToParse(cpat) {
            const { ast, cursor } = grammar.exec(cpat, true);
            if (ast == null) {
                const message = generateErrorMessage(grammar, cursor);
                throw new Error(`[Invalid Grammar] ${message}`);
            }
            return ast;
        }
        // --- Expression Flattening (Phase 2) ---
        _flattenExpressionsRecursive(node) {
            // Process children first (bottom-up)
            for (const child of node.children) {
                this._flattenExpressionsRecursive(child);
            }
            switch (node.name) {
                case "sequenceExpr":
                case "optionsExpr":
                case "greedyOptionsExpr":
                    this._unwrapNode(node.name, node);
                    break;
            }
        }
        _unwrapNode(type, node) {
            for (let x = 0; x < node.children.length; x++) {
                const child = node.children[x];
                if (child.name === type) {
                    node.spliceChildren(x, 1, ...child.children);
                    x--;
                }
            }
        }
        // --- Pattern Record ---
        _buildPatternRecord() {
            const patterns = {};
            const allPatterns = Array.from(this._parseContext.patternsByName.values());
            this._parseContext.patternsByName.forEach((p, name) => {
                patterns[name] = new Context(name, p, allPatterns.filter(o => o !== p));
            });
            return patterns;
        }
        // --- Pattern Building (Phase 3) ---
        _buildPatterns(ast) {
            const statementsNode = ast.find(n => n.name === "statements");
            if (statementsNode == null) {
                return;
            }
            const allStatements = statementsNode.children;
            // First pass: build pattern assignments
            for (let i = 0; i < allStatements.length; i++) {
                const statementNode = allStatements[i];
                if (statementNode.name === "patternAssignment") {
                    const nameNode = statementNode.find(n => n.name === "patternName");
                    const name = nameNode.value;
                    // Find the pattern expression (the RHS of the assignment)
                    const patternExprNode = statementNode.children.find(n => n.name !== "patternName" && !skipNodes[n.name] && n.name !== "assign");
                    if (patternExprNode == null) {
                        continue;
                    }
                    // Flatten nested binary expressions
                    this._flattenExpressionsRecursive(patternExprNode);
                    let pattern = this._buildPattern(name, patternExprNode);
                    // For alias assignments (RHS is just a patternIdentifier), rename to the assignment name
                    if (patternExprNode.name === "patternIdentifier" && pattern.name !== name) {
                        pattern = pattern.clone(name);
                    }
                    this._applyDecorators(i, allStatements, pattern);
                    this._parseContext.patternsByName.set(name, pattern);
                }
                else if (statementNode.name === "exportPattern") {
                    const exportName = statementNode.value;
                    const pattern = this._getPattern(exportName).clone();
                    this._parseContext.patternsByName.set(exportName, pattern);
                }
            }
        }
        _buildPattern(name, node) {
            switch (node.name) {
                case "literal": {
                    // Use the literal's content as the name when in anonymous position
                    const litName = name.startsWith("anonymous-pattern-") ? this._resolveStringValue(node.value) : name;
                    return this._buildLiteral(litName, node);
                }
                case "regex": {
                    // Use the regex's content as the name when in anonymous position
                    const regName = name.startsWith("anonymous-pattern-") ? node.value.slice(1, -1) : name;
                    return this._buildRegex(regName, node);
                }
                case "sequenceExpr":
                    return this._buildSequence(name, node);
                case "optionsExpr":
                    return this._buildOptions(name, node);
                case "greedyOptionsExpr":
                    return this._buildGreedyOptions(name, node);
                case "repeatExpr":
                    return this._buildRepeat(name, node);
                case "patternGroupExpr":
                    return this._buildPatternGroup(name, node);
                case "notExpr":
                    return this._buildNot(name, node);
                case "optionalExpr":
                    return this._buildOptional(name, node);
                case "rightAssociationExpr":
                    return this._buildRightAssociation(node);
                case "patternIdentifier": {
                    // Use the pattern's own name for references (important for Expression recursion detection)
                    // The caller (_buildPatterns) renames for alias assignments
                    return this._getPattern(node.value).clone();
                }
                case "takeUntilExpr":
                    return this._buildTakeUntil(name, node);
            }
            throw new Error(`Couldn't build node: ${node.name}.`);
        }
        _buildLiteral(name, node) {
            return new Literal(name, this._resolveStringValue(node.value));
        }
        _buildRegex(name, node) {
            const value = node.value.slice(1, node.value.length - 1);
            return new Regex(name, value);
        }
        _buildSequence(name, node) {
            const patternChildren = node.children.filter(n => !skipNodes[n.name]);
            const patterns = patternChildren.map(n => this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, n));
            return new Sequence(name, patterns);
        }
        _buildOptions(name, node) {
            const patternChildren = node.children.filter(n => !skipNodes[n.name]);
            const patterns = patternChildren.map(n => {
                return this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, n);
            });
            const hasRecursivePattern = patterns.some(p => this._isRecursive(name, p));
            if (hasRecursivePattern) {
                try {
                    return new Expression(name, patterns);
                }
                catch (_a) { }
            }
            return new Options(name, patterns);
        }
        _buildGreedyOptions(name, node) {
            const patternChildren = node.children.filter(n => !skipNodes[n.name]);
            const patterns = patternChildren.map(n => this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, n));
            return new Options(name, patterns, true);
        }
        _buildRepeat(name, node) {
            let isOptional = false;
            // Find the main pattern (first non-structural child inside parens)
            const patternNode = node.children.find(n => !skipNodes[n.name] && n.name !== "(" && n.name !== ")" &&
                n.name !== "repeatOptions" && n.name !== "optionalDelimiter" &&
                n.name !== "delimiter" && n.name !== "oneOrMore" &&
                n.name !== "zeroOrMore" && n.name !== "repeatBounds");
            if (patternNode == null) {
                throw new Error(`Repeat pattern missing inner pattern.`);
            }
            const pattern = this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, patternNode);
            const options = {
                min: 1,
                max: Infinity
            };
            // Handle delimiter
            const delimiterNode = node.find(n => n.name === "delimiter");
            if (delimiterNode != null) {
                const delimPatternNode = delimiterNode.children.find(n => !skipNodes[n.name] && n.name !== "," && n.name !== "optionalTrim" && n.name !== "trim");
                if (delimPatternNode != null) {
                    options.divider = this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, delimPatternNode);
                }
                const trimFlag = delimiterNode.find(n => n.name === "trim");
                if (trimFlag != null) {
                    options.trimDivider = true;
                }
            }
            // Handle quantifier / bounds
            const repeatOptionsNode = node.find(n => n.name === "oneOrMore" || n.name === "zeroOrMore" || n.name === "repeatBounds");
            if (repeatOptionsNode != null) {
                if (repeatOptionsNode.name === "oneOrMore") {
                    options.min = 1;
                    options.max = Infinity;
                }
                else if (repeatOptionsNode.name === "zeroOrMore") {
                    isOptional = true;
                    options.min = 0;
                    options.max = Infinity;
                }
                else if (repeatOptionsNode.name === "repeatBounds") {
                    const integers = repeatOptionsNode.findAll(n => n.name === "integer");
                    const hasComma = repeatOptionsNode.find(n => n.name === ",") != null;
                    if (integers.length === 2) {
                        // {min, max}
                        options.min = Number(integers[0].value);
                        options.max = Number(integers[1].value);
                    }
                    else if (integers.length === 1 && hasComma) {
                        // Check position to determine {min,} or {,max}
                        const commaNode = repeatOptionsNode.find(n => n.name === ",");
                        const intNode = integers[0];
                        if (intNode.startIndex < commaNode.startIndex) {
                            // {min,}
                            options.min = Number(intNode.value);
                            options.max = Infinity;
                        }
                        else {
                            // {,max}
                            options.min = 0;
                            options.max = Number(intNode.value);
                        }
                    }
                    else if (integers.length === 1 && !hasComma) {
                        // {exact}
                        const count = Number(integers[0].value);
                        options.min = count;
                        options.max = count;
                    }
                }
            }
            if (isOptional) {
                return new Optional(name, new Repeat(`inner-optional-${name}`, pattern, options));
            }
            return new Repeat(name, pattern, options);
        }
        _buildPatternGroup(_name, node) {
            const innerNode = node.children.find(n => !skipNodes[n.name] && n.name !== "(" && n.name !== ")");
            if (innerNode == null) {
                throw new Error("Empty pattern group.");
            }
            return this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, innerNode);
        }
        _buildNot(_name, node) {
            const innerNode = node.children.find(n => !skipNodes[n.name] && n.name !== "not");
            if (innerNode == null) {
                throw new Error("Not pattern missing inner pattern.");
            }
            const inner = this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, innerNode);
            return new Not(`not-${inner.name}`, inner);
        }
        _buildOptional(_name, node) {
            const innerNode = node.children.find(n => !skipNodes[n.name] && n.name !== "?");
            if (innerNode == null) {
                throw new Error("Optional pattern missing inner pattern.");
            }
            const inner = this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, innerNode);
            return new Optional(`optional-${inner.name}`, inner);
        }
        _buildRightAssociation(node) {
            const innerNode = node.children.find(n => !skipNodes[n.name] && n.name !== "right");
            if (innerNode == null) {
                throw new Error("RightAssociation pattern missing inner pattern.");
            }
            return new RightAssociated(this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, innerNode));
        }
        _buildTakeUntil(name, node) {
            // The last meaningful child is the until pattern
            const patternChildren = node.children.filter(n => !skipNodes[n.name] && n.name !== "anyChar" && n.name !== "upTo" && n.name !== "wall");
            const untilPatternNode = patternChildren[patternChildren.length - 1];
            if (untilPatternNode == null) {
                throw new Error("TakeUntil pattern missing terminator pattern.");
            }
            const untilPattern = this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, untilPatternNode);
            return new TakeUntil(name, untilPattern);
        }
        // --- Helpers ---
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
                (firstChild.name === name || lastChild.name === name);
        }
        // --- Decorators ---
        _applyDecorators(statementIndex, allStatements, pattern) {
            const decorators = this._parseContext.decorators;
            let decoratorNodes = [];
            // Walk backwards from the statement to find preceding decorator statements
            // Note: statements Repeat includes newLine divider nodes between statements
            for (let i = statementIndex - 1; i >= 0; i--) {
                const prev = allStatements[i];
                if (prev.name === "decorationStatement" || prev.name === "methodDecorationStatement" || prev.name === "nameDecorationStatement") {
                    decoratorNodes.push(prev);
                }
                else if (prev.name === "comment" || prev.name === "newLine") {
                    // Comments and newline dividers can appear between decorators and the statement
                    continue;
                }
                else {
                    break;
                }
            }
            for (const d of decoratorNodes) {
                const actualDecorator = d.name === "decorationStatement" ? d.children[0] : d;
                const nameNode = actualDecorator.find(n => n.name === "decorationName");
                if (nameNode == null || decorators[nameNode.value] == null) {
                    continue;
                }
                if (actualDecorator.name === "nameDecorationStatement") {
                    decorators[nameNode.value](pattern);
                }
                else if (actualDecorator.name === "methodDecorationStatement") {
                    const jsonValueNode = actualDecorator.find(n => n.name === "jsonArray" || n.name === "jsonObject" || n.name === "jsonString" || n.name === "jsonNumber" || n.name === "jsonBoolean" || n.name === "jsonNull");
                    if (jsonValueNode == null) {
                        decorators[nameNode.value](pattern);
                    }
                    else {
                        decorators[nameNode.value](pattern, JSON.parse(jsonValueNode.value));
                    }
                }
            }
        }
        // --- Import Handling ---
        _resolveImports(ast) {
            return __awaiter(this, void 0, void 0, function* () {
                const importStatements = ast.findAll(n => {
                    return n.name === "importStatement" || n.name === "useParamsStatement";
                });
                for (const statement of importStatements) {
                    if (statement.name === "importStatement") {
                        yield this._processImport(statement);
                    }
                    else {
                        this._processUseParams(statement);
                    }
                }
            });
        }
        _resolveImportsSync(ast) {
            const importStatements = ast.findAll(n => {
                return n.name === "importStatement" || n.name === "useParamsStatement";
            });
            for (const statement of importStatements) {
                if (statement.name === "importStatement") {
                    this._processImportSync(statement);
                }
                else {
                    this._processUseParams(statement);
                }
            }
        }
        _processImportSync(importStatement) {
            const parseContext = this._parseContext;
            const resourceNode = importStatement.find(n => n.name === "resource");
            if (resourceNode == null) {
                throw new Error("Invalid import statement: resource is required");
            }
            const params = this._getWithParams(importStatement);
            const resource = resourceNode.value.slice(1, -1);
            const grammarFile = this._resolveImportSync(resource, this._originResource || null);
            const g = new Grammar({
                resolveImport: this._resolveImport,
                resolveImportSync: this._resolveImportSync,
                originResource: grammarFile.resource,
                params,
                decorators: this._parseContext.decorators
            });
            try {
                const patterns = g.parseString(grammarFile.expression);
                this._processImportNames(importStatement, patterns, parseContext, resource);
            }
            catch (e) {
                throw new Error(`Failed loading expression from: "${resource}". Error details: "${e.message}"`);
            }
        }
        _processImport(importStatement) {
            return __awaiter(this, void 0, void 0, function* () {
                const parseContext = this._parseContext;
                const resourceNode = importStatement.find(n => n.name === "resource");
                if (resourceNode == null) {
                    throw new Error("Invalid import statement: resource is required");
                }
                const params = this._getWithParams(importStatement);
                const resource = resourceNode.value.slice(1, -1);
                const grammarFile = yield this._resolveImport(resource, this._originResource || null);
                const g = new Grammar({
                    resolveImport: this._resolveImport,
                    originResource: grammarFile.resource,
                    params,
                    decorators: this._parseContext.decorators
                });
                try {
                    const patterns = yield g.parse(grammarFile.expression);
                    this._processImportNames(importStatement, patterns, parseContext, resource);
                }
                catch (e) {
                    throw new Error(`Failed loading expression from: "${resource}". Error details: "${e.message}"`);
                }
            });
        }
        _processImportNames(importStatement, patterns, parseContext, resource) {
            // Find all imported names (could be aliases or plain names)
            const importedPatternsNode = importStatement.find(n => n.name === "importedPatterns");
            if (importedPatternsNode == null)
                return;
            const patternNamesNode = importedPatternsNode.find(n => n.name === "patternNames");
            if (patternNamesNode == null)
                return;
            for (const child of patternNamesNode.children) {
                if (child.name === "importAlias") {
                    const nameNode = child.find(n => n.name === "patternName");
                    const aliasNode = child.find(n => n.name === "importNameAlias");
                    const importName = nameNode.value;
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
                else if (child.name === "patternName") {
                    const importName = child.value;
                    if (parseContext.importedPatternsByName.has(importName)) {
                        throw new Error(`'${importName}' was already used within another import.`);
                    }
                    const pattern = patterns[importName];
                    if (pattern == null) {
                        throw new Error(`Couldn't find pattern with name: ${importName}, from import: ${resource}.`);
                    }
                    parseContext.importedPatternsByName.set(importName, pattern);
                }
                // Skip comma divider nodes
            }
        }
        _getWithParams(importStatement) {
            let params = [];
            const withParamsNode = importStatement.find(n => n.name === "withParamsExpr");
            if (withParamsNode != null) {
                const statementsNode = withParamsNode.find(n => n.name === "withParamStatements");
                if (statementsNode != null) {
                    const expression = statementsNode.value;
                    const importedValues = this._parseContext.getImportedPatterns();
                    const g = new Grammar({
                        params: [...importedValues, ...this._parseContext.paramsByName.values()],
                        originResource: this._originResource,
                        resolveImport: this._resolveImport,
                        resolveImportSync: this._resolveImportSync,
                        decorators: this._parseContext.decorators
                    });
                    const patterns = g.parseString(expression);
                    params = Array.from(Object.values(patterns));
                }
            }
            return params;
        }
        _processUseParams(useParamsStatement) {
            const patternsNode = useParamsStatement.find(n => n.name === "useParamPatterns");
            if (patternsNode == null) {
                return;
            }
            // Each child is a paramNameWithDefault: patternName + optionalParamDefault
            const paramNodes = patternsNode.findAll(n => n.name === "paramNameWithDefault");
            for (const paramNode of paramNodes) {
                const nameNode = paramNode.find(n => n.name === "patternName");
                if (nameNode == null)
                    continue;
                const name = nameNode.value;
                // If already provided via params option, skip
                if (this._parseContext.paramsByName.has(name)) {
                    continue;
                }
                // Check for default value: use params { value = default-value }
                const defaultNode = paramNode.find(n => n.name === "defaultParamName");
                if (defaultNode != null) {
                    const defaultName = defaultNode.value;
                    let pattern = this._parseContext.importedPatternsByName.get(defaultName);
                    if (pattern == null) {
                        pattern = new Reference(defaultName);
                    }
                    this._parseContext.importedPatternsByName.set(name, pattern);
                }
            }
        }
    }

    const defaultOptions = { greedyPatternNames: [], customTokens: {} };
    class AutoComplete {
        constructor(pattern, options = defaultOptions) {
            this._pattern = pattern;
            this._options = options;
            this._text = "";
        }
        suggestFor(text) {
            return this.suggestForWithCursor(new Cursor(text));
        }
        suggestForWithCursor(cursor) {
            cursor.moveTo(0);
            this._cursor = cursor;
            this._text = cursor.text;
            this._cursor.startRecording();
            if (cursor.length === 0) {
                const suggestion = {
                    isComplete: false,
                    options: this._createSuggestionOptionsFromMatch(),
                    error: new ParseError(0, 0, this._pattern),
                    errorAtIndex: 0,
                    cursor,
                    ast: null
                };
                return suggestion;
            }
            let errorAtIndex = null;
            let error = null;
            const ast = this._pattern.parse(this._cursor);
            const isComplete = (ast === null || ast === void 0 ? void 0 : ast.value) === this._text;
            const options = this._getAllSuggestionsOptions();
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
                if (furthestMatch.endIndex > furthestError.lastIndex) {
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
        _getAllSuggestionsOptions() {
            const errorMatchOptions = this._createSuggestionOptionsFromErrors();
            const leafMatchOptions = this._cursor.leafMatches.map((m) => this._createSuggestionOptionsFromMatch(m)).flat();
            const finalResults = [];
            [...leafMatchOptions, ...errorMatchOptions].forEach(m => {
                const index = finalResults.findIndex(f => m.text === f.text);
                if (index === -1) {
                    finalResults.push(m);
                }
            });
            return getFurthestOptions(finalResults);
        }
        _createSuggestionOptionsFromErrors() {
            // These errored because the length of the string.
            const errors = this._cursor.errors.filter(e => e.lastIndex === this._cursor.length - 1);
            const errorSuggestionOptions = errors.map(parseError => {
                const currentText = this._cursor.substring(parseError.startIndex, parseError.lastIndex);
                const compositeSuggestions = this._getCompositeSuggestionsForPattern(parseError.pattern);
                const trimmedErrorCompositeSuggestions = this._trimSuggestionsByExistingText(currentText, compositeSuggestions);
                return this._createSuggestions(parseError.lastIndex, trimmedErrorCompositeSuggestions);
            }).flat();
            const dedupedErrorSuggestionOptions = this._deDupeCompositeSuggestions(errorSuggestionOptions);
            return dedupedErrorSuggestionOptions;
        }
        _createSuggestionOptionsFromMatch(match) {
            if ((match === null || match === void 0 ? void 0 : match.pattern) == null) {
                const compositeSuggestions = this._getCompositeSuggestionsForPattern(this._pattern);
                return this._createSuggestions(-1, compositeSuggestions);
            }
            if ((match === null || match === void 0 ? void 0 : match.node) != null) {
                const currentText = this._text.slice(match.node.startIndex, match.node.endIndex);
                /**Captures suggestions for a "completed" match pattern that still has existing possible suggestions.
                 * particularly relevant when working with set/custom tokens.
                */
                const matchCompositeSuggestions = this._getCompositeSuggestionsForPattern(match.pattern);
                const trimmedMatchCompositeSuggestions = this._trimSuggestionsByExistingText(currentText, matchCompositeSuggestions);
                const leafPatterns = match.pattern.getNextPatterns();
                const leafCompositeSuggestions = leafPatterns.flatMap(leafPattern => this._getCompositeSuggestionsForPattern(leafPattern));
                const allCompositeSuggestions = [...leafCompositeSuggestions, ...trimmedMatchCompositeSuggestions,];
                const dedupedCompositeSuggestions = this._deDupeCompositeSuggestions(allCompositeSuggestions);
                return this._createSuggestions(match.node.lastIndex, dedupedCompositeSuggestions);
            }
            else {
                return [];
            }
        }
        /**
         * Compares suggestions with provided text and removes completed sub-sequences and preceding text
         * - IE. **currentText:** *abc*, **sequence:** *[{ab}{cd}{ef}*
         *   - refines to {d}{ef}
         */
        _trimSuggestionsByExistingText(currentText, compositeSuggestions) {
            const trimmedSuggestions = compositeSuggestions.reduce((acc, compositeSuggestion) => {
                if (compositeSuggestion.text.startsWith(currentText)) {
                    const filteredSegments = this._filterCompletedSubSegments(currentText, compositeSuggestion);
                    const slicedSuggestionText = compositeSuggestion.text.slice(currentText.length);
                    if (slicedSuggestionText !== '') {
                        const refinedCompositeSuggestion = {
                            text: slicedSuggestionText,
                            suggestionSequence: filteredSegments,
                        };
                        acc.push(refinedCompositeSuggestion);
                    }
                }
                return acc;
            }, []);
            return trimmedSuggestions;
        }
        /** Removed segments already accounted for in the existing text.
       * ie. sequence pattern segments ≈ [{look}, {an example}, {phrase}]
       * fullText = "look an"
       * remove {look} segment as its already been completed by the existing text.
      */
        _filterCompletedSubSegments(currentText, compositeSuggestion) {
            let elementsToRemove = [];
            let workingText = currentText;
            compositeSuggestion.suggestionSequence.forEach(segment => {
                /**sub segment has been completed, remove it from the sequence */
                if (workingText.startsWith(segment.text)) {
                    workingText = workingText.slice(segment.text.length);
                    elementsToRemove.push(segment);
                }
            });
            const filteredSegments = compositeSuggestion.suggestionSequence.filter(segment => !elementsToRemove.includes(segment));
            return filteredSegments;
        }
        _getCompositeSuggestionsForPattern(pattern) {
            const suggestionsToReturn = [];
            const leafPatterns = pattern.getPatterns();
            // for when pattern has no leafPatterns and only returns itself
            if (leafPatterns.length === 1 && leafPatterns[0].id === pattern.id) {
                const currentCustomTokens = this._getCustomTokens(pattern);
                const currentTokens = pattern.getTokens();
                const allTokens = [...currentCustomTokens, ...currentTokens];
                const leafCompositeSuggestions = allTokens.map(token => {
                    const segment = {
                        text: token,
                        pattern: pattern,
                    };
                    const compositeSuggestion = {
                        text: token,
                        suggestionSequence: [segment],
                    };
                    return compositeSuggestion;
                });
                suggestionsToReturn.push(...leafCompositeSuggestions);
            }
            else {
                const currentCustomTokens = this._getCustomTokens(pattern);
                const patternsSuggestionList = currentCustomTokens.map(token => {
                    const segment = {
                        text: token,
                        pattern: pattern,
                    };
                    const patternSuggestion = {
                        text: token,
                        suggestionSequence: [segment],
                    };
                    return patternSuggestion;
                });
                const leafCompositeSuggestions = leafPatterns.map(lp => this._getCompositeSuggestionsForPattern(lp)).flat();
                suggestionsToReturn.push(...patternsSuggestionList, ...leafCompositeSuggestions);
            }
            if (this._options.greedyPatternNames != null && this._options.greedyPatternNames.includes(pattern.name)) {
                const nextPatterns = pattern.getNextPatterns();
                const nextPatternedTokensList = nextPatterns.reduce((acc, pattern) => {
                    const patternedTokensList = this._getCompositeSuggestionsForPattern(pattern);
                    acc.push(...patternedTokensList);
                    return acc;
                }, []);
                const compositeSuggestionList = [];
                for (const currentSuggestion of suggestionsToReturn) {
                    for (const nextSuggestionWithSubElements of nextPatternedTokensList) {
                        const augmentedTokenWithPattern = {
                            text: currentSuggestion.text + nextSuggestionWithSubElements.text,
                            suggestionSequence: [...currentSuggestion.suggestionSequence, ...nextSuggestionWithSubElements.suggestionSequence],
                        };
                        compositeSuggestionList.push(augmentedTokenWithPattern);
                    }
                }
                return compositeSuggestionList;
            }
            else {
                const dedupedSuggestions = this._deDupeCompositeSuggestions(suggestionsToReturn);
                return dedupedSuggestions;
            }
        }
        _getCustomTokens(pattern) {
            var _a;
            const customTokensMap = this._options.customTokens || {};
            const customTokens = (_a = customTokensMap[pattern.name]) !== null && _a !== void 0 ? _a : [];
            const allTokens = [...customTokens];
            return allTokens;
        }
        _deDupeCompositeSuggestions(suggestions) {
            if (this._options.disableDedupe) {
                return suggestions;
            }
            const seen = new Set();
            const unique = [];
            for (const suggestion of suggestions) {
                // Create a unique key based on text and subElements
                const subElementsKey = suggestion.suggestionSequence
                    .map(sub => ` ${sub.pattern.name} - ${sub.text}  `)
                    .sort()
                    .join('|');
                const key = `${suggestion.text}|${subElementsKey}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    unique.push(suggestion);
                }
            }
            return unique;
        }
        _createSuggestions(lastIndex, compositeSuggestionList) {
            let textToIndex = lastIndex === -1 ? "" : this._cursor.substring(0, lastIndex);
            const options = [];
            for (const compositeSuggestion of compositeSuggestionList) {
                // concatenated for start index identification inside createSuggestion
                const existingTextWithSuggestion = textToIndex + compositeSuggestion.text;
                existingTextWithSuggestion === this._text;
                const suggestionOption = this._createSuggestionOption(this._cursor.text, existingTextWithSuggestion, compositeSuggestion.suggestionSequence);
                options.push(suggestionOption);
                // }
            }
            const reducedOptions = getFurthestOptions(options);
            reducedOptions.sort((a, b) => a.text.localeCompare(b.text));
            return reducedOptions;
        }
        _createSuggestionOption(fullText, suggestion, segments) {
            const furthestMatch = findMatchIndex(suggestion, fullText);
            const text = suggestion.slice(furthestMatch);
            const option = {
                text: text,
                startIndex: furthestMatch,
                suggestionSequence: segments,
            };
            return option;
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

    const kebabRegex = /-([a-z])/g;
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

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.browser.js.map
