class Node {
    constructor(type, name, startIndex, endIndex, children = [], value = "") {
        this.type = type;
        this.name = name;
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.children = children;
        this.value = value;
    }
    clone() {
        return new Node(this.type, this.name, this.startIndex, this.endIndex, this.children.map((c) => c.clone()), this.value);
    }
    toString() {
        return this.value;
    }
}

class CursorHistory {
    constructor() {
        this.isRecording = false;
        this.furthestMatch = {
            pattern: null,
            astNode: null,
        };
        this.furthestError = null;
        this.patterns = [];
        this.astNodes = [];
        this.errors = [];
    }
    addMatch(pattern, astNode) {
        if (this.isRecording) {
            this.patterns.push(pattern);
            this.astNodes.push(astNode);
        }
        if (this.furthestMatch.astNode == null ||
            astNode.endIndex >= this.furthestMatch.astNode.endIndex) {
            this.furthestMatch.pattern = pattern;
            this.furthestMatch.astNode = astNode;
        }
    }
    addError(error) {
        if (this.isRecording) {
            this.errors.push(error);
        }
        if (this.furthestError == null || error.index >= this.furthestError.index) {
            this.furthestError = error;
        }
    }
    startRecording() {
        this.isRecording = true;
    }
    stopRecording() {
        this.isRecording = false;
        this.clear();
    }
    clear() {
        this.patterns.length = 0;
        this.astNodes.length = 0;
        this.errors.length = 0;
    }
    getFurthestError() {
        return this.furthestError;
    }
    getFurthestMatch() {
        return this.furthestMatch;
    }
    getLastMatch() {
        if (this.isRecording) {
            return {
                pattern: this.patterns[this.patterns.length - 1] || null,
                astNode: this.astNodes[this.astNodes.length - 1] || null,
            };
        }
        else {
            return this.furthestMatch;
        }
    }
    getLastError() {
        return this.errors[this.errors.length - 1] || null;
    }
    getAllParseStacks() {
        const stacks = this.astNodes.reduce((acc, node) => {
            let container = acc[acc.length - 1];
            if (node.startIndex === 0) {
                container = [];
                acc.push(container);
            }
            container.push(node);
            return acc;
        }, []);
        // There are times when the matching will fail and hit again on the same node.
        // This filters them out.
        // We simply check to see if there is any overlap with the previous one,
        // and if there is we don't add it. This is why we move backwards.
        const cleanedStack = stacks.map((stack) => {
            const cleanedStack = [];
            for (let x = stack.length - 1; x >= 0; x--) {
                const currentNode = stack[x];
                const previousNode = stack[x + 1];
                if (previousNode == null) {
                    cleanedStack.unshift(currentNode);
                }
                else {
                    const left = Math.max(currentNode.startIndex, previousNode.startIndex);
                    const right = Math.min(currentNode.endIndex, previousNode.endIndex);
                    const isOverlapping = left <= right;
                    if (!isOverlapping) {
                        cleanedStack.unshift(currentNode);
                    }
                }
            }
            return cleanedStack;
        });
        return cleanedStack;
    }
    getLastParseStack() {
        const stacks = this.getAllParseStacks();
        return stacks[stacks.length - 1] || [];
    }
}

class Cursor {
    constructor(text) {
        this.text = text;
        this.assertValidity();
        this.index = 0;
        this.length = text.length;
        this.history = new CursorHistory();
        this.isInErrorState = false;
    }
    assertValidity() {
        if (this.isNullOrEmpty(this.text)) {
            throw new Error("Illegal Argument: Cursor needs to have a string that has a length greater than 0.");
        }
    }
    startRecording() {
        this.history.startRecording();
    }
    stopRecording() {
        this.history.stopRecording();
    }
    get parseError() {
        return this.history.getFurthestError();
    }
    get lastMatch() {
        return this.history.getFurthestMatch();
    }
    throwError(parseError) {
        this.isInErrorState = true;
        this.history.addError(parseError);
    }
    addMatch(pattern, astNode) {
        this.history.addMatch(pattern, astNode);
    }
    resolveError() {
        this.isInErrorState = false;
    }
    hasUnresolvedError() {
        return this.isInErrorState;
    }
    isNullOrEmpty(value) {
        return value == null || (typeof value === "string" && value.length === 0);
    }
    hasNext() {
        return this.index + 1 < this.text.length;
    }
    hasPrevious() {
        return this.index - 1 >= 0;
    }
    next() {
        if (this.hasNext()) {
            this.index++;
        }
        else {
            throw new Error("Cursor: Out of Bounds Exception.");
        }
    }
    previous() {
        if (this.hasPrevious()) {
            this.index--;
        }
        else {
            throw new Error("Cursor: Out of Bounds Exception.");
        }
    }
    mark() {
        return this.index;
    }
    moveToMark(mark) {
        this.index = mark;
    }
    moveToBeginning() {
        this.index = 0;
    }
    moveToEnd() {
        this.index = this.text.length - 1;
    }
    getChar() {
        return this.text.charAt(this.index);
    }
    getIndex() {
        return this.index;
    }
    setIndex(index) {
        if (typeof index === "number") {
            if (index < 0 || index > this.lastIndex()) {
                throw new Error("Cursor: Out of Bounds Exception.");
            }
            this.index = index;
        }
    }
    isAtBeginning() {
        return this.index === 0;
    }
    isAtEnd() {
        return this.index === this.text.length - 1;
    }
    lastIndex() {
        return this.length - 1;
    }
    didSuccessfullyParse() {
        return !this.hasUnresolvedError() && this.isAtEnd();
    }
}

