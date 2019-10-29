import ValueNode from "../ast/ValueNode.js";
import ParseError from "../ParseError.js";

export default class Literal {
  constructor(name, value) {
    this.name = name;
    this.value = value;

    this.assertValidity();
  }

  assertValidity() {
    if (this.isNullOrEmpty(this.value)) {
      throw new Error(
        "Illegal Argument: Literal needs to have a value that has a length greater than 0."
      );
    }
  }

  isNullOrEmpty(value) {
    return value == null || (typeof value === "string" && value.length === 0);
  }

  parse(cursor) {
    const length = this.value.length;
    let match = "";

    for (let x = 0; x < length; x++) {
      const character = cursor.getChar();

      if (character !== this.value.charAt(x)) {
        throw new ParseError(
          `Illegal character: expected '${this.value.charAt(
            x
          )}', but found '${character}'`
        );
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
      return new ValueNode(this.name, this.value);
    } else {
      throw new ParseError(
        `Illegal character: expected '${this.value}', but found '${match}'`
      );
    }
  }

  clone(){
    return new Literal(this.name, this.value);
  }
}
