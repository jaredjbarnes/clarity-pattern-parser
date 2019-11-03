"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _CompositeNode = _interopRequireDefault(require("../ast/CompositeNode.js"));

var _ParseError = _interopRequireDefault(require("../ParseError.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Repeat {
  constructor(name, parser, dividerParser = null) {
    this.name = name;
    this.parser = parser.clone();
    this.dividerParser = dividerParser;
    this.cursor = null;
    this.nodes = [];
    this.compositeNode = null;
    this.assertParser();
  }

  assertParser() {
    if (typeof this.parser.parse !== "function") {
      throw new Error("Invalid Argument: A Repetition can only accept a parser.");
    }
  }

  parse(cursor) {
    this.reset(cursor);
    this.tryParser();
    this.createCompositeNode();
    return this.compositeNode;
  }

  reset(cursor) {
    this.cursor = cursor;
    this.nodes = [];
    this.compositeNode = null;
  }

  tryParser() {
    const mark = this.cursor.mark();

    try {
      const node = this.parser.parse(this.cursor);
      this.nodes.push(node);

      if (node.endIndex !== this.cursor.lastIndex()) {
        if (this.dividerParser != null) {
          this.tryDividerParser();
        }

        this.tryParser();
      }
    } catch (error) {
      if (this.nodes.length === 0) {
        throw new _ParseError.default(`Expected a ${this.name}.`);
      }

      this.cursor.moveToMark(mark);
    }
  }

  tryDividerParser() {
    const mark = this.cursor.mark();

    try {
      const node = this.dividerParser.parse(this.cursor);
      this.nodes.push(node);
    } catch (error) {
      this.cursor.moveToMark(mark);
    }
  }

  createCompositeNode() {
    this.compositeNode = new _CompositeNode.default(this.name, this.nodes[0].startIndex, this.nodes[this.nodes.length - 1].endIndex);
    this.compositeNode.children = this.nodes;
  }

  clone() {
    return new Repeat(this.name, this.parser);
  }

}

exports.default = Repeat;
//# sourceMappingURL=Repeat.js.map