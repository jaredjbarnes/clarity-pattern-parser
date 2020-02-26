import Pattern from "../Pattern.js";

export default class ValuePattern extends Pattern {
  constructor(type, name, children = []) {
    super(type, name);
    this._children = children;
    this._assertPatternArguments();
    this._cloneChildren();
    this._assignAsParent();
  }

  _assertPatternArguments() {
    if (!Array.isArray(this._children)) {
      throw new Error(
        "Invalid Arguments: The patterns argument need to be an array of ValuePattern."
      );
    }

    const areAllPatterns = this._children.every(
      pattern => pattern instanceof ValuePattern
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

  _cloneChildren() {
    // We need to clone the patterns so nested patterns can be parsed.
    this._children = this._children.map(pattern => pattern.clone());

    // We need to freeze the childen so they aren't modified.
    Object.freeze(this._children);
  }

  _assignAsParent() {
    this._children.forEach(child => (child.parent = this));
  }

  clone() {
    throw new Error("Not Yet Implemented");
  }

  getCurrentMark(){
    throw new Error("Not Yet Implemented");
  }
}
