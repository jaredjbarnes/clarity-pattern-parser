"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _CompositeNode = _interopRequireDefault(require("../ast/CompositeNode.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class And {
  constructor(name, parsers) {
    this.name = name;
    this.parsers = parsers.map(parser => parser.clone());
    this.assertParsers();
  }

  assertParsers() {
    this.parsers.forEach(parser => {
      if (typeof parser.parse !== "function") {
        throw new Error("Invalid Argument: A Sequence can only accept parsers.");
      }
    });

    if (this.parsers.length < 2) {
      throw new Error("Invalid Arguments: A Sequence needs at least two options.");
    }
  }

  parse(cursor) {
    const nodes = [];

    for (let x = 0; x < this.parsers.length; x++) {
      nodes.push(this.parsers[x].parse(cursor));
    }

    const node = new _CompositeNode.default(this.name);
    node.children = nodes;
    return node;
  }

  clone() {
    return new And(name, parsers);
  }

}

exports.default = And;
//# sourceMappingURL=And.js.map