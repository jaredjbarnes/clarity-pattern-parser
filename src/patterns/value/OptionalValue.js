import ValuePattern from "./ValuePattern.js";

export default class OptionalValue extends ValuePattern {
  constructor(pattern) {
    super("optional-value", [pattern]);
    this._assertArguments();
  }

  _assertArguments() {
    if (!(this.children[0] instanceof ValuePattern)) {
      throw new Error("Invalid Arguments: Expected a ValuePattern.");
    }
  }

  parse(cursor) {
    const mark = cursor.mark();

    try {
      return this.children[0].parse(cursor);
    } catch (error) {
      cursor.moveToMark(mark);
      return null;
    }
  }

  clone() {
    return new OptionalValue(this.children[0]);
  }

  getCurrentMark(){
    return this.mark;
  }
}
