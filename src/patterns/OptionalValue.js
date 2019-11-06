import ValuePattern from "./ValuePattern.js";

export default class OptionalValue extends CompositePattern {
  constructor(pattern) {
    this.pattern = pattern;
    this.assertArguments();
  }

  assertArguments() {
    if (!(this.pattern instanceof ValuePattern)) {
      throw new Error("Invalid Arguments: Expected a Pattern.");
    }
  }

  getName() {
    return this.pattern.getName();
  }
  
  getPatterns() {
    return [this.pattern];
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
    return new OptionalValue(this.pattern);
  }
}
