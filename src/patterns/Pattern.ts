import Cursor from "./Cursor";
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
  abstract getNextTokens(reference: Pattern): string[];

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