class ParseError {
    constructor(message, index, pattern) {
        this.name = "ParseError";
        this.message = message;
        this.index = index;
        this.pattern = pattern;
    }
}

class Pattern {
    constructor(type, name, children = [], isOptional = false) {
        this._isOptional = false;
        this._type = type;
        this._name = name;
        this._children = [];
        this._parent = null;
        this._isOptional = isOptional;
        this.children = children;
    }
    get isOptional() {
        return this._isOptional;
    }
    exec(text) {
        const cursor = new Cursor(text);
        const node = this.parse(cursor);
        if (cursor.didSuccessfullyParse()) {
            return node;
        }
        else {
            return null;
        }
    }
    test(text) {
        return this.exec(text) != null;
    }
    get name() {
        return this._name;
    }
    get type() {
        return this._type;
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
    set children(value) {
        this._children = value;
        this.cloneChildren();
        this.assignAsParent();
    }
    getTokenValue() {
        return null;
    }
    getNextTokens() {
        var _a, _b;
        const parent = this._parent;
        if (parent != null) {
            const siblings = parent.children;
            const index = siblings.findIndex((c) => c === this);
            const nextSibling = siblings[index + 1];
            // I don't like this, so I think we need to rethink this.
            if (parent.type.indexOf("repeat") === 0) {
                const tokens = parent.getNextTokens();
                if (index === 0 && siblings.length > 1) {
                    return nextSibling.getTokens().concat(tokens);
                }
                else if (index === 1) {
                    return siblings[0].getTokens();
                }
                else {
                    return this.getTokens().concat(tokens);
                }
            }
            // Another thing I don't like.
            if (((_b = (_a = this._parent) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.indexOf("and")) === 0 &&
                nextSibling != null &&
                nextSibling.isOptional) {
                let tokens = [];
                for (let x = index + 1; x < siblings.length; x++) {
                    const child = siblings[x];
                    if (child.isOptional) {
                        tokens = tokens.concat(child.getTokens());
                    }
                    else {
                        tokens = tokens.concat(child.getTokens());
                        break;
                    }
                    if (x === siblings.length - 1) {
                        tokens = tokens.concat(this._parent.getNextTokens());
                    }
                }
                return tokens;
            }
            // If you are an or you have already qualified.
            if (parent.type.indexOf("or") === 0) {
                return parent.getNextTokens();
            }
            if (nextSibling != null) {
                return nextSibling.getTokens();
            }
            else {
                return parent.getNextTokens();
            }
        }
        return [];
    }
    cloneChildren() {
        this._children = this._children.map((pattern) => {
            return pattern.clone();
        });
        Object.freeze(this._children);
    }
    assignAsParent() {
        this._children.forEach((child) => (child.parent = this));
    }
}

class Regex extends Pattern {
    constructor(name, regex, isOptional = false) {
        super("regex", name, [], isOptional);
        this.node = null;
        this.cursor = null;
        this.substring = "";
        this.regexString = regex;
        this.regex = new RegExp(`^${regex}`, "g");
        this.assertArguments();
    }
    assertArguments() {
        if (this.regexString.length < 1) {
            throw new Error("Invalid Arguments: The regex string argument needs to be at least one character long.");
        }
        if (this.regexString.charAt(0) === "^") {
            throw new Error("Invalid Arguments: The regex string cannot start with a '^' because it is expected to be in the middle of a string.");
        }
        if (this.regexString.charAt(this.regexString.length - 1) === "$") {
            throw new Error("Invalid Arguments: The regex string cannot end with a '$' because it is expected to be in the middle of a string.");
        }
    }
    parse(cursor) {
        this.resetState(cursor);
        this.tryToParse();
        return this.node;
    }
    resetState(cursor) {
        this.cursor = cursor;
        this.regex.lastIndex = 0;
        this.substring = this.cursor.text.substr(this.cursor.getIndex());
        this.node = null;
    }
    tryToParse() {
        const result = this.regex.exec(this.substring);
        if (result != null && result.index === 0) {
            this.processResult(result);
        }
        else {
            this.processError();
        }
    }
    processResult(result) {
        const cursor = this.safelyGetCursor();
        const currentIndex = cursor.getIndex();
        const newIndex = currentIndex + result[0].length - 1;
        this.node = new Node("regex", this.name, currentIndex, newIndex, [], result[0]);
        cursor.moveToMark(newIndex);
        cursor.addMatch(this, this.node);
    }
    processError() {
        const cursor = this.safelyGetCursor();
        if (!this._isOptional) {
            const message = `ParseError: Expected regex pattern of '${this.regexString}' but found '${this.substring}'.`;
            const parseError = new ParseError(message, cursor.getIndex(), this);
            cursor.throwError(parseError);
        }
        this.node = null;
    }
    safelyGetCursor() {
        const cursor = this.cursor;
        if (cursor == null) {
            throw new Error("Couldn't find cursor.");
        }
        return cursor;
    }
    clone(name, isOptional) {
        if (name == null) {
            name = this.name;
        }
        if (isOptional == null) {
            isOptional = this._isOptional;
        }
        return new Regex(name, this.regexString, isOptional);
    }
    getTokenValue() {
        return this.name;
    }
    getTokens() {
        return [this.name];
    }
}

class And extends Pattern {
    constructor(name, patterns, isOptional = false) {
        super("and", name, patterns, isOptional);
        this.onPatternIndex = 0;
        this.nodes = [];
        this.node = null;
        this.cursor = null;
        this.mark = 0;
    }
    parse(cursor) {
        this.resetState(cursor);
        this.tryToParse();
        return this.node;
    }
    clone(name, isOptional) {
        if (name == null) {
            name = this.name;
        }
        if (isOptional == null) {
            isOptional = this._isOptional;
        }
        return new And(name, this._children, isOptional);
    }
    getTokens() {
        let tokens = [];
        for (let x = 0; x < this._children.length; x++) {
            const child = this._children[x];
            if (child.isOptional) {
                tokens = tokens.concat(child.getTokens());
            }
            else {
                tokens = tokens.concat(child.getTokens());
                break;
            }
        }
        return tokens;
    }
    resetState(cursor) {
        this.onPatternIndex = 0;
        this.nodes = [];
        this.node = null;
        this.cursor = cursor;
        this.mark = this.cursor.mark();
    }
    tryToParse() {
        const cursor = this.safelyGetCursor();
        while (true) {
            const pattern = this._children[this.onPatternIndex];
            const node = pattern.parse(cursor);
            if (cursor.hasUnresolvedError()) {
                this.processError();
                break;
            }
            else {
                this.nodes.push(node);
            }
            if (!this.shouldProceed()) {
                this.processResult();
                break;
            }
        }
    }
    safelyGetCursor() {
        const cursor = this.cursor;
        if (cursor == null) {
            throw new Error("Couldn't find cursor.");
        }
        return cursor;
    }
    processResult() {
        const cursor = this.safelyGetCursor();
        if (cursor.hasUnresolvedError()) {
            this.processError();
        }
        else {
            this.processSuccess();
        }
    }
    processError() {
        const cursor = this.safelyGetCursor();
        if (this.isOptional) {
            cursor.moveToMark(this.mark);
            cursor.resolveError();
        }
        this.node = null;
    }
    shouldProceed() {
        const cursor = this.safelyGetCursor();
        if (this.hasMorePatterns()) {
            const lastNode = this.nodes[this.nodes.length - 1];
            const wasOptional = lastNode == null;
            if (cursor.hasNext()) {
                if (!wasOptional) {
                    cursor.next();
                }
                this.onPatternIndex++;
                return true;
            }
            else if (wasOptional) {
                this.onPatternIndex++;
                return true;
            }
            this.assertRestOfPatternsAreOptional();
            return false;
        }
        else {
            return false;
        }
    }
    hasMorePatterns() {
        return this.onPatternIndex + 1 < this._children.length;
    }
    assertRestOfPatternsAreOptional() {
        const cursor = this.safelyGetCursor();
        const areTheRestOptional = this.areTheRemainingPatternsOptional();
        if (!areTheRestOptional) {
            const parseError = new ParseError(`Could not match ${this.name} before string ran out.`, this.onPatternIndex, this);
            cursor.throwError(parseError);
        }
    }
    areTheRemainingPatternsOptional() {
        return this.children
            .slice(this.onPatternIndex + 1)
            .map((p) => p.isOptional)
            .every((r) => r);
    }
    processSuccess() {
        const cursor = this.safelyGetCursor();
        const nodes = this.nodes.filter((node) => node != null);
        this.nodes = nodes;
        const lastNode = nodes[this.nodes.length - 1];
        const startIndex = this.mark;
        const endIndex = lastNode.endIndex;
        const value = nodes.map((node) => node.value).join("");
        this.node = new Node("and", this.name, startIndex, endIndex, nodes, value);
        cursor.index = this.node.endIndex;
        cursor.addMatch(this, this.node);
    }
}

class Literal extends Pattern {
    constructor(name, literal, isOptional = false) {
        super("literal", name, [], isOptional);
        this.node = null;
        this.mark = 0;
        this.substring = "";
        this.literal = literal;
        this.assertArguments();
    }
    parse(cursor) {
        this.resetState(cursor);
        this.tryToParse();
        return this.node;
    }
    clone(name, isOptional) {
        if (name == null) {
            name = this.name;
        }
        if (isOptional == null) {
            isOptional = this._isOptional;
        }
        return new Literal(name, this.literal, isOptional);
    }
    getTokens() {
        return [this.literal];
    }
    assertArguments() {
        if (this.literal.length < 1) {
            throw new Error("Invalid Arguments: The `literal` argument needs to be at least one character long.");
        }
    }
    resetState(cursor) {
        this.cursor = cursor;
        this.mark = this.cursor.mark();
        this.substring = this.cursor.text.substring(this.mark, this.mark + this.literal.length);
        this.node = null;
    }
    tryToParse() {
        if (this.substring === this.literal) {
            this.processResult();
        }
        else {
            this.processError();
        }
    }
    processError() {
        this.node = null;
        if (!this._isOptional) {
            const message = `ParseError: Expected '${this.literal}' but found '${this.substring}'.`;
            const parseError = new ParseError(message, this.cursor.getIndex(), this);
            this.cursor.throwError(parseError);
        }
    }
    processResult() {
        this.node = new Node("literal", this.name, this.mark, this.mark + this.literal.length - 1, [], this.substring);
        this.cursor.index = this.node.endIndex;
        this.cursor.addMatch(this, this.node);
    }
}

class LookAhead extends Pattern {
    constructor(pattern) {
        super("look-ahead", "look-ahead", [pattern]);
    }
    parse(cursor) {
        const mark = cursor.mark();
        const node = this.children[0].parse(cursor);
        if (cursor.hasUnresolvedError() || node == null) {
            cursor.resolveError();
            cursor.throwError(new ParseError("Couldn't find look ahead pattern.", mark, this.children[0]));
            cursor.moveToMark(mark);
        }
        return null;
    }
    clone() {
        return new LookAhead(this.children[0].clone());
    }
    getTokens() {
        return [];
    }
}

class Not extends Pattern {
    constructor(pattern) {
        super("not", `not-${pattern.name}`, [pattern]);
        this.mark = 0;
        this._isOptional = true;
    }
    parse(cursor) {
        this.cursor = cursor;
        this.mark = cursor.mark();
        this.tryToParse();
        return null;
    }
    tryToParse() {
        const mark = this.cursor.mark();
        this.children[0].parse(this.cursor);
        if (this.cursor.hasUnresolvedError()) {
            this.cursor.resolveError();
            this.cursor.moveToMark(mark);
        }
        else {
            this.cursor.moveToMark(mark);
            const parseError = new ParseError(`Match invalid pattern: ${this.children[0].name}.`, this.mark, this);
            this.cursor.throwError(parseError);
        }
    }
    clone(name) {
        if (name == null) {
            name = this.name;
        }
        return new Not(this.children[0]);
    }
    getTokens() {
        return [];
    }
}

class Or extends Pattern {
    constructor(name, patterns, isOptional = false) {
        super("or", name, patterns, isOptional);
        this.patternIndex = 0;
        this.errors = [];
        this.node = null;
        this.cursor = null;
        this.mark = 0;
        this.parseError = null;
        this.assertArguments();
    }
    assertArguments() {
        if (this._children.length < 2) {
            throw new Error("Invalid Argument: OrValue needs to have more than one value pattern.");
        }
        const hasOptionalChildren = this._children.some((pattern) => pattern.isOptional);
        if (hasOptionalChildren) {
            throw new Error("OrValues cannot have optional patterns.");
        }
    }
    resetState(cursor) {
        this.patternIndex = 0;
        this.errors = [];
        this.node = null;
        this.cursor = cursor;
        this.mark = cursor.mark();
    }
    safelyGetCursor() {
        const cursor = this.cursor;
        if (cursor == null) {
            throw new Error("Couldn't find cursor.");
        }
        return cursor;
    }
    parse(cursor) {
        this.resetState(cursor);
        this.tryToParse();
        return this.node;
    }
    tryToParse() {
        const cursor = this.safelyGetCursor();
        while (true) {
            const pattern = this._children[this.patternIndex];
            const node = pattern.parse(cursor);
            const hasError = cursor.hasUnresolvedError();
            if (hasError) {
                const shouldBreak = this.processError();
                if (shouldBreak) {
                    break;
                }
            }
            else if (node != null) {
                this.processResult(node);
                break;
            }
        }
    }
    processError() {
        const cursor = this.safelyGetCursor();
        const isLastPattern = this.patternIndex + 1 === this._children.length;
        if (!isLastPattern) {
            this.patternIndex++;
            cursor.resolveError();
            cursor.moveToMark(this.mark);
            return false;
        }
        else {
            if (this._isOptional) {
                cursor.resolveError();
                cursor.moveToMark(this.mark);
            }
            this.node = null;
            return true;
        }
    }
    processResult(node) {
        const cursor = this.safelyGetCursor();
        this.node = new Node("or", this.name, node.startIndex, node.endIndex, [node], node.value);
        cursor.index = this.node.endIndex;
        cursor.addMatch(this, this.node);
    }
    clone(name, isOptional) {
        if (name == null) {
            name = this.name;
        }
        if (isOptional == null) {
            isOptional = this._isOptional;
        }
        return new Or(name, this._children, isOptional);
    }
    getTokens() {
        return this._children.reduce((acc, c) => acc.concat(c.getTokens()), []);
    }
}

class Repeat extends Pattern {
    constructor(name, pattern, divider, isOptional = false) {
        super("repeat", name, divider != null ? [pattern, divider] : [pattern], isOptional);
        this.nodes = [];
        this.mark = 0;
        this.node = null;
        this._pattern = this.children[0];
        this._divider = this.children[1];
        this.assertArguments();
    }
    assertArguments() {
        if (this._pattern.isOptional) {
            throw new Error("Invalid Arguments: The pattern cannot be a optional pattern.");
        }
    }
    _reset(cursor) {
        this.nodes = [];
        this.cursor = cursor;
        this.mark = this.cursor.mark();
    }
    parse(cursor) {
        this._reset(cursor);
        this.tryToParse();
        return this.node;
    }
    tryToParse() {
        const cursor = this.safelyGetCursor();
        while (true) {
            const node = this._pattern.parse(cursor);
            if (cursor.hasUnresolvedError()) {
                this.processResult();
                break;
            }
            else if (node != null) {
                this.nodes.push(node);
                if (node.endIndex === cursor.lastIndex()) {
                    this.processResult();
                    break;
                }
                cursor.next();
                if (this._divider != null) {
                    const mark = cursor.mark();
                    const node = this._divider.parse(cursor);
                    if (cursor.hasUnresolvedError()) {
                        cursor.moveToMark(mark);
                        this.processResult();
                        break;
                    }
                    else if (node != null) {
                        this.nodes.push(node);
                        if (node.endIndex === cursor.lastIndex()) {
                            this.processResult();
                            break;
                        }
                        cursor.next();
                    }
                }
            }
        }
    }
    processResult() {
        const endsOnDivider = this.nodes.length % 2 === 0;
        const noMatch = this.nodes.length === 0;
        const hasDivider = this._divider != null;
        this.cursor.resolveError();
        if ((hasDivider && endsOnDivider) || noMatch) {
            if (this._isOptional) {
                this.cursor.moveToMark(this.mark);
            }
            else {
                const parseError = new ParseError(`Did not find a repeating match of ${this.name}.`, this.mark, this);
                this.cursor.throwError(parseError);
            }
            this.node = null;
        }
        else {
            const value = this.nodes.map((node) => node.value).join("");
            this.node = new Node("repeat", this.name, this.nodes[0].startIndex, this.nodes[this.nodes.length - 1].endIndex, this.nodes, value);
            this.cursor.index = this.node.endIndex;
            this.cursor.addMatch(this, this.node);
        }
    }
    safelyGetCursor() {
        const cursor = this.cursor;
        if (cursor == null) {
            throw new Error("Couldn't find cursor.");
        }
        return cursor;
    }
    clone(name, isOptional) {
        if (name == null) {
            name = this.name;
        }
        if (isOptional == null) {
            isOptional = this._isOptional;
        }
        return new Repeat(name, this._pattern, this._divider, isOptional);
    }
    getTokens() {
        return this._pattern.getTokens();
    }
}

class Recursive extends Pattern {
    constructor(name, isOptional = false) {
        super("recursive", name, [], isOptional);
        this.pattern = null;
        this.isRecursing = false;
    }
    getPattern() {
        return this.climb(this.parent, (pattern) => {
            if (pattern == null) {
                return false;
            }
            return (pattern.type !== "recursive" &&
                pattern.name === this.name);
        });
    }
    climb(pattern, isMatch) {
        if (isMatch(pattern)) {
            return pattern;
        }
        else {
            if (pattern && pattern.parent != null) {
                return this.climb(pattern.parent, isMatch);
            }
            return null;
        }
    }
    parse(cursor) {
        if (this.pattern == null) {
            const pattern = this.getPattern();
            if (pattern == null) {
                if (!this._isOptional) {
                    cursor.throwError(new ParseError(`Couldn't find parent pattern to recursively parse, with the name ${this.name}.`, cursor.index, this));
                }
                return null;
            }
            this.pattern = pattern.clone();
            this.pattern.parent = this;
        }
        const mark = cursor.mark();
        const node = this.pattern.parse(cursor);
        if (!cursor.hasUnresolvedError() && node != null) {
            cursor.addMatch(this, node);
        }
        if (cursor.hasUnresolvedError() && this._isOptional) {
            cursor.resolveError();
            cursor.moveToMark(mark);
        }
        return node;
    }
    clone(name, isOptional) {
        if (name == null) {
            name = this.name;
        }
        if (isOptional == null) {
            isOptional = this._isOptional;
        }
        return new Recursive(name, isOptional);
    }
    getTokens() {
        var _a;
        return ((_a = this.getPattern()) === null || _a === void 0 ? void 0 : _a.getTokens()) || [];
    }
}

class Reference extends Pattern {
    constructor(name, isOptional = false) {
        super("reference", name, [], isOptional);
    }
    getRoot() {
        let node = this.parent;
        while (node != null) {
            if (node.parent == null) {
                return node;
            }
            node = node.parent;
        }
        return node;
    }
    findPattern() {
        const root = this.getRoot();
        let result = null;
        if (root == null) {
            return null;
        }
        this.walkTheTree(root, (pattern) => {
            if (pattern.name === this.name &&
                pattern != this &&
                pattern.type != "reference") {
                result = pattern;
                return false;
            }
            return true;
        });
        return result;
    }
    walkTheTree(pattern, callback) {
        for (let x = 0; x < pattern.children.length; x++) {
            const p = pattern.children[x];
            const continueWalking = this.walkTheTree(p, callback);
            if (!continueWalking) {
                return false;
            }
        }
        return callback(pattern);
    }
    parse(cursor) {
        const mark = cursor.mark();
        try {
            const node = this.safelyGetPattern().parse(cursor);
            if (!cursor.hasUnresolvedError() && node != null) {
                cursor.addMatch(this, node);
            }
            if (cursor.hasUnresolvedError() && this._isOptional) {
                cursor.resolveError();
                cursor.moveToMark(mark);
            }
            return node;
        }
        catch (error) {
            if (this._isOptional) {
                cursor.moveToMark(mark);
            }
            else {
                cursor.throwError(new ParseError(`Couldn't find reference pattern to parse, with the name ${this.name}.`, cursor.index, this));
            }
            return null;
        }
    }
    clone(name, isOptional) {
        if (name == null) {
            name = this.name;
        }
        if (isOptional == null) {
            isOptional = this._isOptional;
        }
        return new Reference(name, isOptional);
    }
    safelyGetPattern() {
        let pattern = this.children[0];
        const hasNoPattern = pattern == null;
        if (hasNoPattern) {
            const reference = this.findPattern();
            if (reference == null) {
                throw new Error(`Couldn't find reference pattern, with the name ${this.name}.`);
            }
            pattern = reference;
            this.children = [pattern];
        }
        return pattern;
    }
    getTokens() {
        return this.safelyGetPattern().getTokens();
    }
}

class TextSuggester {
    constructor() {
        this.cursor = null;
        this.result = null;
        this.text = "";
        this.match = null;
        this.error = null;
        this.patternMatch = null;
        this.matchedText = "";
        this.rootPattern = null;
        this.tokens = {
            startIndex: 0,
            values: [],
        };
        this.options = [];
        this.parseStack = [];
    }
    suggest(text, pattern) {
        var _a, _b, _c;
        this.reset();
        this.text = text;
        this.rootPattern = pattern;
        // If no text all options are available.
        if (text.length === 0) {
            return {
                pattern: null,
                astNode: null,
                match: null,
                error: null,
                options: {
                    startIndex: 0,
                    values: pattern.getTokens(),
                },
                isComplete: false,
                parseStack: [],
            };
        }
        this.parse();
        this.saveParseStack();
        this.saveMatchedText();
        this.saveMatch();
        this.saveError();
        this.saveOptions();
        this.saveNextToken();
        return {
            pattern: ((_a = this.patternMatch) === null || _a === void 0 ? void 0 : _a.pattern) || null,
            astNode: ((_b = this.patternMatch) === null || _b === void 0 ? void 0 : _b.astNode) || null,
            match: this.match,
            error: this.error,
            options: this.tokens,
            isComplete: ((_c = this.cursor) === null || _c === void 0 ? void 0 : _c.didSuccessfullyParse()) || false,
            parseStack: this.parseStack,
        };
    }
    reset() {
        this.cursor = null;
        this.result = null;
        this.text = "";
        this.match = null;
        this.error = null;
        this.patternMatch = null;
        this.matchedText = "";
        this.rootPattern = null;
        this.tokens = {
            startIndex: 0,
            values: [],
        };
        this.options = [];
        this.parseStack = [];
    }
    parse() {
        var _a;
        this.rootPattern = this.rootPattern;
        this.cursor = new Cursor(this.text || "");
        this.cursor.startRecording();
        this.result = ((_a = this.rootPattern) === null || _a === void 0 ? void 0 : _a.parse(this.cursor)) || null;
        this.patternMatch = this.cursor.lastMatch;
    }
    saveParseStack() {
        var _a;
        this.parseStack = ((_a = this.cursor) === null || _a === void 0 ? void 0 : _a.history.getLastParseStack()) || [];
    }
    saveMatchedText() {
        var _a, _b;
        if (((_a = this.patternMatch) === null || _a === void 0 ? void 0 : _a.astNode) != null) {
            this.matchedText =
                ((_b = this.text) === null || _b === void 0 ? void 0 : _b.substring(0, this.patternMatch.astNode.endIndex + 1)) || "";
        }
    }
    saveMatch() {
        var _a;
        const node = (_a = this.patternMatch) === null || _a === void 0 ? void 0 : _a.astNode;
        if (node == null) {
            this.match = null;
            return;
        }
        let endIndex = this.matchedText.length - 1;
        this.match = {
            text: this.matchedText,
            startIndex: 0,
            endIndex: endIndex,
        };
    }
    saveError() {
        var _a;
        if (((_a = this.patternMatch) === null || _a === void 0 ? void 0 : _a.astNode) == null) {
            this.error = {
                startIndex: 0,
                endIndex: this.text.length - 1,
                text: this.text,
            };
            return this;
        }
        if (this.patternMatch != null &&
            this.text.length > this.matchedText.length) {
            const difference = this.text.length - this.matchedText.length;
            const startIndex = this.patternMatch.astNode.endIndex + 1;
            const endIndex = startIndex + difference - 1;
            this.error = {
                startIndex: startIndex,
                endIndex: endIndex,
                text: this.text.substring(startIndex, endIndex + 1),
            };
            return;
        }
        else {
            this.error = null;
            return;
        }
    }
    saveNextToken() {
        var _a, _b, _c, _d;
        const isCompleteMatch = ((_a = this.patternMatch) === null || _a === void 0 ? void 0 : _a.pattern) === this.rootPattern &&
            ((_b = this.cursor) === null || _b === void 0 ? void 0 : _b.didSuccessfullyParse());
        const noMatch = ((_c = this.patternMatch) === null || _c === void 0 ? void 0 : _c.astNode) == null;
        const noOptions = this.options.length === 0;
        if (isCompleteMatch && noOptions) {
            this.tokens = null;
            return;
        }
        if (noMatch) {
            let options = (_d = this.rootPattern) === null || _d === void 0 ? void 0 : _d.getTokens();
            options = options === null || options === void 0 ? void 0 : options.filter((option) => {
                return option.indexOf(this.text) === 0;
            });
            if ((options === null || options === void 0 ? void 0 : options.length) === 0) {
                this.tokens = null;
                return;
            }
            const values = options === null || options === void 0 ? void 0 : options.map((option) => {
                const parts = option.split(this.text);
                return parts[1];
            });
            this.tokens = {
                startIndex: 0,
                values: values || [],
            };
            this.matchedText = this.text;
            this.match = {
                text: this.text,
                startIndex: 0,
                endIndex: this.text.length - 1,
            };
            this.error = null;
            return;
        }
        const options = this.options;
        let startIndex = this.matchedText.length;
        if (this.matchedText.length < this.text.length) {
            const leftOver = this.text.substring(this.matchedText.length);
            const partialMatchOptions = options
                .filter((option) => {
                return option.indexOf(leftOver) === 0;
            })
                .map((option) => {
                return option.substring(leftOver.length);
            });
            if (partialMatchOptions.length === 0) {
                this.tokens = null;
                return;
            }
            else {
                if (this.match == null) {
                    return;
                }
                this.match = {
                    text: this.match.text + leftOver,
                    startIndex: this.match.startIndex,
                    endIndex: this.match.endIndex + leftOver.length,
                };
                this.error = null;
                this.tokens = {
                    startIndex: this.match.endIndex + 1,
                    values: partialMatchOptions,
                };
                return;
            }
        }
        this.tokens = {
            startIndex,
            values: options,
        };
    }
    saveOptions() {
        const parents = new Map();
        const cursor = this.cursor;
        if (cursor == null) {
            this.options = [];
            return;
        }
        const furthestMatches = cursor.history.astNodes.reduce((acc, node, index) => {
            const pattern = cursor.history.patterns[index];
            const parent = pattern.parent;
            if (parent != null) {
                parents.set(parent, parent);
            }
            if (parents.has(pattern)) {
                return acc;
            }
            if (node.endIndex === acc.furthestTextIndex) {
                acc.nodeIndexes.push(index);
            }
            else if (node.endIndex > acc.furthestTextIndex) {
                acc.furthestTextIndex = node.endIndex;
                acc.nodeIndexes = [index];
            }
            return acc;
        }, { furthestTextIndex: -1, nodeIndexes: [] });
        const matches = furthestMatches.nodeIndexes.reduce((acc, index) => {
            var _a;
            const pattern = (_a = this.cursor) === null || _a === void 0 ? void 0 : _a.history.patterns[index];
            const tokens = pattern === null || pattern === void 0 ? void 0 : pattern.getNextTokens();
            tokens === null || tokens === void 0 ? void 0 : tokens.forEach((token) => {
                acc[token] = true;
            });
            return acc;
        }, {});
        this.options = Object.keys(matches);
    }
    static suggest(text, pattern) {
        return new TextSuggester().suggest(text, pattern);
    }
}

class Visitor {
    constructor(root = null, selectedNodes = []) {
        this.root = root;
        this.selectedNodes = selectedNodes;
    }
    flatten() {
        this.selectedNodes.forEach((node) => {
            if (node.children.length > 0) {
                const children = [];
                Visitor.walkUp(node, (descendant) => {
                    if (descendant.children.length === 0) {
                        children.push(descendant);
                    }
                });
                node.children = children;
            }
        });
        return this;
    }
    remove() {
        if (this.root == null) {
            return this;
        }
        this.recursiveRemove(this.root);
        return this;
    }
    recursiveRemove(node) {
        const nodesToRemove = this.selectedNodes;
        for (let x = 0; x < node.children.length; x++) {
            if (nodesToRemove.indexOf(node.children[x]) > -1) {
                node.children.splice(x, 1);
                x--;
            }
            else {
                this.recursiveRemove(node.children[x]);
            }
        }
    }
    wrap(callback) {
        const visitor = new Visitor(this.root);
        visitor.selectRoot().transform((node) => {
            if (this.selectedNodes.includes(node)) {
                return callback(node);
            }
            return node;
        });
        return this;
    }
    unwrap() {
        if (this.root == null) {
            return this;
        }
        Visitor.walkDown(this.root, (node, stack) => {
            if (this.selectedNodes.includes(node)) {
                const parent = stack[stack.length - 1];
                const grandParent = stack[stack.length - 2];
                if (parent != null && grandParent != null) {
                    const index = grandParent.children.indexOf(parent);
                    if (index > -1) {
                        grandParent.children.splice(index, 1, ...parent.children);
                    }
                }
            }
        });
        return this;
    }
    prepend(callback) {
        if (this.root == null) {
            return this;
        }
        Visitor.walkUp(this.root, (node, stack) => {
            if (this.selectedNodes.includes(node)) {
                const parent = stack[stack.length - 1];
                if (parent != null) {
                    const index = parent.children.indexOf(node);
                    if (index > -1) {
                        parent.children.splice(index, 0, callback(node));
                    }
                }
            }
        });
        return this;
    }
    append(callback) {
        if (this.root == null) {
            return this;
        }
        Visitor.walkDown(this.root, (node, stack) => {
            if (this.selectedNodes.includes(node)) {
                const parent = stack[stack.length - 1];
                if (parent != null) {
                    const index = parent.children.indexOf(node);
                    if (index > -1) {
                        parent.children.splice(index + 1, 0, callback(node));
                    }
                }
            }
        });
        return this;
    }
    transform(callback) {
        this.selectedNodes.forEach((node) => {
            return this.recursiveTransform(node, callback);
        });
        return this;
    }
    recursiveTransform(node, callback) {
        const length = node.children.length;
        for (let x = 0; x < length; x++) {
            node.children[x] = this.recursiveTransform(node.children[x], callback);
        }
        return callback(node);
    }
    selectAll() {
        return this.select((n) => true);
    }
    selectNode(node) {
        return new Visitor(this.root, [...this.selectedNodes, node]);
    }
    deselectNode(node) {
        const visitor = new Visitor(this.root, this.selectedNodes.slice());
        return visitor.filter((n) => n !== node);
    }
    select(callback) {
        if (this.root == null) {
            return this;
        }
        const node = this.root;
        const selectedNodes = [];
        if (node.children.length > 0) {
            Visitor.walkDown(node, (descendant) => {
                if (callback(descendant)) {
                    selectedNodes.push(descendant);
                }
            });
        }
        return new Visitor(this.root, selectedNodes);
    }
    forEach(callback) {
        this.selectedNodes.forEach(callback);
        return this;
    }
    filter(callback) {
        return new Visitor(this.root, this.selectedNodes.filter(callback));
    }
    map(callback) {
        return new Visitor(this.root, this.selectedNodes.map(callback));
    }
    selectRoot() {
        if (this.root == null) {
            return this;
        }
        return new Visitor(this.root, [this.root]);
    }
    first() {
        return this.get(0);
    }
    last() {
        return this.get(this.selectedNodes.length - 1);
    }
    get(index) {
        const node = this.selectedNodes[index];
        if (node == null) {
            throw new Error(`Couldn't find node at index: ${index}, out of ${this.selectedNodes.length}.`);
        }
        return new Visitor(node, []);
    }
    clear() {
        this.selectedNodes = [];
        return this;
    }
    setRoot(root) {
        this.root = root;
        return this;
    }
    static select(root, callback) {
        if (callback != null) {
            return new Visitor(root).select(callback);
        }
        else {
            return new Visitor(root);
        }
    }
    static walkUp(node, callback, ancestors = []) {
        ancestors.push(node);
        if (node.children.length > 0) {
            const children = node.children.slice();
            children.forEach((c) => this.walkUp(c, callback, ancestors));
        }
        ancestors.pop();
        callback(node, ancestors);
        return this;
    }
    static walkDown(node, callback, ancestors = []) {
        callback(node, ancestors);
        ancestors.push(node);
        if (node.children.length > 0) {
            const children = node.children.slice();
            children.forEach((c) => this.walkDown(c, callback, ancestors));
        }
        ancestors.pop();
        return this;
    }
}

export { And, Cursor, Literal, LookAhead, Node, Not, Or, ParseError, Pattern, Recursive, Reference, Regex, Repeat, TextSuggester, Visitor };
//# sourceMappingURL=index.esm.js.map
