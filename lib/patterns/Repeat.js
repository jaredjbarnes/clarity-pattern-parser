"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _CompositeNode = _interopRequireDefault(require("../ast/CompositeNode.js"));

var _ParseError = _interopRequireDefault(require("../ParseError.js"));

var _ValueNode = _interopRequireDefault(require("../ast/ValueNode.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Repeat {
  constructor(name, parser, options) {
    this.name = name;
    this.parser = parser.clone();
    this.options = options;
    this.cursor = null;
    this.nodes = [];
    this.value = null;
    this.assertParser();
    this.recoverFromBadOptions();
  }

  assertParser() {
    if (typeof this.parser.parse !== "function") {
      throw new Error("Invalid Argument: A Repetition can only accept a parser.");
    }
  }

  recoverFromBadOptions() {
    if (typeof this.options !== "object" || this.options == null) {
      this.options = {};
      this.options.isValue = false;
      this.options.isOptional = false;
      this.options.dividerParser = null;
    } else {
      if (typeof this.options.isValue !== "boolean") {
        this.options.isValue = false;
      }

      if (typeof this.options.isOptional !== "boolean") {
        this.options.isOptional = false;
      }

      if (this.options.dividerParser != null && typeof this.options.dividerParser.parse !== "function") {
        this.options.dividerParser = null;
      }
    }
  }

  parse(cursor) {
    this.reset(cursor);
    this.tryParser();
    this.createValue();
    return this.value;
  }

  reset(cursor) {
    this.cursor = cursor;
    this.nodes = [];
    this.value = null;
  }

  tryParser() {
    const mark = this.cursor.mark();

    try {
      const node = this.parser.parse(this.cursor);

      if (node == null) {
        throw new _ParseError.default(`Repeat cannot have an optional parser. It will infinitely retry parsing. Change ${this.parser.name} to not be optional.`);
      }

      this.nodes.push(node);

      if (node.endIndex !== this.cursor.lastIndex()) {
        if (this.options.dividerParser != null) {
          this.tryDividerParser();
        }

        this.tryParser();
      }
    } catch (error) {
      if (this.nodes.length === 0) {
        if (this.options.isOptional) {
          this.value = null;
        }

        throw new _ParseError.default(`Expected a ${this.name}.`);
      }

      this.cursor.moveToMark(mark);
    }
  }

  tryDividerParser() {
    const mark = this.cursor.mark();

    try {
      const node = this.options.dividerParser.parse(this.cursor);
      this.nodes.push(node);
    } catch (error) {
      this.cursor.moveToMark(mark);
    }
  }

  createValue() {
    if (this.nodes.length === 0) {
      return;
    }

    if (this.options.isValue && this.nodes.every(node => node instanceof _ValueNode.default)) {
      this.value = new _ValueNode.default(this.name, this.nodes.map(node => node.value).join(""), this.nodes[0].startIndex, this.nodes[this.nodes.length - 1].endIndex);
    } else {
      this.value = new _CompositeNode.default(this.name, this.nodes[0].startIndex, this.nodes[this.nodes.length - 1].endIndex);
      this.value.children = this.nodes;
    }
  }

  clone() {
    return new Repeat(this.name, this.parser);
  }

}

exports.default = Repeat;
//# sourceMappingURL=Repeat.js.map