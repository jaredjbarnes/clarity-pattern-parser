"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ValuePattern = _interopRequireDefault(require("./ValuePattern.js"));

var _ParseError = _interopRequireDefault(require("../ParseError.js"));

var _ValueNode = _interopRequireDefault(require("../../ast/ValueNode.js"));

var _Cursor = _interopRequireDefault(require("../../Cursor.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class AnyOfThese extends _ValuePattern.default {
  constructor(name, characters) {
    super();
    this.name = name;
    this.characters = characters;
    this.reset();
    this.assertArguments();
  }

  assertArguments() {
    if (typeof this.name !== "string") {
      throw new Error("Invalid Arguments: The name needs to be a string.");
    }

    if (typeof this.characters !== "string") {
      throw new Error("Invalid Arguments: The characters argument needs to be a string of characters.");
    }

    if (this.characters.length < 1) {
      throw new Error("Invalid Arguments: The characters argument needs to be at least one character long.");
    }
  }

  getName() {
    return this.name;
  }

  parse(cursor) {
    this.reset(cursor);
    this.assertCursor();
    this.tryPattern();
    return this.node;
  }

  assertCursor() {
    if (!(this.cursor instanceof _Cursor.default)) {
      throw new Error("Invalid Arguments: Expected a cursor.");
    }
  }

  reset(cursor) {
    if (cursor == null) {
      this.cursor = null;
      this.mark = null;
    } else {
      this.cursor = cursor;
      this.mark = this.cursor.mark();
    }

    this.node = null;
  }

  tryPattern() {
    if (this.isMatch()) {
      const value = this.cursor.getChar();
      const index = this.cursor.getIndex();
      this.node = new _ValueNode.default(this.name, value, index, index);
      this.incrementCursor();
    } else {
      this.processError();
    }
  }

  isMatch() {
    return this.characters.indexOf(this.cursor.getChar()) > -1;
  }

  processError() {
    const message = `ParseError: Expected one of these characters, '${this.characters}' but found '${this.cursor.getChar()}' while parsing for '${this.name}'.`;
    throw new _ParseError.default(message, this.cursor.getIndex(), this);
  }

  incrementCursor() {
    if (this.cursor.hasNext()) {
      this.cursor.next();
    }
  }

  clone() {
    return new AnyOfThese(this.name, this.characters);
  }

  getValue() {
    return this.characters;
  }

}

exports.default = AnyOfThese;
//# sourceMappingURL=AnyOfThese.js.map