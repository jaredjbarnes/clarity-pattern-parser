"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ValueNode = _interopRequireDefault(require("../ast/ValueNode.js"));

var _ParseError = _interopRequireDefault(require("../ParseError.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Literal {
  constructor(name, value) {
    this.name = name;
    this.value = value;
    this.assertValidity();
  }

  assertValidity() {
    if (this.isNullOrEmpty(this.value)) {
      throw new Error("Illegal Argument: Literal needs to have a value that has a length greater than 0.");
    }
  }

  isNullOrEmpty(value) {
    return value == null || typeof value === "string" && value.length === 0;
  }

  parse(cursor) {
    const startIndex = cursor.getIndex();
    const length = this.value.length;
    let match = "";

    for (let x = 0; x < length; x++) {
      const character = cursor.getChar();

      if (character !== this.value.charAt(x)) {
        throw new _ParseError.default(`Illegal character: expected '${this.value.charAt(x)}', but found '${character}'`);
      } else {
        match += character;
      }

      if (cursor.hasNext()) {
        cursor.next();
      } else {
        break;
      }
    }

    if (match === this.value) {
      return new _ValueNode.default(this.name, this.value, startIndex, startIndex + this.value.length - 1);
    } else {
      throw new _ParseError.default(`Illegal character: expected '${this.value}', but found '${match}'`);
    }
  }

  clone() {
    return new Literal(this.name, this.value);
  }

}

exports.default = Literal;
//# sourceMappingURL=Literal.js.map