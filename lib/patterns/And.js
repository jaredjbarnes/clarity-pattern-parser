"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _CompositeNode = _interopRequireDefault(require("../ast/CompositeNode.js"));

var _ValueNode = _interopRequireDefault(require("../ast/ValueNode.js"));

var _ParseError = _interopRequireDefault(require("../ParseError.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class And {
  constructor(name, parsers, options) {
    this.name = name;
    this.options = options;
    this.parsers = parsers.map(parser => parser.clone());
    this.assertParsers();
    this.recoverFromBadOptions();
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

  recoverFromBadOptions() {
    if (typeof this.options !== "object" || this.options == null) {
      this.options = {};
      this.options.isValue = false;
      this.options.isOptional = false;
    } else {
      if (typeof this.options.isValue !== "boolean") {
        this.options.isValue = false;
      }

      if (typeof this.options.isOptional !== "boolean") {
        this.options.isOptional = false;
      }
    }
  }

  parse(cursor) {
    const nodes = [];
    const startingMark = cursor.mark();

    for (let x = 0; x < this.parsers.length; x++) {
      nodes.push(this.parsers[x].parse(cursor));
    }

    const filteredNodes = nodes.filter(node => {
      return node != null;
    });

    if (filteredNodes.length === 0) {
      if (this.options.isOptional) {
        cursor.moveToMark(startingMark);
        return null;
      } else {
        throw new _ParseError.default(`Expected a ${this.name} pattern.`);
      }
    }

    if (this.options.isValue && filteredNodes.every(node => node instanceof _ValueNode.default)) {
      const value = filteredNodes.map(node => node.value).join("");
      return new _ValueNode.default(this.name, value, filteredNodes[0].startIndex, filteredNodes[filteredNodes.length - 1].endIndex);
    }

    const node = new _CompositeNode.default(this.name, filteredNodes[0].startIndex, filteredNodes[filteredNodes.length - 1].endIndex);
    node.children = filteredNodes;
    return node;
  }

  clone() {
    return new And(this.name, this.parsers, this.options);
  }

}

exports.default = And;
//# sourceMappingURL=And.js.map