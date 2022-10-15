import Cursor from "../Cursor";
import Node from "../ast/Node";

export default abstract class Pattern {
  protected _type: string;
  protected _name: string;
  protected _children: Pattern[];
  protected _parent: Pattern | null;
  public isSequence: boolean;

  constructor(type: string = "", name: string, children: Pattern[] = []) {
    this._type = type;
    this._name = name;
    this._children = [];
    this._parent = null;
    this.isSequence = false;

    this._assertName();
    this.children = children;
  }

  private _assertName() {
    if (typeof this.name !== "string") {
      throw new Error(
        "Invalid Argument: Patterns needs to have a name that's a string."
      );
    }
  }

  abstract parse(cursor: Cursor): Node | null;

  exec(text: string) {
    const cursor = new Cursor(text);
    const node = this.parse(cursor);

    if (cursor.didSuccessfullyParse()) {
      return node;
    } else {
      return null;
    }
  }

  test(text: string) {
    return this.exec(text) != null;
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

  set parent(value: Pattern | null) {
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

  protected _assertChildren() {
    // Empty,can be overridden by subclasses.
  }

  private _cloneChildren() {
    // We need to clone the patterns so nested patterns can be parsed.
    this._children = this._children.map((pattern) => {
      if (!(pattern instanceof Pattern)) {
        throw new Error(
          `The ${this.name} pattern has an invalid child pattern.`
        );
      }
      return pattern.clone();
    });

    // We need to freeze the children so they aren't modified.
    Object.freeze(this._children);
  }

  private _assignAsParent() {
    this._children.forEach((child) => (child.parent = this));
  }

  abstract clone(name?: string): Pattern;

  abstract getTokens(): string[];

  getNextTokens(): string[] {
    const parent = this._parent;

    if (parent != null) {
      const siblings = parent.children;
      const index = siblings.findIndex((c) => c === this);
      const nextSibling = siblings[index + 1];

      // I don't like this, so I think we need to rethink this.
      if (parent.type.indexOf("repeat") === 0) {
        const tokens = parent.getNextTokens();
        if (index === 0 && siblings.length > 1) {
          return nextSibling.getTokens().concat(tokens);
        } else if (index === 1) {
          return siblings[0].getTokens();
        } else {
          return this.getTokens().concat(tokens);
        }
      }

      // Another thing I don't like.
      if (
        this._parent?.type?.indexOf("and") === 0 &&
        nextSibling != null &&
        nextSibling?.type?.indexOf("optional") === 0
      ) {
        let tokens: string[] = [];

        for (let x = index + 1; x < siblings.length; x++) {
          const child = siblings[x];

          if (child.type.indexOf("optional") === 0) {
            tokens = tokens.concat(child.getTokens());
          } else {
            tokens = tokens.concat(child.getTokens());
            break;
          }

          if (x === siblings.length - 1) {
            tokens = tokens.concat(this._parent.getNextTokens());
          }
        }

        return tokens;
      }

      // If you are an or you have already qualified.
      if (parent.type.indexOf("or") === 0) {
        return parent.getNextTokens();
      }

      if (nextSibling != null) {
        return nextSibling.getTokens();
      } else {
        return parent.getNextTokens();
      }
    }

    return [];
  }

  getTokenValue(): string | null {
    return null;
  }
}
