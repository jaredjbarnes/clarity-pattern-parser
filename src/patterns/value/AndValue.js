import ValuePattern from "./ValuePattern";
import ValueNode from "../../ast/ValueNode";
import Cursor from "../../Cursor.js";
import StackInformation from "../StackInformation";

export default class AndValue extends ValuePattern {
  constructor(name, patterns) {
    super(name, patterns);
    this._assertArguments();
  }

  _assertArguments() {
    if (this._children.length < 2) {
      throw new Error(
        "Invalid Argument: AndValue needs to have more than one value pattern."
      );
    }
  }

  _reset(cursor) {
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
    this._reset(cursor);
    this._assertCursor();
    this._tryPattern();

    return this.node;
  }

  _assertCursor() {
    if (!(this.cursor instanceof Cursor)) {
      throw new Error("Invalid Arguments: Expected a cursor.");
    }
  }

  _tryPattern() {
    while (true) {
      const pattern = this._children[this.index];

      try {
        this.nodes.push(pattern.parse(this.cursor));
      } catch (error) {
        error.stack.push(new StackInformation(this.mark, this));
        throw error;
      }

      if (this.index + 1 < this._children.length) {
        const lastNode = this.nodes[this.nodes.length - 1];

        this.cursor.setIndex(lastNode.endIndex + 1);
        this.index++;
      } else {
        this._processValue();
        break;
      }
    }
  }

  _processValue() {
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
    return new AndValue(this.name, this._children);
  }
}
