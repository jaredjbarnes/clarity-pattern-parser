import CompositePattern from "./CompositePattern.js";
import CompositeNode from "../../ast/CompositeNode.js";
import OptionalComposite from "./OptionalComposite.js";

export default class RepeatComposite extends CompositePattern {
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
    this._tryPattern();

    return this.node;
  }

  _tryPattern() {
    while (true) {
      try {
        this.nodes.push(this.pattern.parse(this.cursor));
      } catch (error) {
        break;
      }
    }

    this._processValue();
  }

  _processValue() {
    if (this.nodes.length === 0) {
      throw new ParseError(`Couldn't find the ${this.pattern.name} pattern.`, this.mark.index, this);
    }

    this.nodes = this.nodes.filter(node => node != null);
    this.node = new CompositeNode(
      this.name,
      this.nodes[0].startIndex,
      this.nodes[this.nodes.length - 1].endIndex
    );
    this.node.children = this.nodes;
  }

  clone() {
    return new RepeatComposite(this.name, this._children);
  }
}
