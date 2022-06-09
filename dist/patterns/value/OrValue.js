import ValuePattern from "./ValuePattern";
import ValueNode from "../../ast/ValueNode";
import OptionalValue from "./OptionalValue";
export default class OrValue extends ValuePattern {
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
//# sourceMappingURL=OrValue.js.map