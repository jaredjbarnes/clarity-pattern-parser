import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { clonePatterns } from "./clonePatterns";
import { findPattern } from "./findPattern";

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
  private _min: number;
  private _max: number;

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

  constructor(name: string, pattern: Pattern, divider?: Pattern, isOptional = false, min = 1, max = Infinity) {
    const patterns = divider != null ? [pattern, divider] : [pattern];
    const children: Pattern[] = clonePatterns(patterns, false);
    this._assignChildrenToParent(children);

    this._type = "repeat";
    this._name = name;
    this._isOptional = min < 1 ? true : isOptional;
    this._parent = null;
    this._children = children;
    this._pattern = children[0];
    this._divider = children[1];
    this._firstIndex = -1
    this._nodes = [];
    this._min = min;
    this._max = max;
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

    const successfulParse = this.tryToParse(cursor);
    const isWithinMatchBounds = successfulParse && this._isWithinMatchBounds();
    const passed = successfulParse && isWithinMatchBounds;

    if (passed) {
      cursor.resolveError();
      const node = this.createNode(cursor);

      if (node != null) {
        cursor.moveTo(node.lastIndex);
        cursor.recordMatch(this, node);
      }


      return node;
    }

    if (successfulParse && !isWithinMatchBounds) {
      cursor.moveTo(this._firstIndex);
      cursor.recordErrorAt(this._firstIndex, this._pattern);
    }

    if (!this._isOptional) {
      return null;
    }

    cursor.resolveError();
    return null;
  }

  private _isWithinMatchBounds() {
    const count = this._getMatchCount();
    return count >= this._min && count <= this._max
  }

  private tryToParse(cursor: Cursor): boolean {
    let passed = false;

    while (true) {
      const matchCount = this._getMatchCount();
      const isWithinBounds = matchCount < this._max;

      if (!isWithinBounds) {
        passed = true;
        break;
      }

      const runningCursorIndex = cursor.index;
      const repeatedNode = this._pattern.parse(cursor);

      if (cursor.hasError) {
        const lastValidNode = this.getLastValidNode();

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

    return passed;
  }

  private _getMatchCount() {
    if (this._divider != null) {
      return Math.ceil(this._nodes.length / 2);
    }
    return this._nodes.length;
  }

  private createNode(cursor: Cursor): Node | null {
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
      children,
      undefined
    );
  }

  private getLastValidNode(): Node | null {
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
    if (this.parent == null) {
      return []
    }

    return this.parent.getTokensAfter(this);
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
    if (this.parent == null) {
      return [];
    }

    return this.parent.getPatternsAfter(this)
  }

  findPattern(predicate: (p: Pattern) => boolean): Pattern | null {
    return findPattern(this, predicate);
  }

  clone(name = this._name, isOptional = this._isOptional): Pattern {
    return new Repeat(
      name,
      this._pattern,
      this._divider,
      isOptional,
      this._min,
      this._max
    );
  }
}

