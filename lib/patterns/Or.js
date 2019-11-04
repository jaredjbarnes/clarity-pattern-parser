"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class Or {
  constructor(parsers, options) {
    this.parsers = parsers.map(parser => parser.clone());
    this.options = options;
    this.cursor = null;
    this.index = 0;
    this.mark = null;
    this.errors = [];
    this.assertParsers();
    this.recoverFromBadOptions();
  }

  assertParsers() {
    this.parsers.forEach(parser => {
      if (typeof parser.parse !== "function") {
        throw new Error("Invalid Argument: An Alternation can only accept parsers.");
      }
    });

    if (this.parsers.length < 2) {
      throw new Error("Invalid Arguments: An Alternation needs at least two options.");
    }
  }

  recoverFromBadOptions() {
    if (typeof this.options !== "object" || this.options == null) {
      this.options = {};
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
    this.index = 0;
    this.mark = this.cursor.mark();
    this.errors = [];
  }

  tryParser() {
    const parser = this.parsers[this.index];

    try {
      return parser.parse(this.cursor);
    } catch (error) {
      this.errors.push(error);

      if (this.index + 1 < this.parsers.length) {
        this.index++;
        this.cursor.moveToMark(this.mark);
        return this.tryParser();
      }

      return this.throwError();
    }
  }

  throwError() {
    if (this.options.isOptional) {
      this.cursor.moveToMark(this.mark);
      return null;
    }

    const furthestError = this.errors.reduce((furthestError, error) => {
      return furthestError.index > error.index ? furthestError : error;
    });

    if (furthestError != null) {
      throw furthestError;
    }
  }

  clone() {
    return new Or(this.parsers);
  }

}

exports.default = Or;
//# sourceMappingURL=Or.js.map