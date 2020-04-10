import Cursor from "../Cursor.js";

export default class Pattern {
  constructor(type = null, name, children = []) {
    this._type = type;
    this._name = name;
    this._children = [];
    this._parent = null;
    this.isSequence = false;

    this._assertName();
    this.children = children;
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
    this._cloneChildren();
    this._assertChildren();
    this._assignAsParent();
  }

  _assertChildren() {
    // Empty, meant to be overridden by subclasses.
  }

  _cloneChildren() {
    // We need to clone the patterns so nested patterns can be parsed.
    this._children = this._children.map((pattern) => {
      if (!(pattern instanceof Pattern)) {
        throw new Error(
          `The ${this.name} pattern has an invalid child pattern.`
        );
      }
      return pattern.clone();
    });

    // We need to freeze the childen so they aren't modified.
    Object.freeze(this._children);
  }

  _assignAsParent() {
    this._children.forEach((child) => (child.parent = this));
  }

  clone() {
    throw new Error("Method Not Implemented");
  }

  getPossibilities() {
    throw new Error("Method Not Implemented");
  }

  getTokens() {
    throw new Error("Method Not Implemented");
  }

  getNextTokens() {
    if (this._parent != null) {
      const siblings = this._parent.children;
      const index = siblings.findIndex((c) => c === this);
      const nextSibling = siblings[index + 1];

      // I don't like this, so I think we need to rethink this.
      if (this._parent.type.indexOf("repeat") > -1) {
        const tokens = this._parent.getNextTokens();
        if (index === 0 && siblings.length > 1) {
          return nextSibling.getTokens().concat(tokens);
        } else if (index === 1) {
          return siblings[0].getTokens().concat(tokens);
        } else {
          return this.getTokens().concat(tokens);
        }
      }

      if (nextSibling != null) {
        return nextSibling.getTokens();
      } else {
        return this._parent.getNextTokens();
      }
    }

    if (this._children.length === 0) {
      return this.getTokens();
    } else {
      return this._children[0].getTokens();
    }
  }

  getTokenValue() {
    return null;
  }
}
