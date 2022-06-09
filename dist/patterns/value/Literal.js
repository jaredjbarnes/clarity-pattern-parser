import ParseError from "../ParseError";
import ValueNode from "../../ast/ValueNode";
import ValuePattern from "./ValuePattern";
export default class Literal extends ValuePattern {
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
//# sourceMappingURL=Literal.js.map