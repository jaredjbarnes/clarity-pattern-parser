import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { clonePatterns } from "./clonePatterns";

export class Repeat implements Pattern {
  private _type: string;
  private _name: string;
  private _parent: Pattern | null;
  private _children: Pattern[];
  private _pattern: Pattern;
  private _divider: Pattern;
  private _isOptional: boolean;
  private _nodes: Node[];
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

  constructor(name: string, pattern: Pattern, divider?: Pattern, isOptional = false) {
    const patterns = divider != null ? [pattern, divider] : [pattern];
    const children: Pattern[] = clonePatterns(patterns, false);
    this._assignChildrenToParent(children);

    this._type = "repeat";
    this._name = name;
    this._isOptional = isOptional;
    this._parent = null;
    this._children = children;
    this._pattern = children[0];
    this._divider = children[1];
    this._firstIndex = -1
    this._shouldReduceAst = false
    this._nodes = [];
  }

  private _assignChildrenToParent(children: Pattern[]): void {
    for (const child of children) {
      child.parent = this;
    }
  }

  parseText(text: string) {
    const cursor = new Cursor(text);
    const ast = this.parse(cursor)

    return {
      ast,
      cursor
    };
  }

  parse(cursor: Cursor): Node | null {
    this._firstIndex = cursor.index;
    this._nodes = [];

    const passed = this.tryToParse(cursor);

    if (passed) {
      cursor.resolveError();
      const node = this.createNode(cursor);

      if (node) {
        cursor.recordMatch(this, node);
      }

      return node;
    }

    if (!this._isOptional) {
      return null;
    }

    cursor.resolveError();
    cursor.moveTo(this._firstIndex);
    return null;
  }

  private tryToParse(cursor: Cursor): boolean {
    let passed = false;

    while (true) {
      const runningCursorIndex = cursor.index;
      const repeatedNode = this._pattern.parse(cursor);

      if (cursor.hasError) {
        const lastValidNode = this.getLastValidNode();

        if (lastValidNode) {
          passed = true;
        } else {
          cursor.moveTo(runningCursorIndex);
          cursor.recordErrorAt(runningCursorIndex, this._pattern);
          passed = false;
        }

        break;
      } else if (repeatedNode) {
        this._nodes.push(repeatedNode);

        if (!cursor.hasNext()) {
          passed = true;
          break;
        }

        cursor.next();

        if (this._divider) {
          const dividerNode = this._divider.parse(cursor);

          if (cursor.hasError) {
            passed = true;
            break;
          } else if (dividerNode) {
            this._nodes.push(dividerNode);

            if (!cursor.hasNext()) {
              passed = true;
              break;
            }

            cursor.next();
          }
        }
      }
    }

    return passed;
  }

  private createNode(cursor: Cursor): Node | null {
    let children: Node[] = [];

    if (!this._divider) {
      children = this._nodes;
    } else {
      if (this._nodes.length % 2 !== 1) {
        const dividerNode = this._nodes[this._nodes.length - 1];
        cursor.moveTo(dividerNode.firstIndex);
        children = this._nodes.slice(0, this._nodes.length - 1);
      } else {
        children = this._nodes;
      }
    }

    const lastIndex = children[children.length - 1].lastIndex;
    const value = cursor.getChars(this._firstIndex, lastIndex);
    cursor.moveTo(lastIndex);

    if (this._shouldReduceAst) {
      children = [];
    }

    return new Node(
      "repeat",
      this._name,
      this._firstIndex,
      lastIndex,
      children,
      value
    );
  }

  private getLastValidNode(): Node | null {
    const nodes = this._nodes.filter((node) => node !== null);

    if (nodes.length === 0) {
      return null;
    }

    return nodes[nodes.length - 1];
  }

  enableAstReduction(): void {
    this._shouldReduceAst = true;
  }

  disableAstReduction(): void {
    this._shouldReduceAst = false;
  }

  clone(name = this._name, isOptional = this._isOptional): Pattern {
    const repeat = new Repeat(name, this._pattern, this._divider, isOptional);
    repeat._shouldReduceAst = this._shouldReduceAst;

    return repeat;
  }

  getTokens(): string[] {
    return this._pattern.getTokens();
  }

  getNextTokens(lastMatched: Pattern): string[] {
    let index = -1;
    const tokens: string[] = [];

    for (let i = 0; i < this._children.length; i++) {
      if (this._children[i] === lastMatched) {
        index = i;
      }
    }

    if (index === -1) {
      return [];
    }

    if (index === 0 && this._divider) {
      tokens.push(...this._children[1].getTokens());

      if (this._parent) {
        tokens.push(...this._parent.getNextTokens(this));
      }
    }

    if (index === 1) {
      tokens.push(...this._children[0].getTokens());
    }

    if (index === 0 && !this._divider && this._parent) {
      tokens.push(...this._children[0].getTokens());
      tokens.push(...this._parent.getNextTokens(this));
    }

    return tokens;
  }

}

