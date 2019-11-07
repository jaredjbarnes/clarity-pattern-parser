import ValuePattern from "./ValuePattern.js";

export default class OptionalValue extends ValuePattern {
  constructor(pattern) {
    super();
    this.pattern = pattern;
    this.assertArguments();
  }

  assertArguments() {
    if (!(this.pattern instanceof ValuePattern)) {
      throw new Error("Invalid Arguments: Expected a ValuePattern.");
    }
  }

  getName() {
    return this.pattern.getName();
  }

  getType(){
    return this.pattern.getType();
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
    return new OptionalValue(this.pattern);
  }
}
