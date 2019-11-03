import ValueNode from "../ast/ValueNode.js";
import ParseError from "../ParseError.js";

export default class Not {
  constructor(name, parser, options) {
    this.name = name;
    this.parser = parser;
    this.options = options;
    this.value = "";
    this.startingMark = null;

    this.assertParser();
    this.recoverFromBadOptions();
  }

  assertParser() {
    if (
      this.parser == null ||
      (this.parser && typeof this.parser.parse !== "function")
    ) {
      throw new Error(
        "Invalid Arguments: Expected a 'parser' to have a parse function."
      );
    }
  }

  recoverFromBadOptions() {
    if (this.options == null) {
      this.options.isOptional = false;
    } else {
      if (typeof this.options.isOptional !== "boolean") {
        this.options.isOptional = false;
      }
    }
  }

  parse(cursor) {
    this.reset(cursor);
    return this.tryParser();
  }

  reset(cursor) {
    this.cursor = cursor;
    this.startingMark = this.cursor.mark();
    this.value = "";
  }

  tryParser() {
    const mark = this.cursor.mark();

    try {
      this.parser.parse(this.cursor);
      this.cursor.moveToMark(mark);

      if (this.value.length > 0) {
        return new ValueNode(
          this.name,
          this.value,
          this.startingMark.index,
          this.startingMark.index + this.value.length - 1
        );
      } else {
        if (this.options.isOptional) {
          return null;
        }
        throw new ParseError(
          `Couldn't find pattern not matching '${this.parser.name}' parser.`
        );
      }
    } catch (error) {
      this.cursor.moveToMark(mark);
      this.value += this.cursor.getChar();

      if (this.cursor.hasNext()) {
        this.cursor.next();
        return this.tryParser();
      } else {
        return new ValueNode(
          this.name,
          this.value,
          this.startingMark.index,
          this.startingMark.index + this.value.length - 1
        );
      }
    }
  }

  clone() {
    return new Not(this.name, this.parser, this.options);
  }
}
