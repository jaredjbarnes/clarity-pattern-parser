import ValueNode from "../ast/ValueNode.js";
import Literal from "./Literal.js";
import ParseError from "../ParseError.js";

export default class AllExcept {
  constructor(name, exceptions) {
    this.name = name;
    this.exceptions = exceptions;
    this.literals = [];
    this.value = "";

    this.assertExceptions();
    this.sortExceptionsByLength();
    this.createAndSaveLiterals();
  }

  assertExceptions() {
    if (!Array.isArray(this.exceptions)) {
      throw new Error("Invalid Arguments: Expected exceptions to be an array of strings.");
    }

    this.exceptions.forEach(exception => {
      if (exception.length < 1) {
        throw new Error("Invalid Argument: Expected all exceptions to be at least one charater long.");
      }
    });
  }

  sortExceptionsByLength() {
    // Longest first
    this.exceptions.sort((a, b) => {
      return b.length - a.length;
    });
  }

  createAndSaveLiterals() {
    this.literals = this.exceptions.map(value => {
      return new Literal(value, value);
    });
  }

  parse(cursor) {
    this.reset(cursor);
    this.parseValue();

    return new Valuethis.value();
  }

  reset(cursor) {
    this.cursor = cursor;
    this.value = "";
  }

  parseValue() {
    const mark = this.cursor.mark();

    for (let x = 0; x < this.literals.length; x++) {
      const literal = this.literals[x];

      this.cursor.moveToMark(mark);

      try {
        literal.parse(this.cursor);

        if (this.value.length > 0) {
          this.cursor.moveToMark(mark);
          return new ValueNode(this.name, this.value);
        } else {
          throw new ParseError(`Did not expect '${this.exceptions[x]}' within a(n) ${this.name}.`);
        }
      } catch (error) {
        // Good
      }
    }

    this.value += this.cursor.getChar();

    if (this.cursor.hasNext()) {
      this.cursor.next();
      this.parseValue();
    } else {
      if (this.value.length > 0) {
        return new ValueNode(this.name, this.value);
      } else {
        throw new ParseError("Did not match any characters.", this.cursor.index);
      }
    }
  }
}
//# sourceMappingURL=AllExcept.js.map