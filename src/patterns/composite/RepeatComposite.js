import CompositePattern from "./CompositePattern.js";
import CompositeNode from "../../ast/CompositeNode.js";
import OptionalComposite from "./OptionalComposite.js";

export default class RepeatComposite extends CompositePattern {
  constructor(name, pattern) {
    this.name = name;
    this.pattern = pattern;
    this.patterns = [pattern];
    
    this.assertArguments();
    this.reset();
  }

  assertArguments() {
    if (!(this.pattern instanceof Pattern)) {
      throw new Error(
        "Invalid Argument: The pattern needs to be an instance of Pattern."
      );
    }

    if (this.pattern instanceof OptionalComposite) {
      throw new Error(
        "Invalid Argument: Cannot use an OptionalComposite within a RepeatComposite."
      );
    }

    if (typeof this.name !== "string") {
      throw new Error(
        "Invalid Argument: RepeatComposite needs to have a name that's a string."
      );
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
    this.node = new CompositeNode(
      this.name,
      this.nodes[0].startIndex,
      this.nodes[this.nodes.length - 1].endIndex
    );
    this.node.children = this.nodes;
  }

  getPatterns() {
    return this.patterns;
  }

  clone() {
    return new RepeatComposite(this.name, this.patterns);
  }
}
