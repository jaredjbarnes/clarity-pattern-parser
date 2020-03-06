import Pattern from "../Pattern.js";

export default class ValuePattern extends Pattern {
  constructor(type, name, children = []) {
    super(type, name, children);
  }

  _assertChildren() {
    if (!Array.isArray(this._children)) {
      throw new Error(
        "Invalid Arguments: The patterns argument need to be an array of ValuePattern."
      );
    }

    const areAllPatterns = this._children.every(
      pattern => pattern instanceof ValuePattern || pattern instanceof Pattern
    );

    if (!areAllPatterns) {
      throw new Error(
        "Invalid Argument: All patterns need to be an instance of ValuePattern."
      );
    }

    if (typeof this.name !== "string") {
      throw new Error(
        "Invalid Argument: ValuePatterns needs to have a name that's a string."
      );
    }

    if (typeof this.type !== "string") {
      throw new Error(
        "Invalid Argument: ValuePatterns needs to have a type that's a string."
      );
    }
  }

  clone() {
    throw new Error("Not Yet Implemented");
  }

  getCurrentMark() {
    throw new Error("Not Yet Implemented");
  }
}
