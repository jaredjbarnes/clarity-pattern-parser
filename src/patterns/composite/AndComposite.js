import CompositePatterns from "./CompositePatterns.js";
import CompositeNode from "../../ast/CompositeNode.js";
import StackInformation from "../StackInformation.js";

export default class AndComposite extends CompositePatterns {
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
        this.nodes.push(this.patterns[this.index].parse(this.cursor));
      } catch (error) {
        error.stack.push(new StackInformation(this.mark, this));
        throw error;
      }

      if (this.index + 1 < this.patterns.length) {
        this.index++;
      } else {
        break;
      }
    }

    this.processValue();
  }

  processValue() {
    this.nodes = this.nodes.filter(node => node != null);
    this.node = new CompositeNode(
      this.name,
      this.nodes[0].startIndex,
      this.nodes[this.nodes.length - 1].endIndex
    );
    this.node.children = this.nodes;
  }

  clone() {
    return new AndComposite(this.name, this.patterns);
  }
}
