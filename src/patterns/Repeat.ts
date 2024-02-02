import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { clonePatterns } from "./clonePatterns";
import { findPattern } from "./findPattern";

export interface RepeatOptions {
  divider?: Pattern;
  min?: number;
}

export class Repeat implements Pattern {
  private _type: string;
  private _name: string;
  private _parent: Pattern | null;
  private _children: Pattern[];
  private _pattern: Pattern;
  private _divider: Pattern | null;
  private _isOptional: boolean;
  private _nodes: Node[];
  private _firstIndex: number;
  private _min: number;

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

  constructor(name: string, pattern: Pattern, options: RepeatOptions = {}) {
    const patterns = options.divider != null ? [pattern, options.divider] : [pattern];
    const min = options.min != null ? options.min : 1;
    const children: Pattern[] = clonePatterns(patterns, false);
    this._assignChildrenToParent(children);

    this._type = "repeat";
    this._name = name;
    this._isOptional = min < 1;
    this._min = min;
    this._parent = null;
    this._children = children;
    this._pattern = children[0];
    this._divider = children[1];
    this._firstIndex = -1
    this._nodes = [];
  }

  private _assignChildrenToParent(children: Pattern[]): void {
    for (const child of children) {
      child.parent = this;
    }
  }

  test(text: string) {
    const cursor = new Cursor(text);
    const ast = this.parse(cursor);

    return ast?.value === text;
  }

  exec(text: string) {
    const cursor = new Cursor(text);
    const ast = this.parse(cursor);

    return {
      ast: ast?.value === text ? ast : null,
      cursor
    };
  }

  parse(cursor: Cursor): Node | null {
    this._firstIndex = cursor.index;
    this._nodes = [];

    const passed = this._tryToParse(cursor);

    if (passed) {
      cursor.resolveError();
      const node = this._createNode(cursor);

      if (node != null) {
        cursor.moveTo(node.lastIndex);
        cursor.recordMatch(this, node);
      }

      return node;
    }

    if (!this._isOptional) {
      return null;
    }

    cursor.resolveError();
    return null;
  }

  private _meetsMin() {
    if (this._divider != null) {
      return Math.ceil(this._nodes.length / 2) >= this._min;
    }
    return this._nodes.length >= this._min;
  }

  private _tryToParse(cursor: Cursor): boolean {
    let passed = false;

    while (true) {
      const runningCursorIndex = cursor.index;
      const repeatedNode = this._pattern.parse(cursor);

      if (cursor.hasError) {
        const lastValidNode = this._getLastValidNode();

        if (lastValidNode != null) {
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

        if (this._divider != null) {
          const dividerNode = this._divider.parse(cursor);

          if (cursor.hasError) {
            passed = true;
            break;
          } else if (dividerNode != null) {
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

    const hasMinimum = this._meetsMin();

    if (hasMinimum) {
      return passed;
    } else if (!hasMinimum && passed) {
      cursor.recordErrorAt(cursor.index, this);
      cursor.moveTo(this._firstIndex);
      return false;
    }

    return passed;
  }

  private _createNode(cursor: Cursor): Node | null {
    let children: Node[] = [];

    if (this._divider == null) {
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
    cursor.moveTo(lastIndex);

    return new Node(
      "repeat",
      this._name,
      this._firstIndex,
      lastIndex,
      children
    );
  }

  private _getLastValidNode(): Node | null {
    const nodes = this._nodes.filter((node) => node !== null);

    if (nodes.length === 0) {
      return null;
    }

    return nodes[nodes.length - 1];
  }

  getTokens(): string[] {
    return this._pattern.getTokens();
  }

  getTokensAfter(childReference: Pattern): string[] {
    const patterns = this.getPatternsAfter(childReference);
    const tokens: string[] = [];

    patterns.forEach(p => tokens.push(...p.getTokens()));

    return tokens;
  }

  getNextTokens(): string[] {
    if (this._parent == null) {
      return []
    }

    return this._parent.getTokensAfter(this);
  }

  getPatterns(): Pattern[] {
    return this._pattern.getPatterns();
  }

  getPatternsAfter(childReference: Pattern): Pattern[] {
    let index = -1;
    const patterns: Pattern[] = [];

    for (let i = 0; i < this._children.length; i++) {
      if (this._children[i] === childReference) {
        index = i;
      }
    }

    // If the last match isn't a child of this pattern.
    if (index === -1) {
      return [];
    }

    // If the last match was the repeated patterns, then suggest the divider.
    if (index === 0 && this._divider) {
      patterns.push(this._children[1]);

      if (this._parent) {
        patterns.push(...this._parent.getPatternsAfter(this));
      }
    }

    // Suggest the pattern because the divider was the last match.
    if (index === 1) {
      patterns.push(this._children[0]);
    }

    // If there is no divider then suggest the repeating pattern and the next pattern after.
    if (index === 0 && !this._divider && this._parent) {
      patterns.push(this._children[0]);
      patterns.push(...this._parent.getPatternsAfter(this));
    }

    return patterns;
  }

  getNextPatterns(): Pattern[] {
    if (this._parent == null) {
      return [];
    }

    return this._parent.getPatternsAfter(this)
  }

  findPattern(predicate: (p: Pattern) => boolean): Pattern | null {
    return findPattern(this, predicate);
  }

  clone(name = this._name, isOptional = this._isOptional): Pattern {
    return new Repeat(
      name,
      this._pattern,
      {
        divider: this._divider == null ? undefined : this._divider,
        min: isOptional ? 0 : this._min
      }
    );
  }
}

