import Pattern from "../Pattern.js";

export default class CompositePattern extends Pattern {
  constructor(type, name, children = []) {
    super(type, name);

    this._children = children;
    this._assertArguments();
    this._cloneChildren();
    this._assignAsParent();
  }

  _assertArguments() {
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

    if (this._children.length < 2) {
      throw new Error(
        "Invalid Argument: Composite Patterns needs to have more than one value pattern."
      );
    }

    if (typeof this.name !== "string") {
      throw new Error(
        "Invalid Argument: Composite Patterns needs to have a name that's a string."
      );
    }
  }

  _cloneChildren() {
    // We need to clone the patterns so nested patterns can be parsed.
    this._children = this._children.map(pattern => pattern.clone());

    // We need to freeze the childen so they aren't modified.
    Object.freeze(this._children);
  }

  _assignAsParent(){
    this._children.forEach(child => (child.parent = this));
  }

  clone() {
    throw new Error("Not Yet Implemented");
  }
}
