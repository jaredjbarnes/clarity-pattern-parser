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
        this.children.forEach(c => c.walkUp(callback));
        callback(this);
    }
    walkDown(callback) {
        callback(this);
        this.children.forEach(c => c.walkDown(callback));
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
    exec(text) {
        const cursor = new Cursor(text);
        const ast = this.parse(cursor);
        return {
            ast: (ast === null || ast === void 0 ? void 0 : ast.value) === text ? ast : null,
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
        this._node = new Node("regex", this._name, currentIndex, newIndex, undefined, result[0]);
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
        return pattern;
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
    getPatternsAfter(_childReference) {
        return [];
    }
    getNextPatterns() {
        if (this.parent == null) {
            return [];
        }
        return this.parent.getPatternsAfter(this);
    }
    findPattern(_predicate) {
        return null;
    }
    setTokens(tokens) {
        this._tokens = tokens;
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
    exec(text) {
        const cursor = new Cursor(text);
        const ast = this.parse(cursor);
        return {
            ast: (ast === null || ast === void 0 ? void 0 : ast.value) === text ? ast : null,
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
                            cursor.recordErrorAt(cursor.index + 1, this);
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
                        cursor.recordErrorAt(cursor.index, this);
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
        cursor.getChars(this._firstIndex, lastIndex);
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
    getPatternsAfter(childReference) {
        let nextSibling = null;
        let nextSiblingIndex = -1;
        let index = -1;
        const patterns = [];
        for (let i = 0; i < this._children.length; i++) {
            if (this._children[i] === childReference) {
                if (i + 1 < this._children.length) {
                    nextSibling = this._children[i + 1];
                }
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
        // Next pattern isn't optional so send it back as the next patterns.
        if (nextSibling !== null && !nextSibling.isOptional) {
            return [nextSibling];
        }
        // Send back as many optional patterns as possible.
        if (nextSibling !== null && nextSibling.isOptional) {
            for (let i = nextSiblingIndex; i < this._children.length; i++) {
                const child = this._children[i];
                patterns.push(child);
                if (!child.isOptional) {
                    break;
                }
                if (i === this._children.length - 1 && this._parent !== null) {
                    patterns.push(...this._parent.getPatternsAfter(this));
                }
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
    findPattern(predicate) {
        return findPattern(this, predicate);
    }
    clone(name = this._name, isOptional = this._isOptional) {
        return new And(name, this._children, isOptional);
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
    }
    test(text) {
        const cursor = new Cursor(text);
        const ast = this.parse(cursor);
        return (ast === null || ast === void 0 ? void 0 : ast.value) === text;
    }
    exec(text) {
        const cursor = new Cursor(text);
        const ast = this.parse(cursor);
        return {
            ast: (ast === null || ast === void 0 ? void 0 : ast.value) === text ? ast : null,
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
        return new Node("literal", this._name, this._firstIndex, this._lastIndex, undefined, this._literal);
    }
    clone(name = this._name, isOptional = this._isOptional) {
        const clone = new Literal(name, this._literal, isOptional);
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
    getPatternsAfter() {
        return [];
    }
    getNextPatterns() {
        if (this.parent == null) {
            return [];
        }
        return this.parent.getPatternsAfter(this);
    }
    findPattern(_predicate) {
        return null;
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
    test(text) {
        const cursor = new Cursor(text);
        this.parse(cursor);
        return !cursor.hasError;
    }
    exec(text) {
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
    test(text) {
        const cursor = new Cursor(text);
        const ast = this.parse(cursor);
        return (ast === null || ast === void 0 ? void 0 : ast.value) === text;
    }
    exec(text) {
        const cursor = new Cursor(text);
        const ast = this.parse(cursor);
        return {
            ast: (ast === null || ast === void 0 ? void 0 : ast.value) === text ? ast : null,
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
    exec(text) {
        const cursor = new Cursor(text);
        const ast = this.parse(cursor);
        return {
            ast: (ast === null || ast === void 0 ? void 0 : ast.value) === text ? ast : null,
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
        cursor.getChars(this._firstIndex, lastIndex);
        cursor.moveTo(lastIndex);
        return new Node("repeat", this._name, this._firstIndex, lastIndex, children, undefined);
    }
    getLastValidNode() {
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
        if (this.parent == null) {
            return [];
        }
        return this.parent.getTokensAfter(this);
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
        if (index === 0 && !this._divider && this._parent) {
            patterns.push(this._children[0]);
            patterns.push(...this._parent.getPatternsAfter(this));
        }
        return patterns;
    }
    getNextPatterns() {
        if (this.parent == null) {
            return [];
        }
        return this.parent.getPatternsAfter(this);
    }
    findPattern(predicate) {
        return findPattern(this, predicate);
    }
    clone(name = this._name, isOptional = this._isOptional) {
        return new Repeat(name, this._pattern, this._divider, isOptional);
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
    test(text) {
        const cursor = new Cursor(text);
        const ast = this.parse(cursor);
        return (ast === null || ast === void 0 ? void 0 : ast.value) === text;
    }
    exec(text) {
        const cursor = new Cursor(text);
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
    findPattern(_predicate) {
        return null;
    }
    clone(name = this._name, isOptional = this._isOptional) {
        return new Reference(name, isOptional);
    }
}

const defaultOptions = { greedyPatternNames: [], customTokens: {} };
class AutoComplete {
    constructor(pattern, options = defaultOptions) {
        this._pattern = pattern;
        this._options = options;
        this._text = "";
    }
    suggest(text) {
        if (text.length === 0) {
            return {
                isComplete: false,
                options: this.createSuggestionsFromRoot(),
                nextPatterns: [this._pattern],
                cursor: null,
                ast: null
            };
        }
        this._text = text;
        this._cursor = new Cursor(text);
        const ast = this._pattern.parse(this._cursor);
        const leafPattern = this._cursor.leafMatch.pattern;
        const isComplete = (ast === null || ast === void 0 ? void 0 : ast.value) === text;
        const options = this.createSuggestionsFromTokens();
        let nextPatterns = [this._pattern];
        if (leafPattern != null) {
            nextPatterns = leafPattern.getNextPatterns();
        }
        return {
            isComplete: isComplete,
            options: options,
            nextPatterns,
            cursor: this._cursor,
            ast,
        };
    }
    createSuggestionsFromRoot() {
        const suggestions = [];
        const tokens = this._pattern.getTokens();
        for (const token of tokens) {
            suggestions.push(this.createSuggestion("", token));
        }
        return suggestions;
    }
    createSuggestionsFromTokens() {
        const leafMatch = this._cursor.leafMatch;
        if (!leafMatch.pattern) {
            return this.createSuggestions(-1, this._getTokensForPattern(this._pattern));
        }
        const leafPattern = leafMatch.pattern;
        leafMatch.node;
        const parent = leafMatch.pattern.parent;
        if (parent !== null && leafMatch.node != null) {
            const patterns = leafPattern.getNextPatterns();
            const tokens = patterns.reduce((acc, pattern) => {
                acc.push(...this._getTokensForPattern(pattern));
                return acc;
            }, []);
            return this.createSuggestions(leafMatch.node.lastIndex, tokens);
        }
        else {
            return [];
        }
    }
    _getTokensForPattern(pattern) {
        if (this._options.greedyPatternNames.includes(pattern.name)) {
            const greedyTokens = pattern.getTokens();
            const nextPatterns = pattern.getNextPatterns();
            const tokens = [];
            const nextPatternTokens = nextPatterns.reduce((acc, pattern) => {
                acc.push(...this._getTokensForPattern(pattern));
                return acc;
            }, []);
            for (let token of greedyTokens) {
                for (let nextPatternToken of nextPatternTokens) {
                    tokens.push(token + nextPatternToken);
                }
            }
            return tokens;
        }
        else {
            const tokens = pattern.getTokens();
            const customTokens = this._options.customTokens[pattern.name] || [];
            tokens.push(...customTokens);
            return tokens;
        }
    }
    createSuggestions(lastIndex, tokens) {
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
                options.push(this.createSuggestion(this._cursor.text, suggestion));
            }
        }
        const reducedOptions = getFurthestOptions(options);
        reducedOptions.sort((a, b) => a.text.localeCompare(b.text));
        return reducedOptions;
    }
    createSuggestion(fullText, suggestion) {
        const furthestMatch = findMatchIndex(suggestion, fullText);
        const text = suggestion.slice(furthestMatch);
        return {
            text: text,
            startIndex: furthestMatch,
        };
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

export { And, AutoComplete, Cursor, CursorHistory, Literal, Node, Not, Or, ParseError, Reference, Regex, Repeat };
//# sourceMappingURL=index.esm.js.map
