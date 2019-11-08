import CompositePattern from "./CompositePattern.js";
import Pattern from "../Pattern.js";

export default class OptionalComposite extends Pattern {
  constructor(pattern) {
    super();
    this.pattern = pattern;
    this.assertArguments();
  }

  assertArguments() {
    if (!(this.pattern instanceof CompositePattern)) {
      throw new Error("Invalid Arguments: Expected a CompositePattern.");
    }
  }

  getType() {
    return this.pattern.getType();
  }

  getName() {
    return this.pattern.getName();
  }

  getPatterns() {
    return this.pattern.getPatterns();
  }

  parse(cursor) {
    const mark = cursor.mark();

    try {
      return this.pattern.parse(cursor);
    } catch (error) {
      cursor.moveToMark(mark);
      return null;
    }
  }

  clone() {
    return new OptionalComposite(this.pattern);
  }
}
