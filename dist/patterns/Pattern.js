import Cursor from "../Cursor";
export default class Pattern {
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
//# sourceMappingURL=Pattern.js.map