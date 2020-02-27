import Cursor from "../Cursor.js";

export default class Pattern {
  constructor(type = null, name = null) {
    this._type = type;
    this._name = name;
    this._parent = null;
    this._children = [];

    this._assertName();
  }

  _assertName() {
    if (typeof this.name !== "string") {
      throw new Error(
        "Invalid Argument: Patterns needs to have a name that's a string."
      );
    }
  }

  parse() {
    throw new Error("Method Not Implemented");
  }

  exec(string) {
    const cursor = new Cursor(string);
    const node = this.parse(cursor);

    if (cursor.didSuccessfullyParse()) {
      return node;
    } else {
      return null;
    }
  }

  test(string) {
    return this.exec(string) != null;
  }

  get name() {
    return this._name;
  }

  get type() {
    return this._type;
  }

  get parent() {
    return this._parent;
  }

  set parent(value) {
    if (value instanceof Pattern) {
      this._parent = value;
    }
  }

  get children() {
    return this._children;
  }

  set children(value) {
    this._children = value;
    this._assertChildren();
    this._assignAsParent();

    this._children = value.map(pattern => pattern.clone());
    Object.freeze(this._children);
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

    if (this._children.length < 2) {
      throw new Error(
        "Invalid Argument: Composite Patterns needs to have more than one value pattern."
      );
    }
  }

  _assignAsParent() {
    this._children.forEach(child => (child.parent = this));
  }

  clone() {
    throw new Error("Method Not Implemented");
  }

  getPossibilities() {
    throw new Error("Method Not Implemented");
  }
}
