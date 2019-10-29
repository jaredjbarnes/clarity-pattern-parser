import ValueNode from "../ast/ValueNode.js";
import Literal from "./Literal.js";
import ParseError from "../ParseError.js";

export default class Not {
  constructor(name, value) {
    this.name = name;
    this.literal = new Literal(name, value);
    this.notMatchingValue = value;
    this.value = "";
  }

  parse(cursor) {
    this.reset(cursor);
    return this.tryLiteral();
  }

  reset(cursor) {
    this.cursor = cursor;
    this.value = "";
  }

  tryLiteral() {
    const mark = this.cursor.mark();

    try {
      this.literal.parse(this.cursor);
      this.cursor.moveToMark(mark);

      if (this.value.length > 0) {
        return new ValueNode(this.name, this.value);
      } else {
        throw new ParseError(
          `Couldn't find pattern not matching '${this.notMatchingValue}'.`
        );
      }
    } catch (error) {
      this.value += this.cursor.getChar();

      if (this.cursor.hasNext()) {
        this.cursor.next();
        return this.tryLiteral();
      }  else {
        return new ValueNode(this.name, this.value);
      }
    }
  }

  clone(){
    return new Not(this.name, this.notMatchingValue);
  }
}
