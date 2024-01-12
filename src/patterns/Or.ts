import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { clonePatterns } from "./clonePatterns";

export class Or implements Pattern {
  private _type: string;
  private _name: string;
  private _parent: Pattern | null;
  private _children: Pattern[];
  private _isOptional: boolean;
  private _node: Node | null;
  private _firstIndex: number;
  private _shouldReduceAst: boolean;

  get type(): string {
    return this._type;
  }

  get name(): string {
    return this._name;
  }

  get parent(): Pattern | null {
    return this._parent;
  }

  set parent(pattern: Pattern | null) {
    this._parent = pattern;
  }

  get children(): Pattern[] {
    return this._children;
  }

  get isOptional(): boolean {
    return this._isOptional;
  }

  constructor(name: string, options: Pattern[], isOptional: boolean = false) {
    if (options.length === 0) {
      throw new Error("Need at least one pattern with an 'or' pattern.");
    }

    const children = clonePatterns(options, false);
    this._assignChildrenToParent(children);

    this._type = "or";
    this._name = name;
    this._parent = null;
    this._children = children;
    this._isOptional = isOptional;
    this._node = null;
    this._firstIndex = 0;
    this._shouldReduceAst = false;
  }

  private _assignChildrenToParent(children: Pattern[]): void {
    for (const child of children) {
      child.parent = this;
    }
  }

  parse(cursor: Cursor): Node | null {
    this._firstIndex = cursor.index;
    this._node = null;

    const passed = this._tryToParse(cursor);

    if (passed) {
      cursor.resolveError();
      const node = this._createNode();
      cursor.addMatch(this, node);

      return node;
    }

    if (!this._isOptional) {
      cursor.throwError(this._firstIndex, this)
      return null;
    }

    cursor.resolveError();
    cursor.moveTo(this._firstIndex);
    return null;
  }

  private _tryToParse(cursor: Cursor): boolean {
    for (const pattern of this._children) {
      cursor.moveTo(this._firstIndex);
      const result = pattern.parse(cursor);

      if (!cursor!.hasError) {
        this._node = result;

        return true;
      }

      cursor.resolveError();
    }

    return false
  }

  private _createNode(): Node {
    let children: Node[] = [];

    if (!this._shouldReduceAst) {
      children = this._node !== null ? [this._node] : children;
    }

    return new Node(
      this._type,
      this._name,
      this._node !== null ? this._node.firstIndex : 0,
      this._node !== null ? this._node.lastIndex : 0,
      children,
      this._node !== null ? this._node.value : ""
    );
  }


  enableAstReduction(): void {
    this._shouldReduceAst = true;
  }

  disableAstReduction(): void {
    this._shouldReduceAst = false;
  }

  getTokens(): string[] {
    const tokens: string[] = [];

    for (const child of this._children) {
      tokens.push(...child.getTokens());
    }

    return tokens;
  }

  getNextTokens(_lastMatched: Pattern): string[] {
    if (this._parent === null) {
      return [];
    }

    return this._parent.getNextTokens(this);
  }

  clone(name = this._name, isOptional = this._isOptional): Pattern {
    const or = new Or(name, this._children, isOptional);
    or._shouldReduceAst = this._shouldReduceAst;
    return or;
  }
}
