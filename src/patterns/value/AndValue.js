import ValuePatterns from "./ValuePatterns";
import ValueNode from "../../ast/ValueNode";
import Cursor from "../../Cursor.js";

export default class AndValue extends ValuePatterns {
  constructor(name, patterns) {
    super(name, patterns);
    this.reset();
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
    this.assertCursor();
    this.tryPattern();

    return this.node;
  }

  assertCursor() {
    if (!(this.cursor instanceof Cursor)) {
      throw new Error("Invalid Arguments: Expected a cursor.");
    }
  }

  tryPattern() {
    while (true) {
      const pattern = this.patterns[this.index];

      try {
        this.nodes.push(pattern.parse(this.cursor));
      } catch (error) {
        error.patternStack.push(this);
        throw error;
      }

      if (this.index + 1 < this.patterns.length) {
        const lastNode = this.nodes[this.nodes.length - 1];

        this.cursor.setIndex(lastNode.endIndex + 1);
        this.index++;
      } else {
        this.processValue();
        break;
      }
    }
  }

  processValue() {
    const lastNode = this.nodes[this.nodes.length - 1];
    const startIndex = this.mark.index;
    const endIndex = lastNode.endIndex;

    const value = this.nodes
      .filter(node => node != null)
      .map(node => node.value)
      .join("");

    this.node = new ValueNode(this.name, value, startIndex, endIndex);
  }

  clone() {
    return new AndValue(this.name, this.patterns);
  }
}
