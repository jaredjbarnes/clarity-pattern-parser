(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.clarityPatternParser = {}));
})(this, (function (exports) { 'use strict';

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
        walkUp(callback) {
            this.children.forEach(c => c.walkUp(callback));
            callback(this);
        }
        walkDown(callback) {
            callback(this);
            this.children.forEach(c => c.walkDown(callback));
        }
        clone() {
            return new Node(this._type, this._name, this._firstIndex, this._lastIndex, this._children.map((c) => c.clone()), this._value);
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

    class ParseError {
        constructor(index, pattern) {
            this.index = index;
            this.pattern = pattern;
        }
    }

    class CursorHistory {
        constructor() {
            this._isRecording = false;
            this._leafMatch = { pattern: null, node: null };
            this._furthestError = null;
            this._currentError = null;
            this._rootMatch = { pattern: null, node: null };
            this._patterns = [];
            this._nodes = [];
            this._errors = [];
        }
        get isRecording() {
            return this._isRecording;
        }
        get rootMatch() {
            return this._rootMatch;
        }
        get leafMatch() {
            return this._leafMatch;
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
        recordMatch(pattern, node) {
            if (this._isRecording) {
                this._patterns.push(pattern);
                this._nodes.push(node);
            }
            this._rootMatch.pattern = pattern;
            this._rootMatch.node = node;
            const isFurthestMatch = this._leafMatch.node === null || node.lastIndex > this._leafMatch.node.lastIndex;
            if (isFurthestMatch) {
                this._leafMatch.pattern = pattern;
                this._leafMatch.node = node;
            }
        }
        recordErrorAt(index, pattern) {
            const error = new ParseError(index, pattern);
            this._currentError = error;
            if (this._furthestError === null || index > this._furthestError.index) {
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
        get leafMatch() {
            return this._history.leafMatch;
        }
        get furthestError() {
            return this._history.furthestError;
        }
        get error() {
            return this._history.error;
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
            if (text.length === 0) {
                throw new Error("Cannot have a empty string.");
            }
            this._text = text;
            this._index = 0;
            this._length = text.length;
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
        recordMatch(pattern, node) {
            this._history.recordMatch(pattern, node);
        }
        recordErrorAt(index, onPattern) {
            this._history.recordErrorAt(index, onPattern);
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
    }

    function getNextPattern(pattern) {
        const parent = pattern.parent;
        if (parent == null) {
            return null;
        }
        const patternIndex = parent.children.indexOf(pattern);
        const nextPattern = parent.children[patternIndex + 1] || null;
        if (nextPattern == null) {
            return parent.getNextPattern();
        }
        return nextPattern;
    }

    class Regex {
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
            this._substring = "";
            this._tokens = [];
            this._hasContextualTokenAggregation = false;
            this._isRetrievingContextualTokens = false;
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
        parseText(text) {
            const cursor = new Cursor(text);
            const ast = this.parse(cursor);
            return {
                ast,
                cursor
            };
        }
        parse(cursor) {
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
            this._node = new Node("regex", this._name, currentIndex, newIndex, [], result[0]);
            cursor.moveTo(newIndex);
            cursor.recordMatch(this, this._node);
        }
        processError(cursor) {
            if (!this._isOptional) {
                cursor.recordErrorAt(cursor.index, this);
            }
            this._node = null;
        }
        clone(name = this._name, isOptional = this._isOptional) {
            const pattern = new Regex(name, this._originalRegexString, isOptional);
            pattern._tokens = this._tokens.slice();
            pattern._hasContextualTokenAggregation =
                this._hasContextualTokenAggregation;
            return pattern;
        }
        getTokens() {
            const parent = this._parent;
            if (this._hasContextualTokenAggregation &&
                parent != null &&
                !this._isRetrievingContextualTokens) {
                this._isRetrievingContextualTokens = true;
                const tokens = this._tokens;
                const aggregateTokens = [];
                const nextTokens = parent.getNextTokens(this);
                for (let nextToken of nextTokens) {
                    for (let token of tokens) {
                        aggregateTokens.push(token + nextToken);
                    }
                }
                this._isRetrievingContextualTokens = false;
                return aggregateTokens;
            }
            return this._tokens;
        }
        getNextTokens(_reference) {
            return [];
        }
        getNextPattern() {
            return getNextPattern(this);
        }
        findPattern(_predicate) {
            return null;
        }
        setTokens(tokens) {
            this._tokens = tokens;
        }
        enableContextualTokenAggregation() {
            this._hasContextualTokenAggregation = true;
        }
        disableContextualTokenAggregation() {
            this._hasContextualTokenAggregation = false;
        }
    }

    function clonePatterns(patterns, isOptional) {
        return patterns.map(p => p.clone(p.name, isOptional));
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

    class And {
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
            this._type = "and";
            this._name = name;
            this._isOptional = isOptional;
            this._parent = null;
            this._children = children;
            this._firstIndex = -1;
            this._shouldReduceAst = false;
            this._nodes = [];
        }
        _assignChildrenToParent(children) {
            for (const child of children) {
                child.parent = this;
            }
        }
        parseText(text) {
            const cursor = new Cursor(text);
            const ast = this.parse(cursor);
            return {
                ast,
                cursor
            };
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
            if (this._isOptional) {
                cursor.resolveError();
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
                                cursor.next();
                                continue;
                            }
                            else {
                                if (this.areRemainingPatternsOptional(i)) {
                                    passed = true;
                                    break;
                                }
                                cursor.recordErrorAt(cursor.index + 1, this);
                                break;
                            }
                        }
                        else {
                            cursor.moveTo(runningCursorIndex);
                            continue;
                        }
                    }
                    else {
                        const lastNode = this.getLastValidNode();
                        if (lastNode === null) {
                            cursor.recordErrorAt(cursor.index, this);
                            break;
                        }
                        passed = true;
                        break;
                    }
                }
                else {
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
            const value = cursor.getChars(this._firstIndex, lastIndex);
            cursor.moveTo(lastIndex);
            if (this._shouldReduceAst) {
                children.length = 0;
            }
            return new Node("and", this._name, this._firstIndex, lastIndex, children, this._shouldReduceAst ? value : undefined);
        }
        enableAstReduction() {
            this._shouldReduceAst = true;
        }
        disableAstReduction() {
            this._shouldReduceAst = false;
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
        getNextTokens(lastMatched) {
            let nextSibling = null;
            let nextSiblingIndex = -1;
            let index = -1;
            const tokens = [];
            for (let i = 0; i < this._children.length; i++) {
                if (this._children[i] === lastMatched) {
                    if (i + 1 < this._children.length) {
                        nextSibling = this._children[i + 1];
                    }
                    nextSiblingIndex = i + 1;
                    index = i;
                    break;
                }
            }
            if (index === -1) {
                return [];
            }
            if (nextSiblingIndex === this._children.length && this._parent !== null) {
                return this._parent.getNextTokens(this);
            }
            if (nextSibling !== null && !nextSibling.isOptional) {
                return nextSibling.getTokens();
            }
            if (nextSibling !== null && nextSibling.isOptional) {
                for (let i = nextSiblingIndex; i < this._children.length; i++) {
                    const child = this._children[i];
                    tokens.push(...child.getTokens());
                    if (!child.isOptional) {
                        break;
                    }
                    if (i === this._children.length - 1 && this._parent !== null) {
                        tokens.push(...this._parent.getNextTokens(this));
                    }
                }
            }
            return tokens;
        }
        getNextPattern() {
            return getNextPattern(this);
        }
        findPattern(predicate) {
            return findPattern(this, predicate);
        }
        clone(name = this._name, isOptional = this._isOptional) {
            const and = new And(name, this._children, isOptional);
            and._shouldReduceAst = this._shouldReduceAst;
            return and;
        }
    }

    class Literal {
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
            this._type = "literal";
            this._name = name;
            this._literal = value;
            this._runes = Array.from(value);
            this._isOptional = isOptional;
            this._parent = null;
            this._firstIndex = 0;
            this._lastIndex = 0;
            this._hasContextualTokenAggregation = false;
            this._isRetrievingContextualTokens = false;
        }
        parseText(text) {
            const cursor = new Cursor(text);
            const ast = this.parse(cursor);
            return {
                ast,
                cursor
            };
        }
        parse(cursor) {
            this._firstIndex = cursor.index;
            const passed = this._tryToParse(cursor);
            if (passed) {
                cursor.resolveError();
                const node = this._createNode();
                cursor.recordMatch(this, node);
                return node;
            }
            if (!this._isOptional) {
                cursor.recordErrorAt(cursor.index, this);
                return null;
            }
            cursor.resolveError();
            cursor.moveTo(this._firstIndex);
            return null;
        }
        _tryToParse(cursor) {
            let passed = false;
            const literalRuneLength = this._runes.length;
            for (let i = 0; i < literalRuneLength; i++) {
                const literalRune = this._runes[i];
                const cursorRune = cursor.currentChar;
                if (literalRune !== cursorRune) {
                    break;
                }
                if (i + 1 === literalRuneLength) {
                    this._lastIndex = this._firstIndex + this._literal.length - 1;
                    passed = true;
                    break;
                }
                if (!cursor.hasNext()) {
                    break;
                }
                cursor.next();
            }
            return passed;
        }
        _createNode() {
            return new Node("literal", this._name, this._firstIndex, this._lastIndex, [], this._literal);
        }
        clone(name = this._name, isOptional = this._isOptional) {
            const clone = new Literal(name, this._literal, isOptional);
            clone._hasContextualTokenAggregation = this._hasContextualTokenAggregation;
            return clone;
        }
        getTokens() {
            const parent = this._parent;
            if (this._hasContextualTokenAggregation &&
                parent != null &&
                !this._isRetrievingContextualTokens) {
                this._isRetrievingContextualTokens = true;
                const aggregateTokens = [];
                const nextTokens = parent.getNextTokens(this);
                for (const nextToken of nextTokens) {
                    aggregateTokens.push(this._literal + nextToken);
                }
                this._isRetrievingContextualTokens = false;
                return aggregateTokens;
            }
            else {
                return [this._literal];
            }
        }
        getNextTokens(_lastMatched) {
            return [];
        }
        getNextPattern() {
            return getNextPattern(this);
        }
        findPattern(_predicate) {
            return null;
        }
        enableContextualTokenAggregation() {
            this._hasContextualTokenAggregation = true;
        }
        disableContextualTokenAggregation() {
            this._hasContextualTokenAggregation = false;
        }
    }

    class Not {
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
            this._type = "not";
            this._name = name;
            this._parent = null;
            this._children = [pattern.clone(pattern.name, false)];
            this._children[0].parent = this;
        }
        parseText(text) {
            const cursor = new Cursor(text);
            const ast = this.parse(cursor);
            return {
                ast,
                cursor
            };
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
                cursor.recordErrorAt(firstIndex, this);
            }
            return null;
        }
        clone(name = this._name) {
            const not = new Not(name, this._children[0]);
            return not;
        }
        getNextPattern() {
            return getNextPattern(this);
        }
        getTokens() {
            return [];
        }
        getNextTokens(_lastMatched) {
            const parent = this._parent;
            if (parent != null) {
                parent.getNextTokens(this);
            }
            return [];
        }
        findPattern(predicate) {
            return predicate(this._children[0]) ? this._children[0] : null;
        }
    }

    class Or {
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
        constructor(name, options, isOptional = false) {
            if (options.length === 0) {
                throw new Error("Need at least one pattern with an 'or' pattern.");
            }
            const children = clonePatterns(options, false);
            this._assignChildrenToParent(children);
            this._type = "or";
            this._name = name;
            this._parent = null;
            this._children = children;
            this._isOptional = isOptional;
            this._firstIndex = 0;
        }
        _assignChildrenToParent(children) {
            for (const child of children) {
                child.parent = this;
            }
        }
        parseText(text) {
            const cursor = new Cursor(text);
            const ast = this.parse(cursor);
            return {
                ast,
                cursor
            };
        }
        parse(cursor) {
            this._firstIndex = cursor.index;
            const node = this._tryToParse(cursor);
            if (node != null) {
                cursor.resolveError();
                return node;
            }
            if (!this._isOptional) {
                cursor.recordErrorAt(this._firstIndex, this);
                return null;
            }
            cursor.resolveError();
            cursor.moveTo(this._firstIndex);
            return null;
        }
        _tryToParse(cursor) {
            for (const pattern of this._children) {
                cursor.moveTo(this._firstIndex);
                const result = pattern.parse(cursor);
                if (!cursor.hasError) {
                    return result;
                }
                cursor.resolveError();
            }
            return null;
        }
        getTokens() {
            const tokens = [];
            for (const child of this._children) {
                tokens.push(...child.getTokens());
            }
            return tokens;
        }
        getNextTokens(_lastMatched) {
            if (this._parent === null) {
                return [];
            }
            return this._parent.getNextTokens(this);
        }
        getNextPattern() {
            return getNextPattern(this);
        }
        findPattern(predicate) {
            return findPattern(this, predicate);
        }
        clone(name = this._name, isOptional = this._isOptional) {
            const or = new Or(name, this._children, isOptional);
            return or;
        }
    }

    class Repeat {
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
        constructor(name, pattern, divider, isOptional = false) {
            const patterns = divider != null ? [pattern, divider] : [pattern];
            const children = clonePatterns(patterns, false);
            this._assignChildrenToParent(children);
            this._type = "repeat";
            this._name = name;
            this._isOptional = isOptional;
            this._parent = null;
            this._children = children;
            this._pattern = children[0];
            this._divider = children[1];
            this._firstIndex = -1;
            this._shouldReduceAst = false;
            this._nodes = [];
        }
        _assignChildrenToParent(children) {
            for (const child of children) {
                child.parent = this;
            }
        }
        parseText(text) {
            const cursor = new Cursor(text);
            const ast = this.parse(cursor);
            return {
                ast,
                cursor
            };
        }
        parse(cursor) {
            this._firstIndex = cursor.index;
            this._nodes = [];
            const passed = this.tryToParse(cursor);
            if (passed) {
                cursor.resolveError();
                const node = this.createNode(cursor);
                if (node != null) {
                    cursor.recordMatch(this, node);
                }
                return node;
            }
            if (!this._isOptional) {
                return null;
            }
            cursor.resolveError();
            cursor.moveTo(this._firstIndex);
            return null;
        }
        tryToParse(cursor) {
            let passed = false;
            while (true) {
                const runningCursorIndex = cursor.index;
                const repeatedNode = this._pattern.parse(cursor);
                if (cursor.hasError) {
                    const lastValidNode = this.getLastValidNode();
                    if (lastValidNode != null) {
                        passed = true;
                    }
                    else {
                        cursor.moveTo(runningCursorIndex);
                        cursor.recordErrorAt(runningCursorIndex, this._pattern);
                        passed = false;
                    }
                    break;
                }
                else if (repeatedNode) {
                    this._nodes.push(repeatedNode);
                    if (!cursor.hasNext()) {
                        passed = true;
                        break;
                    }
                    cursor.next();
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
            return passed;
        }
        createNode(cursor) {
            let children = [];
            if (!this._divider) {
                children = this._nodes;
            }
            else {
                if (this._nodes.length % 2 !== 1) {
                    const dividerNode = this._nodes[this._nodes.length - 1];
                    cursor.moveTo(dividerNode.firstIndex);
                    children = this._nodes.slice(0, this._nodes.length - 1);
                }
                else {
                    children = this._nodes;
                }
            }
            const lastIndex = children[children.length - 1].lastIndex;
            const value = cursor.getChars(this._firstIndex, lastIndex);
            cursor.moveTo(lastIndex);
            if (this._shouldReduceAst) {
                children = [];
            }
            return new Node("repeat", this._name, this._firstIndex, lastIndex, children, this._shouldReduceAst ? value : undefined);
        }
        getLastValidNode() {
            const nodes = this._nodes.filter((node) => node !== null);
            if (nodes.length === 0) {
                return null;
            }
            return nodes[nodes.length - 1];
        }
        enableAstReduction() {
            this._shouldReduceAst = true;
        }
        disableAstReduction() {
            this._shouldReduceAst = false;
        }
        getTokens() {
            return this._pattern.getTokens();
        }
        getNextTokens(lastMatched) {
            let index = -1;
            const tokens = [];
            for (let i = 0; i < this._children.length; i++) {
                if (this._children[i] === lastMatched) {
                    index = i;
                }
            }
            // If the last match isn't a child of this pattern.
            if (index === -1) {
                return [];
            }
            // If the last match was the repeated patterns, then suggest the divider.
            if (index === 0 && this._divider) {
                tokens.push(...this._children[1].getTokens());
                if (this._parent) {
                    tokens.push(...this._parent.getNextTokens(this));
                }
            }
            // Suggest the pattern because the divider was the last match.
            if (index === 1) {
                tokens.push(...this._children[0].getTokens());
            }
            if (index === 0 && !this._divider && this._parent) {
                tokens.push(...this._children[0].getTokens());
                tokens.push(...this._parent.getNextTokens(this));
            }
            return tokens;
        }
        getNextPattern() {
            return getNextPattern(this);
        }
        findPattern(predicate) {
            return findPattern(this, predicate);
        }
        clone(name = this._name, isOptional = this._isOptional) {
            const repeat = new Repeat(name, this._pattern, this._divider, isOptional);
            repeat._shouldReduceAst = this._shouldReduceAst;
            return repeat;
        }
    }

    class Reference {
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
            this._type = "reference";
            this._name = name;
            this._parent = null;
            this._isOptional = isOptional;
            this._pattern = null;
            this._children = [];
        }
        parseText(text) {
            const cursor = new Cursor(text);
            const ast = this.parse(cursor);
            return {
                ast,
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
        getNextTokens(_lastMatched) {
            if (this.parent == null) {
                return [];
            }
            return this.parent.getNextTokens(this);
        }
        getNextPattern() {
            return getNextPattern(this);
        }
        findPattern(_predicate) {
            return null;
        }
        clone(name = this._name, isOptional = this._isOptional) {
            return new Reference(name, isOptional);
        }
    }

    exports.And = And;
    exports.Cursor = Cursor;
    exports.Literal = Literal;
    exports.Node = Node;
    exports.Not = Not;
    exports.Or = Or;
    exports.ParseError = ParseError;
    exports.Reference = Reference;
    exports.Regex = Regex;
    exports.Repeat = Repeat;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.browser.js.map
