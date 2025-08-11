import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { findPattern } from "./findPattern";
import { ParseResult } from "./ParseResult";
import { execPattern } from "./execPattern";
import { testPattern } from "./testPattern";

let idIndex = 0;

export interface InfiniteRepeatOptions {
  divider?: Pattern;
  min?: number;
  trimDivider?: boolean;
}

export class InfiniteRepeat implements Pattern {
  private _id: string;
  private _type: string;
  private _name: string;
  private _parent: Pattern | null;
  private _children: Pattern[];
  private _pattern: Pattern;
  private _divider: Pattern | null;
  private _nodes: Node[];
  private _firstIndex: number;
  private _min: number;
  private _trimDivider: boolean;
  private _patterns: Pattern[];

  get id(): string {
    return this._id;
  }

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

  get min(): number {
    return this._min;
  }

  get startedOnIndex() {
    return this._firstIndex;
  }

  constructor(name: string, pattern: Pattern, options: InfiniteRepeatOptions = {}) {
    const min = options.min != null ? Math.max(options.min, 1) : 1;
    const divider = options.divider;
    let children: Pattern[];

    if (divider != null) {
      children = [pattern.clone(), divider.clone()];
    } else {
      children = [pattern.clone()];
    }

    this._assignChildrenToParent(children);

    this._id = `infinite-repeat-${idIndex++}`;
    this._type = "infinite-repeat";
    this._name = name;
    this._min = min;
    this._parent = null;
    this._children = children;
    this._pattern = children[0];
    this._divider = children[1];
    this._firstIndex = 0;
    this._nodes = [];
    this._trimDivider = options.trimDivider == null ? false : options.trimDivider;
    this._patterns = [];
  }

  private _assignChildrenToParent(children: Pattern[]): void {
    for (const child of children) {
      child.parent = this;
    }
  }

  test(text: string, record = false): boolean {
    return testPattern(this, text, record);
  }

  exec(text: string, record = false): ParseResult {
    return execPattern(this, text, record);
  }

  parse(cursor: Cursor): Node | null {
    this._firstIndex = cursor.index;
    this._nodes = [];
    this._patterns = [];

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

    if (this._min > 0) {
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
    const firstIndex = cursor.index;
    let passed = false;

    while (true) {
      const runningCursorIndex = cursor.index;
      const repeatNode = this._pattern.parse(cursor);

      const hasError = cursor.hasError;
      const hasNoErrorAndNoResult = !cursor.hasError && repeatNode == null;
      const hasDivider = this._divider != null;
      const hasNoDivider = !hasDivider;

      if (hasError) {
        const lastValidNode = this._getLastValidNode();

        if (lastValidNode != null) {
          passed = true;
        } else {
          cursor.moveTo(runningCursorIndex);
          cursor.recordErrorAt(firstIndex, runningCursorIndex, this._pattern);
          passed = false;
        }

        break;
      } else {
        if (hasNoErrorAndNoResult && hasNoDivider) {
          // If we didn't match and didn't error we need to get out. Nothing different will happen.
          break;
        }

        if (repeatNode != null) {
          this._nodes.push(repeatNode);
          this._patterns.push(this._pattern);

          if (!cursor.hasNext()) {
            passed = true;
            break;
          }

          cursor.next();
        }

        if (this._divider != null) {
          const dividerStartIndex = cursor.index;
          const dividerNode = this._divider.parse(cursor);

          if (cursor.hasError) {
            passed = true;
            break;
          } else {
            if (dividerNode == null) {
              cursor.moveTo(dividerStartIndex);

              if (repeatNode == null) {
                // If neither the repeat pattern or divider pattern matched get out. 
                passed = true;
                break;
              }
            } else {
              this._nodes.push(dividerNode);
              this._patterns.push(this._divider);

              if (!cursor.hasNext()) {
                passed = true;
                break;
              }

              cursor.next();
            }
          }
        }
      }
    }

    const hasMinimum = this._meetsMin();

    if (hasMinimum) {
      return passed;
    } else if (!hasMinimum && passed) {
      cursor.recordErrorAt(firstIndex, cursor.index, this);
      cursor.moveTo(this._firstIndex);
      return false;
    }

    return passed;
  }

  private _createNode(cursor: Cursor): Node | null {
    const hasDivider = this._divider != null;
    const lastPattern = this._patterns[this._patterns.length - 1];

    if (
      hasDivider &&
      this._trimDivider &&
      lastPattern === this._divider
    ) {
      const dividerNode = this._nodes.pop() as Node;
      cursor.moveTo(dividerNode.firstIndex);
    }

    if (this._nodes.length === 0) {
      cursor.moveTo(this._firstIndex);
      return null;
    }

    const lastIndex = this._nodes[this._nodes.length - 1].lastIndex;
    cursor.moveTo(lastIndex);

    return new Node(
      this._type,
      this._name,
      this._firstIndex,
      lastIndex,
      this._nodes
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
      return [];
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
    if (index === 0 && this._divider == null && this._parent) {
      patterns.push(this._children[0]);
      patterns.push(...this._parent.getPatternsAfter(this));
    }

    return patterns;
  }

  getNextPatterns(): Pattern[] {
    if (this._parent == null) {
      return [];
    }

    return this._parent.getPatternsAfter(this);
  }

  find(predicate: (p: Pattern) => boolean): Pattern | null {
    return findPattern(this, predicate);
  }

  clone(name = this._name): Pattern {
    let min = this._min;

    const clone = new InfiniteRepeat(
      name,
      this._pattern,
      {
        divider: this._divider == null ? undefined : this._divider,
        min: min,
        trimDivider: this._trimDivider
      }
    );

    clone._id = this._id;
    return clone;
  }

  isEqual(pattern: InfiniteRepeat): boolean {
    return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
  }
}

