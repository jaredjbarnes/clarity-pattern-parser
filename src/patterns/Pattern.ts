import Cursor from "../Cursor";
import Node from "../ast/Node";

export default abstract class Pattern {
  protected _type: string;
  protected _name: string;
  protected _children: Pattern[];
  protected _parent: Pattern | null;
  protected _isOptional = false;

  get isOptional() {
    return this._isOptional;
  }

  constructor(
    type: string,
    name: string,
    children: Pattern[] = [],
    isOptional = false
  ) {
    this._type = type;
    this._name = name;
    this._children = [];
    this._parent = null;
    this._isOptional = isOptional;
    this.children = children;
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
    this._parent = value;
  }

  get children() {
    return this._children;
  }

  set children(value) {
    this._children = value;
    this.cloneChildren();
    this.assignAsParent();
  }

  abstract clone(name?: string): Pattern;
  abstract getTokens(): string[];

  getTokenValue(): string | null {
    return null;
  }

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
        nextSibling.isOptional
      ) {
        let tokens: string[] = [];

        for (let x = index + 1; x < siblings.length; x++) {
          const child = siblings[x];

          if (child.isOptional) {
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

  private cloneChildren() {
    this._children = this._children.map((pattern) => {
      return pattern.clone();
    });

    Object.freeze(this._children);
  }

  private assignAsParent() {
    this._children.forEach((child) => (child.parent = this));
  }
}
