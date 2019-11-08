"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _CompositePattern = _interopRequireDefault(require("./CompositePattern.js"));

var _CompositeNode = _interopRequireDefault(require("../../ast/CompositeNode.js"));

var _OptionalComposite = _interopRequireDefault(require("./OptionalComposite.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RepeatComposite extends _CompositePattern.default {
  constructor(name, pattern) {
    this.name = name;
    this.pattern = pattern;
    this.patterns = [pattern];
    this.assertArguments();
    this.reset();
  }

  assertArguments() {
    if (!(this.pattern instanceof Pattern)) {
      throw new Error("Invalid Argument: The pattern needs to be an instance of Pattern.");
    }

    if (this.pattern instanceof _OptionalComposite.default) {
      throw new Error("Invalid Argument: Cannot use an OptionalComposite within a RepeatComposite.");
    }

    if (typeof this.name !== "string") {
      throw new Error("Invalid Argument: RepeatComposite needs to have a name that's a string.");
    }
  }

  reset(cursor) {
    this.cursor = null;
    this.index = 0;
    this.nodes = [];
    this.node = null;

    if (cursor != null) {
      this.cursor = cursor;
      this.mark = this.cursor.mark();
    }
  }

  parse(cursor) {
    this.reset(cursor);
    this.tryPattern();
    return this.node;
  }

  tryPattern() {
    while (true) {
      try {
        this.nodes.push(this.pattern.parse(this.cursor));
      } catch (error) {
        break;
      }
    }

    this.processValue();
  }

  processValue() {
    if (this.nodes.length === 0) {
      throw new ParseError(`Couldn't find the ${this.pattern.getName()} pattern.`, this.mark.index, this);
    }

    this.nodes = this.nodes.filter(node => node != null);
    this.node = new _CompositeNode.default(this.name, this.nodes[0].startIndex, this.nodes[this.nodes.length - 1].endIndex);
    this.node.children = this.nodes;
  }

  getPatterns() {
    return this.patterns;
  }

  clone() {
    return new RepeatComposite(this.name, this.patterns);
  }

}

exports.default = RepeatComposite;
//# sourceMappingURL=RepeatComposite.js.map