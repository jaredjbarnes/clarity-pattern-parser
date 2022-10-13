import ValuePattern from "./ValuePattern";
import ValueNode from "../../ast/ValueNode";
import ParseError from "../../patterns/ParseError";
import OptionalValue from "./OptionalValue";
import Permutor from "../../Permutor";
const permutor = new Permutor();
export default class AndValue extends ValuePattern {
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
//# sourceMappingURL=AndValue.js.map