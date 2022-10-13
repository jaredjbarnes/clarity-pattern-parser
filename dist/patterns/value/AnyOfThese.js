import ValuePattern from "./ValuePattern";
import ParseError from "../ParseError";
import ValueNode from "../../ast/ValueNode";
export default class AnyOfThese extends ValuePattern {
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
//# sourceMappingURL=AnyOfThese.js.map