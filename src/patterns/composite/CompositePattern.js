import Pattern from "../Pattern.js";

export default class CompositePattern extends Pattern {
  constructor(type, name, children = []) {
    super(type, name, children);
  }

  _assertChildren() {
    if (!Array.isArray(this._children)) {
      throw new Error(
        "Invalid Arguments: The patterns argument need to be an array of Patterns."
      );
    }

    const areAllPatterns = this._children.every(
      pattern => pattern instanceof Pattern
    );

    if (!areAllPatterns) {
      throw new Error(
        "Invalid Argument: All patterns need to be an instance of Pattern."
      );
    }

    // if (this._children.length < 2) {
    //   throw new Error(
    //     "Invalid Argument: Composite Patterns need to have more than one value pattern."
    //   );
    // }

  }

  clone() {
    throw new Error("Not Yet Implemented");
  }
}
