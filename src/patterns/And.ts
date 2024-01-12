import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { Node } from "../ast/Node";
import { clonePatterns } from "./clonePatterns"
import { filterOutNull } from "./filterOutNull"

export class And implements Pattern {
  private _type: string;
  private _name: string;
  private _parent: Pattern | null;
  private _children: Pattern[];
  private _isOptional: boolean;
  private _nodes: (Node | null)[];
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

  constructor(name: string, sequence: Pattern[], isOptional = false) {
    if (sequence.length === 0) {
      throw new Error("Need at least one pattern with an 'and' pattern.");
    }

    const children = clonePatterns(sequence);
    this._assignChildrenToParent(children)

    this._type = "and";
    this._name = name;
    this._isOptional = isOptional;
    this._parent = null;
    this._children = children;
    this._firstIndex = -1
    this._shouldReduceAst = false;
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
      const node = this.createNode(cursor);

      if (node !== null) {
        cursor.addMatch(this, node);
      }

      return node;
    }

    if (this._isOptional) {
      cursor.resolveError();
    }

    return null;
  }

  private tryToParse(cursor: Cursor): boolean {
    let passed = false;

    for (let i = 0; i < this._children.length; i++) {
      const runningCursorIndex = cursor.index;
      const nextPatternIndex = i + 1;
      const hasMorePatterns = nextPatternIndex < this._children.length;

      const node = this._children[i].parse(cursor);
      const hasNoError = !cursor.hasError;
      const hadMatch = node !== null;

      if (hasNoError) {
        this._nodes.push(node);

        if (hasMorePatterns) {
          if (hadMatch) {
            if (cursor.hasNext()) {
              cursor.next();
              continue;
            } else {
              if (this.areRemainingPatternsOptional(i)) {
                passed = true;
                break;
              }

              cursor.throwError(cursor.index + 1, this);
              break;
            }
          } else {
            cursor.moveTo(runningCursorIndex);
            continue;
          }
        } else {
          const lastNode = this.getLastValidNode();
          if (lastNode === null) {
            cursor.throwError(cursor.index, this);
            break;
          }

          passed = true;
          break;
        }
      } else {
        cursor.moveTo(this._firstIndex);
        break;
      }
    }

    return passed;
  }

  private getLastValidNode(): Node | null {
    const nodes = filterOutNull(this._nodes);

    if (nodes.length === 0) {
      return null;
    }

    return nodes[nodes.length - 1];
  }

  private areRemainingPatternsOptional(fromIndex: number): boolean {
    const startOnIndex = fromIndex + 1;
    const length = this._children.length;

    for (let i = startOnIndex; i < length; i++) {
      const pattern = this._children[i];
      if (!pattern.isOptional) {
        return false;
      }
    }

    return true;
  }

  private createNode(cursor: Cursor): Node | null {
    const children = filterOutNull(this._nodes);

    const lastIndex = children[children.length - 1].lastIndex;
    const value = cursor.getChars(this._firstIndex, lastIndex);

    cursor.moveTo(lastIndex)

    if (this._shouldReduceAst) {
      children.length = 0;
    }

    return new Node(
      "and",
      this._name,
      this._firstIndex,
      lastIndex,
      children,
      value
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

      if (!child.isOptional) {
        break;
      }
    }

    return tokens;
  }

  getNextTokens(lastMatched: Pattern): string[] {
    let nextSibling: Pattern | null = null;
    let nextSiblingIndex = -1;
    let index = -1;
    const tokens: string[] = [];

    for (let i = 0; i < this._children.length; i++) {
      if (this._children[i] === lastMatched) {
        if (i + 1 < this._children.length) {
          nextSibling = this._children[i + 1];
        }
        nextSiblingIndex = i + 1;
        index = i;
        break;
      }
    }

    if (index === -1) {
      return [];
    }

    if (nextSiblingIndex === this._children.length && this._parent !== null) {
      return this._parent.getNextTokens(this);
    }

    if (nextSibling !== null && !nextSibling.isOptional) {
      return nextSibling.getTokens();
    }

    if (nextSibling !== null && nextSibling.isOptional) {
      for (let i = nextSiblingIndex; i < this._children.length; i++) {
        const child = this._children[i];
        tokens.push(...child.getTokens());

        if (!child.isOptional) {
          break;
        }

        if (i === this._children.length - 1 && this._parent !== null) {
          tokens.push(...this._parent.getNextTokens(this));
        }
      }
    }

    return tokens;
  }

  clone(name = this._name, isOptional = this._isOptional): Pattern {
    const and = new And(name, this._children, isOptional)
    and._shouldReduceAst = this._shouldReduceAst;

    return and
  }
}
