"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ValueNode = _interopRequireDefault(require("../ast/ValueNode.js"));

var _ParseError = _interopRequireDefault(require("../ParseError.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Any {
  constructor(name, parsers) {
    this.name = name;
    this.parsers = parsers.map(parser => parser.clone());
    this.cursor = null;
    this.index = 0;
    this.mark = null;
    this.errors = [];
    this.nodes = [];
    this.value = null;
    this.assertParsers();
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

  parse(cursor) {
    this.reset(cursor);
    this.tryParser();
    this.reduceValue();
    return new _ValueNode.default(this.name, this.value, this.nodes[0].startIndex, this.nodes[this.nodes.length - 1].endIndex);
  }

  reset(cursor) {
    this.cursor = cursor;
    this.index = 0;
    this.mark = this.cursor.mark();
    this.errors = [];
    this.value = null;
  }

  tryParser() {
    const parser = this.parsers[this.index];

    try {
      const node = parser.parse(this.cursor);

      if (!(node instanceof _ValueNode.default)) {
        throw new Error(`Invalid Arguments: 'Any Parser' expects all parsers to return a Value node, but received something else on a ${parser.name} parser.`);
      }

      this.nodes.push(node);
      this.index = 0;
      this.errors = [];

      if (node.endIndex !== this.cursor.lastIndex()) {
        this.mark = this.cursor.mark();
        this.cursor.next();
        this.tryParser();
      }
    } catch (error) {
      this.errors.push(error);

      if (this.index + 1 < this.parsers.length) {
        this.index++;
        this.cursor.moveToMark(this.mark);
        return this.tryParser();
      }

      this.throwError();
    }
  }

  throwError() {
    const furthestError = this.errors.reduce((furthestError, error) => {
      return furthestError.index > error.index ? furthestError : error;
    });

    if (furthestError != null) {
      throw furthestError;
    }
  }

  reduceValue() {
    if (this.nodes.length < 1) {
      throw new _ParseError.default(`Couldn't find a match for ${this.name}.`);
    }

    this.value = this.nodes.map(node => node.value).join("");
  }

  clone() {
    return new Any(this.name, this.parsers);
  }

}

exports.default = Any;
//# sourceMappingURL=Any.js.map