import CompositePatterns from "./CompositePatterns.js";
import CompositeNode from "../../ast/CompositeNode.js";
import StackInformation from "../StackInformation.js";

export default class OrComposite extends CompositePatterns {
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
      const mark = this.cursor.mark();

      try {
        const result = this.patterns[this.index].parse(this.cursor);

        this.node = new CompositeNode(
          this.name,
          result.startIndex,
          result.endIndex
        );
        this.node.children.push(result);

        break;
      } catch (error) {
        if (this.index + 1 < this.patterns.length) {
          this.cursor.moveToMark(mark);
          this.index++;
        } else {
          error.stack.push(new StackInformation(this.mark, this));
          throw error;
        }
      }
    }
  }

  clone() {
    return new OrComposite(this.name, this.patterns);
  }
}
