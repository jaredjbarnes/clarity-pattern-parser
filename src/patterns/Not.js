import ValueNode from "../ast/ValueNode.js";
import ParseError from "../ParseError.js";

export default class Not {
  constructor(name, parser) {
    this.name = name;
    this.parser = parser;
    this.value = "";
  }

  parse(cursor) {
    this.reset(cursor);
    return this.tryParser();
  }

  reset(cursor) {
    this.cursor = cursor;
    this.value = "";
  }

  tryParser() {
    const mark = this.cursor.mark();

    try {
      this.parser.parse(this.cursor);
      this.cursor.moveToMark(mark);

      if (this.value.length > 0) {
        return new ValueNode(this.name, this.value);
      } else {
        throw new ParseError(
          `Couldn't find pattern not matching '${this.parser.name}' parser.`
        );
      }
    } catch (error) {
      this.value += this.cursor.getChar();

      if (this.cursor.hasNext()) {
        this.cursor.next();
        return this.tryParser();
      }  else {
        return new ValueNode(this.name, this.value);
      }
    }
  }

  clone(){
    return new Not(this.name, this.parser);
  }
}
