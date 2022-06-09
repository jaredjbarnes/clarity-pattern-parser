import Pattern from "./Pattern";
import ParserError from "./ParseError";
export default class RecursivePattern extends Pattern {
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
                cursor.throwError(new ParserError(`Couldn't find parent pattern to recursively parse, with the name ${this.name}.`, cursor.index, this));
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
//# sourceMappingURL=RecursivePattern.js.map