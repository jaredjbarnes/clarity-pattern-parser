'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class Node {
    constructor(type, name, startIndex, endIndex, isComposite = false) {
        this.children = [];
        this.value = "";
        this.type = type;
        this.name = name;
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.isComposite = isComposite;
        if (typeof this.startIndex !== "number" ||
            typeof this.endIndex !== "number") {
            throw new Error("Invalid Arguments: startIndex and endIndex need to be number.");
        }
    }
}

class CompositeNode extends Node {
    constructor(type, name, startIndex = 0, endIndex = 0) {
        super(type, name, startIndex, endIndex, true);
    }
    clone() {
        const node = new CompositeNode(this.type, this.name, this.startIndex, this.endIndex);
        node.children = this.children.map((child) => {
            return child.clone();
        });
        return node;
    }
    toString() {
        return this.children.map((child) => child.toString()).join("");
    }
}

class ValueNode extends Node {
    constructor(type, name, value, startIndex = 0, endIndex = 0) {
        super(type, name, startIndex, endIndex);
        this.value = value;
    }
    clone() {
        return new ValueNode(this.type, this.name, this.value || "", this.startIndex, this.endIndex);
    }
    toString() {
        return this.value || "";
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
    constructor(type = "", name, children = []) {
        this._type = type;
        this._name = name;
        this._children = [];
        this._parent = null;
        this.isSequence = false;
        this._assertName();
        this.children = children;
    }
    _assertName() {
        if (typeof this.name !== "string") {
            throw new Error("Invalid Argument: Patterns needs to have a name that's a string.");
        }
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
        if (value instanceof Pattern) {
            this._parent = value;
        }
    }
    get children() {
        return this._children;
    }
    set children(value) {
        this._children = value;
        this._cloneChildren();
        this._assertChildren();
        this._assignAsParent();
    }
    _assertChildren() {
        // Empty,can be overridden by subclasses.
    }
    _cloneChildren() {
        // We need to clone the patterns so nested patterns can be parsed.
        this._children = this._children.map((pattern) => {
            if (!(pattern instanceof Pattern)) {
                throw new Error(`The ${this.name} pattern has an invalid child pattern.`);
            }
            return pattern.clone();
        });
        // We need to freeze the children so they aren't modified.
        Object.freeze(this._children);
    }
    _assignAsParent() {
        this._children.forEach((child) => (child.parent = this));
    }
    getNextTokens() {
        var _a, _b, _c;
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
                    return siblings[0].getTokens().concat(tokens);
                }
                else {
                    return this.getTokens().concat(tokens);
                }
            }
            // Another thing I don't like.
            if (((_b = (_a = this._parent) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.indexOf("and")) === 0 &&
                nextSibling != null &&
                ((_c = nextSibling === null || nextSibling === void 0 ? void 0 : nextSibling.type) === null || _c === void 0 ? void 0 : _c.indexOf("optional")) === 0) {
                let tokens = [];
                for (let x = index + 1; x < siblings.length; x++) {
                    const child = siblings[x];
                    if (child.type.indexOf("optional") === 0) {
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
    getTokenValue() {
        return null;
    }
}

class ValuePattern extends Pattern {
    constructor(type, name, children = []) {
        super(type, name, children);
    }
}

class RegexValue extends ValuePattern {
    constructor(name, regex) {
        super("regex-value", name);
        this.node = null;
        this.substring = "";
        this.regexString = regex;
        this.regex = new RegExp(`^${regex}`, "g");
        this._assertArguments();
    }
    _assertArguments() {
        if (typeof this.regexString !== "string") {
            throw new Error("Invalid Arguments: The regex argument needs to be a string of regex.");
        }
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
        this._reset(cursor);
        this._tryPattern();
        return this.node;
    }
    _reset(cursor) {
        this.cursor = cursor;
        this.regex.lastIndex = 0;
        this.substring = this.cursor.text.substr(this.cursor.getIndex());
        this.node = null;
    }
    _tryPattern() {
        const result = this.regex.exec(this.substring);
        if (result != null && result.index === 0) {
            const currentIndex = this.cursor.getIndex();
            const newIndex = currentIndex + result[0].length - 1;
            this.node = new ValueNode("regex-value", this.name, result[0], currentIndex, newIndex);
            this.cursor.index = newIndex;
            this.cursor.addMatch(this, this.node);
        }
        else {
            this._processError();
        }
    }
    _processError() {
        const message = `ParseError: Expected regex pattern of '${this.regexString}' but found '${this.substring}'.`;
        const parseError = new ParseError(message, this.cursor.getIndex(), this);
        this.cursor.throwError(parseError);
    }
    clone(name) {
        if (typeof name !== "string") {
            name = this.name;
        }
        return new RegexValue(name, this.regexString);
    }
    getTokenValue() {
        return this.name;
    }
    getTokens() {
        return [this.name];
    }
}

class OptionalValue extends ValuePattern {
    constructor(pattern) {
        super("optional-value", "optional-value", [pattern]);
        this._assertArguments();
    }
    _assertArguments() {
        if (!(this.children[0] instanceof ValuePattern)) {
            throw new Error("Invalid Arguments: Expected a ValuePattern.");
        }
    }
    parse(cursor) {
        const mark = cursor.mark();
        const node = this.children[0].parse(cursor);
        if (cursor.hasUnresolvedError() || node == null) {
            cursor.resolveError();
            cursor.moveToMark(mark);
            return null;
        }
        else {
            cursor.addMatch(this, node);
            return node;
        }
    }
    clone() {
        return new OptionalValue(this.children[0]);
    }
    getTokens() {
        return this._children[0].getTokens();
    }
}

class AndValue extends ValuePattern {
    constructor(name, patterns) {
        super("and-value", name, patterns);
        this.index = 0;
        this.nodes = [];
        this.node = null;
        this.mark = 0;
        this._assertArguments();
    }
    _assertArguments() {
        if (this._children.length < 2) {
            throw new Error("Invalid Argument: AndValue needs to have more than one value pattern.");
        }
    }
    _reset(cursor) {
        this.index = 0;
        this.nodes = [];
        this.node = null;
        this.cursor = cursor;
        this.mark = this.cursor.mark();
    }
    parse(cursor) {
        this._reset(cursor);
        this._tryPatterns();
        return this.node;
    }
    _tryPatterns() {
        while (true) {
            const pattern = this._children[this.index];
            const node = pattern.parse(this.cursor);
            if (this.cursor.hasUnresolvedError()) {
                break;
            }
            else {
                this.nodes.push(node);
            }
            if (!this._next()) {
                this._processValue();
                break;
            }
        }
    }
    _next() {
        if (this._hasMorePatterns()) {
            if (this.cursor.hasNext()) {
                // If the last result was a failed optional, then don't increment the cursor.
                if (this.nodes[this.nodes.length - 1] != null) {
                    this.cursor.next();
                }
                this.index++;
                return true;
            }
            else if (this.nodes[this.nodes.length - 1] == null) {
                this.index++;
                return true;
            }
            this._assertRestOfPatternsAreOptional();
            return false;
        }
        else {
            return false;
        }
    }
    _hasMorePatterns() {
        return this.index + 1 < this._children.length;
    }
    _assertRestOfPatternsAreOptional() {
        const areTheRestOptional = this.children.every((pattern, index) => {
            return index <= this.index || pattern instanceof OptionalValue;
        });
        if (!areTheRestOptional) {
            const parseError = new ParseError(`Could not match ${this.name} before string ran out.`, this.index, this);
            this.cursor.throwError(parseError);
        }
    }
    _processValue() {
        if (this.cursor.hasUnresolvedError()) {
            this.node = null;
        }
        else {
            this.nodes = this.nodes.filter((node) => node != null);
            const lastNode = this.nodes[this.nodes.length - 1];
            const startIndex = this.mark;
            const endIndex = lastNode.endIndex;
            const value = this.nodes.map((node) => node.value).join("");
            this.node = new ValueNode("and-value", this.name, value, startIndex, endIndex);
            this.cursor.index = this.node.endIndex;
            this.cursor.addMatch(this, this.node);
        }
    }
    clone(name) {
        if (typeof name !== "string") {
            name = this.name;
        }
        return new AndValue(name, this._children);
    }
    getTokens() {
        let tokens = [];
        for (let x = 0; x < this._children.length; x++) {
            const child = this._children[x];
            if (child instanceof OptionalValue) {
                tokens = tokens.concat(child.getTokens());
            }
            else {
                tokens = tokens.concat(child.getTokens());
                break;
            }
        }
        return tokens;
    }
}

class AnyOfThese extends ValuePattern {
    constructor(name, characters) {
        super("any-of-these", name);
        this.node = null;
        this.mark = 0;
        this.characters = characters;
        this._assertArguments();
    }
    _assertArguments() {
        if (typeof this.characters !== "string") {
            throw new Error("Invalid Arguments: The characters argument needs to be a string of characters.");
        }
        if (this.characters.length < 1) {
            throw new Error("Invalid Arguments: The characters argument needs to be at least one character long.");
        }
    }
    parse(cursor) {
        this._reset(cursor);
        this._tryPattern();
        return this.node;
    }
    _reset(cursor) {
        this.cursor = cursor;
        this.mark = this.cursor.mark();
        this.node = null;
    }
    _tryPattern() {
        if (this._isMatch()) {
            const value = this.cursor.getChar();
            const index = this.cursor.getIndex();
            this.node = new ValueNode("any-of-these", this.name, value, index, index);
            this.cursor.addMatch(this, this.node);
        }
        else {
            this._processError();
        }
    }
    _isMatch() {
        return this.characters.indexOf(this.cursor.getChar()) > -1;
    }
    _processError() {
        const message = `ParseError: Expected one of these characters, '${this.characters}' but found '${this.cursor.getChar()}' while parsing for '${this.name}'.`;
        const parseError = new ParseError(message, this.cursor.getIndex(), this);
        this.cursor.throwError(parseError);
    }
    clone(name) {
        if (typeof name !== "string") {
            name = this.name;
        }
        return new AnyOfThese(name, this.characters);
    }
    getTokens() {
        return this.characters.split("");
    }
}

class Literal extends ValuePattern {
    constructor(name, literal) {
        super("literal", name);
        this.node = null;
        this.mark = 0;
        this.substring = "";
        this.literal = literal;
        this._assertArguments();
    }
    _assertArguments() {
        if (typeof this.literal !== "string") {
            throw new Error("Invalid Arguments: The literal argument needs to be a string of characters.");
        }
        if (this.literal.length < 1) {
            throw new Error("Invalid Arguments: The literalString argument needs to be at least one character long.");
        }
    }
    parse(cursor) {
        this._reset(cursor);
        this._tryPattern();
        return this.node;
    }
    _reset(cursor) {
        this.cursor = cursor;
        this.mark = this.cursor.mark();
        this.substring = this.cursor.text.substring(this.mark, this.mark + this.literal.length);
        this.node = null;
    }
    _tryPattern() {
        if (this.substring === this.literal) {
            this._processMatch();
        }
        else {
            this._processError();
        }
    }
    _processError() {
        const message = `ParseError: Expected '${this.literal}' but found '${this.substring}'.`;
        const parseError = new ParseError(message, this.cursor.getIndex(), this);
        this.cursor.throwError(parseError);
    }
    _processMatch() {
        this.node = new ValueNode("literal", this.name, this.substring, this.mark, this.mark + this.literal.length - 1);
        this.cursor.index = this.node.endIndex;
        this.cursor.addMatch(this, this.node);
    }
    clone(name) {
        if (typeof name !== "string") {
            name = this.name;
        }
        return new Literal(name, this.literal);
    }
    getTokenValue() {
        return this.literal;
    }
    getTokens() {
        return [this.getTokenValue()];
    }
}

class NotValue extends ValuePattern {
    constructor(name, pattern) {
        super("not-value", name, [pattern]);
        this.match = "";
        this.node = null;
        this.mark = 0;
        this._assertArguments();
    }
    _assertArguments() {
        if (!(this.children[0] instanceof Pattern)) {
            throw new Error("Invalid Arguments: Expected the pattern to be a ValuePattern.");
        }
        if (typeof this.name !== "string") {
            throw new Error("Invalid Arguments: Expected name to be a string.");
        }
    }
    _reset(cursor) {
        this.match = "";
        this.node = null;
        this.cursor = cursor;
        this.mark = this.cursor.mark();
    }
    parse(cursor) {
        this._reset(cursor);
        this._tryPattern();
        return this.node;
    }
    _tryPattern() {
        while (true) {
            const mark = this.cursor.mark();
            this.children[0].parse(this.cursor);
            if (this.cursor.hasUnresolvedError()) {
                this.cursor.resolveError();
                this.cursor.moveToMark(mark);
                this.match += this.cursor.getChar();
                break;
            }
            else {
                this.cursor.moveToMark(mark);
                break;
            }
        }
        this._processMatch();
    }
    _processMatch() {
        if (this.match.length === 0) {
            const parseError = new ParseError(`Didn't find any characters that didn't match the ${this.children[0].name} pattern.`, this.mark, this);
            this.cursor.throwError(parseError);
        }
        else {
            this.node = new ValueNode("not-value", this.name, this.match, this.mark, this.mark);
            this.cursor.index = this.node.endIndex;
            this.cursor.addMatch(this, this.node);
        }
    }
    clone(name) {
        if (typeof name !== "string") {
            name = this.name;
        }
        return new NotValue(name, this.children[0]);
    }
    getTokens() {
        return [];
    }
}

class OrValue extends ValuePattern {
    constructor(name, patterns) {
        super("or-value", name, patterns);
        this.index = 0;
        this.errors = [];
        this.node = null;
        this.mark = 0;
        this.parseError = null;
        this._assertArguments();
    }
    _assertArguments() {
        if (this._children.length < 2) {
            throw new Error("Invalid Argument: OrValue needs to have more than one value pattern.");
        }
        const hasOptionalChildren = this._children.some((pattern) => pattern instanceof OptionalValue);
        if (hasOptionalChildren) {
            throw new Error("OrValues cannot have optional values.");
        }
    }
    _reset(cursor) {
        this.index = 0;
        this.errors = [];
        this.node = null;
        this.cursor = cursor;
        this.mark = cursor.mark();
    }
    parse(cursor) {
        this._reset(cursor);
        this._tryPattern();
        return this.node;
    }
    _tryPattern() {
        while (true) {
            const pattern = this._children[this.index];
            const node = pattern.parse(this.cursor);
            if (this.cursor.hasUnresolvedError()) {
                if (this.index + 1 < this._children.length) {
                    this.cursor.resolveError();
                    this.index++;
                    this.cursor.moveToMark(this.mark);
                }
                else {
                    this.node = null;
                    break;
                }
            }
            else {
                this.node = new ValueNode("or-value", this.name, node.value, node.startIndex, node.endIndex);
                this.cursor.index = this.node.endIndex;
                this.cursor.addMatch(this, this.node);
                break;
            }
        }
    }
    clone(name) {
        if (typeof name !== "string") {
            name = this.name;
        }
        return new OrValue(name, this._children);
    }
    getTokens() {
        const tokens = this._children.map((c) => c.getTokens());
        const hasPrimitiveTokens = tokens.every((t) => t.every((value) => typeof value === "string"));
        if (hasPrimitiveTokens && tokens.length > 0) {
            return tokens.reduce((acc, t) => acc.concat(t), []);
        }
        return this._children[0].getTokens();
    }
}

class RepeatValue extends ValuePattern {
    constructor(name, pattern, divider) {
        super("repeat-value", name, divider != null ? [pattern, divider] : [pattern]);
        this.nodes = [];
        this.mark = 0;
        this.node = null;
        this._pattern = this.children[0];
        this._divider = this.children[1];
        this._assertArguments();
    }
    _assertArguments() {
        if (this._pattern instanceof OptionalValue) {
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
        this._tryPattern();
        return this.node;
    }
    _tryPattern() {
        while (true) {
            const node = this._pattern.parse(this.cursor);
            if (this.cursor.hasUnresolvedError()) {
                this._processMatch();
                break;
            }
            else {
                this.nodes.push(node);
                if (node.endIndex === this.cursor.lastIndex()) {
                    this._processMatch();
                    break;
                }
                this.cursor.next();
                if (this._divider != null) {
                    const mark = this.cursor.mark();
                    const node = this._divider.parse(this.cursor);
                    if (this.cursor.hasUnresolvedError()) {
                        this.cursor.moveToMark(mark);
                        this._processMatch();
                        break;
                    }
                    else {
                        this.nodes.push(node);
                        this.cursor.next();
                    }
                }
            }
        }
    }
    _processMatch() {
        this.cursor.resolveError();
        if (this.nodes.length === 0) {
            const parseError = new ParseError(`Did not find a repeating match of ${this.name}.`, this.mark, this);
            this.cursor.throwError(parseError);
            this.node = null;
        }
        else {
            const value = this.nodes.map((node) => node.value).join("");
            this.node = new ValueNode("repeat-value", this.name, value, this.nodes[0].startIndex, this.nodes[this.nodes.length - 1].endIndex);
            this.cursor.index = this.node.endIndex;
            this.cursor.addMatch(this, this.node);
        }
    }
    clone(name) {
        if (typeof name !== "string") {
            name = this.name;
        }
        return new RepeatValue(name, this._pattern, this._divider);
    }
    getTokens() {
        return this._pattern.getTokens();
    }
}

class CompositePattern extends Pattern {
    constructor(type, name, children = []) {
        super(type, name, children);
    }
}

class OptionalComposite extends CompositePattern {
    constructor(pattern) {
        super("optional-composite", "optional-composite", [pattern]);
    }
    parse(cursor) {
        const mark = cursor.mark();
        this.mark = mark;
        const node = this.children[0].parse(cursor);
        if (cursor.hasUnresolvedError()) {
            cursor.resolveError();
            cursor.moveToMark(mark);
            return null;
        }
        else {
            if (node != null) {
                cursor.addMatch(this, node);
            }
            return node;
        }
    }
    clone() {
        return new OptionalComposite(this.children[0]);
    }
    getTokens() {
        return this._children[0].getTokens();
    }
}

class AndComposite extends CompositePattern {
    constructor(name, patterns = []) {
        super("and-composite", name, patterns);
        this._assertArguments();
    }
    _assertArguments() {
        if (this._children.length < 2) {
            throw new Error("Invalid Argument: AndValue needs to have more than one value pattern.");
        }
    }
    _reset(cursor) {
        this.index = 0;
        this.nodes = [];
        this.node = null;
        this.cursor = cursor;
        this.mark = this.cursor.mark();
    }
    parse(cursor) {
        this._reset(cursor);
        this._tryPatterns();
        return this.node;
    }
    _tryPatterns() {
        while (true) {
            const pattern = this._children[this.index];
            const node = pattern.parse(this.cursor);
            if (this.cursor.hasUnresolvedError()) {
                this.cursor.moveToMark(this.mark);
                break;
            }
            else {
                this.nodes.push(node);
            }
            if (!this._next()) {
                this._processValue();
                break;
            }
        }
    }
    _next() {
        if (this._hasMorePatterns()) {
            if (this.cursor.hasNext()) {
                // If the last result was a failed optional, then don't increment the cursor.
                if (this.nodes[this.nodes.length - 1] != null) {
                    this.cursor.next();
                }
                this.index++;
                return true;
            }
            else if (this.nodes[this.nodes.length - 1] == null) {
                this.index++;
                return true;
            }
            this._assertRestOfPatternsAreOptional();
            return false;
        }
        else {
            return false;
        }
    }
    _hasMorePatterns() {
        return this.index + 1 < this._children.length;
    }
    _assertRestOfPatternsAreOptional() {
        const areTheRestOptional = this.children.every((pattern, index) => {
            return (index <= this.index ||
                pattern instanceof OptionalValue ||
                pattern instanceof OptionalComposite);
        });
        if (!areTheRestOptional) {
            const parseError = new ParseError(`Could not match ${this.name} before string ran out.`, this.index, this);
            this.cursor.throwError(parseError);
        }
    }
    _processValue() {
        if (!this.cursor.hasUnresolvedError()) {
            this.nodes = this.nodes.filter((node) => node != null);
            const lastNode = this.nodes[this.nodes.length - 1];
            const startIndex = this.mark;
            const endIndex = lastNode.endIndex;
            this.node = new CompositeNode("and-composite", this.name, startIndex, endIndex);
            this.node.children = this.nodes;
            this.cursor.index = this.node.endIndex;
            this.cursor.addMatch(this, this.node);
        }
        else {
            this.node = null;
        }
    }
    clone(name) {
        if (typeof name !== "string") {
            name = this.name;
        }
        return new AndComposite(name, this._children);
    }
    getTokens() {
        let tokens = [];
        for (let x = 0; x < this._children.length; x++) {
            const child = this._children[x];
            if (child instanceof OptionalValue ||
                child instanceof OptionalComposite) {
                tokens = tokens.concat(child.getTokens());
            }
            else {
                tokens = tokens.concat(child.getTokens());
                break;
            }
        }
        return tokens;
    }
}

class OrComposite extends CompositePattern {
    constructor(name, patterns) {
        super("or-composite", name, patterns);
        this._assertArguments();
    }
    _assertArguments() {
        if (this._children.length < 2) {
            throw new Error("Invalid Argument: OrValue needs to have more than one value pattern.");
        }
        const hasOptionalChildren = this._children.some((pattern) => pattern instanceof OptionalValue || pattern instanceof OptionalComposite);
        if (hasOptionalChildren) {
            throw new Error("OrComposite cannot have optional values.");
        }
    }
    _reset(cursor) {
        this.cursor = cursor;
        this.mark = null;
        this.index = 0;
        this.node = null;
        this.mark = cursor.mark();
    }
    parse(cursor) {
        this._reset(cursor);
        this._tryPattern();
        if (this.node != null) {
            this.cursor.addMatch(this, this.node);
        }
        return this.node;
    }
    _tryPattern() {
        while (true) {
            const pattern = this._children[this.index];
            this.node = pattern.parse(this.cursor);
            if (this.cursor.hasUnresolvedError()) {
                if (this.index + 1 < this._children.length) {
                    this.cursor.resolveError();
                    this.index++;
                    this.cursor.moveToMark(this.mark);
                }
                else {
                    this.node = null;
                    break;
                }
            }
            else {
                this.cursor.index = this.node.endIndex;
                break;
            }
        }
    }
    clone(name) {
        if (typeof name !== "string") {
            name = this.name;
        }
        return new OrComposite(name, this._children);
    }
    getTokens() {
        const tokens = this._children.map((c) => c.getTokens());
        const hasPrimitiveTokens = tokens.every((t) => t.every((value) => typeof value === "string"));
        if (hasPrimitiveTokens && tokens.length > 0) {
            return tokens.reduce((acc, t) => acc.concat(t), []);
        }
        return this._children[0].getTokens();
    }
}

class RepeatComposite extends CompositePattern {
    constructor(name, pattern, divider) {
        super("repeat-composite", name, divider != null ? [pattern, divider] : [pattern]);
        this.nodes = [];
        this.mark = 0;
        this.node = null;
        this._pattern = this.children[0];
        this._divider = this.children[1];
        this._assertArguments();
    }
    _assertArguments() {
        if (this._pattern instanceof OptionalComposite) {
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
        this._tryPattern();
        return this.node;
    }
    _tryPattern() {
        while (true) {
            const node = this._pattern.parse(this.cursor);
            if (this.cursor.hasUnresolvedError() || node == null) {
                this._processMatch();
                break;
            }
            else {
                this.nodes.push(node);
                if (node.endIndex === this.cursor.lastIndex()) {
                    this._processMatch();
                    break;
                }
                this.cursor.next();
                if (this._divider != null) {
                    const mark = this.cursor.mark();
                    const node = this._divider.parse(this.cursor);
                    if (this.cursor.hasUnresolvedError() || node == null) {
                        this.cursor.moveToMark(mark);
                        this._processMatch();
                        break;
                    }
                    else {
                        this.nodes.push(node);
                        this.cursor.next();
                    }
                }
            }
        }
    }
    _processMatch() {
        this.cursor.resolveError();
        if (this.nodes.length === 0) {
            this.cursor.throwError(new ParseError(`Did not find a repeating match of ${this.name}.`, this.mark, this));
            this.node = null;
        }
        else {
            this.node = new CompositeNode("repeat-composite", this.name, this.nodes[0].startIndex, this.nodes[this.nodes.length - 1].endIndex);
            this.node.children = this.nodes;
            this.cursor.index = this.node.endIndex;
            this.cursor.addMatch(this, this.node);
        }
    }
    clone(name) {
        if (typeof name !== "string") {
            name = this.name;
        }
        return new RepeatComposite(name, this._pattern, this._divider);
    }
    getTokens() {
        return this._pattern.getTokens();
    }
}

class RecursivePattern extends Pattern {
    constructor(name) {
        super("recursive", name);
        this.pattern = null;
        this.isRecursing = false;
    }
    getPattern() {
        return this._climb(this.parent, (pattern) => {
            if (pattern == null) {
                return false;
            }
            return pattern.name === this.name;
        });
    }
    _climb(pattern, isMatch) {
        if (isMatch(pattern)) {
            return pattern;
        }
        else {
            if (pattern && pattern.parent != null) {
                return this._climb(pattern.parent, isMatch);
            }
            return null;
        }
    }
    parse(cursor) {
        if (this.pattern == null) {
            const pattern = this.getPattern();
            if (pattern == null) {
                cursor.throwError(new ParseError(`Couldn't find parent pattern to recursively parse, with the name ${this.name}.`, cursor.index, this));
                return null;
            }
            this.pattern = pattern.clone();
            this.pattern.parent = this;
        }
        const node = this.pattern.parse(cursor);
        if (!cursor.hasUnresolvedError() && node != null) {
            cursor.addMatch(this, node);
        }
        return node;
    }
    clone(name) {
        if (typeof name !== "string") {
            name = this.name;
        }
        return new RecursivePattern(name);
    }
    getTokenValue() {
        var _a;
        return ((_a = this.getPattern()) === null || _a === void 0 ? void 0 : _a.getTokenValue()) || null;
    }
    getTokens() {
        var _a;
        if (!this.isRecursing) {
            this.isRecursing = true;
            const tokens = ((_a = this.getPattern()) === null || _a === void 0 ? void 0 : _a.getTokens()) || [];
            this.isRecursing = false;
            return tokens;
        }
        return [];
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
        if (((_a = this.patternMatch) === null || _a === void 0 ? void 0 : _a.pattern) === this.rootPattern &&
            ((_b = this.cursor) === null || _b === void 0 ? void 0 : _b.didSuccessfullyParse())) {
            this.tokens = null;
            return;
        }
        if (((_c = this.patternMatch) === null || _c === void 0 ? void 0 : _c.astNode) == null) {
            let options = (_d = this.rootPattern) === null || _d === void 0 ? void 0 : _d.getTokens();
            const parts = this.text.split(" ").filter((part) => {
                return part.length > 0;
            });
            options = options === null || options === void 0 ? void 0 : options.filter((option) => {
                return parts.some((part) => {
                    return option.indexOf(part) > -1;
                });
            });
            if ((options === null || options === void 0 ? void 0 : options.length) === 0) {
                this.tokens = null;
                return;
            }
            this.tokens = {
                startIndex: 0,
                values: options || [],
            };
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
        var _a;
        const furthestMatches = (_a = this.cursor) === null || _a === void 0 ? void 0 : _a.history.astNodes.reduce((acc, node, index) => {
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
    constructor(root, selectedNodes = []) {
        this.root = root;
        this.selectedNodes = selectedNodes;
    }
    flatten() {
        this.selectedNodes.forEach((node) => {
            if (node.isComposite) {
                const children = [];
                this.walkUp(node, (descendant) => {
                    if (!descendant.isComposite) {
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
        if (node.isComposite && Array.isArray(node.children)) {
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
        this.walkDown(this.root, (node, stack) => {
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
        this.walkUp(this.root, (node, stack) => {
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
        this.walkDown(this.root, (node, stack) => {
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
        if (node.isComposite && Array.isArray(node.children)) {
            const length = node.children.length;
            for (let x = 0; x < length; x++) {
                node.children[x] = this.recursiveTransform(node.children[x], callback);
            }
        }
        return callback(node);
    }
    walkUp(node, callback, ancestors = []) {
        ancestors.push(node);
        if (node.isComposite && Array.isArray(node.children)) {
            const children = node.children.slice();
            children.forEach((c) => this.walkUp(c, callback, ancestors));
        }
        ancestors.pop();
        callback(node, ancestors);
        return this;
    }
    walkDown(node, callback, ancestors = []) {
        callback(node, ancestors);
        ancestors.push(node);
        if (node.isComposite && Array.isArray(node.children)) {
            const children = node.children.slice();
            children.forEach((c) => this.walkDown(c, callback, ancestors));
        }
        ancestors.pop();
        return this;
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
        if (node.isComposite) {
            this.walkDown(node, (descendant) => {
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
    }
    static select(root, callback) {
        if (callback != null) {
            return new Visitor(root).select(callback);
        }
        else {
            return new Visitor(root);
        }
    }
}

exports.AndComposite = AndComposite;
exports.AndValue = AndValue;
exports.AnyOfThese = AnyOfThese;
exports.CompositeNode = CompositeNode;
exports.CompositePattern = CompositePattern;
exports.Cursor = Cursor;
exports.Literal = Literal;
exports.Node = Node;
exports.NotValue = NotValue;
exports.OptionalComposite = OptionalComposite;
exports.OptionalValue = OptionalValue;
exports.OrComposite = OrComposite;
exports.OrValue = OrValue;
exports.ParseError = ParseError;
exports.Pattern = Pattern;
exports.RecursivePattern = RecursivePattern;
exports.RegexValue = RegexValue;
exports.RepeatComposite = RepeatComposite;
exports.RepeatValue = RepeatValue;
exports.TextSuggester = TextSuggester;
exports.ValueNode = ValueNode;
exports.ValuePattern = ValuePattern;
exports.Visitor = Visitor;
//# sourceMappingURL=index.js.map
