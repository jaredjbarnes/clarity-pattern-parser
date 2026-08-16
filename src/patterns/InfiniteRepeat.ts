import { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";

export interface InfiniteRepeatOptions {
  divider?: Pattern;
  min?: number;
  trimDivider?: boolean;
}

export class InfiniteRepeat extends BasePattern {
  private _pattern: Pattern;
  private _divider: Pattern | null;
  private _nodes: Node[];
  private _min: number;
  private _trimDivider: boolean;
  private _patterns: Pattern[];

  get min(): number {
    return this._min;
  }

  constructor(name: string, pattern: Pattern, options: InfiniteRepeatOptions = {}) {
    const divider = options.divider;

    super(
      "infinite-repeat",
      name,
      divider != null ? [pattern.clone(), divider.clone()] : [pattern.clone()]
    );

    this._assignChildrenToParent(this._children);

    this._min = options.min != null ? Math.max(options.min, 1) : 1;
    this._pattern = this._children[0];
    this._divider = this._children[1];
    this._nodes = [];
    this._trimDivider = options.trimDivider == null ? false : options.trimDivider;
    this._patterns = [];
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

    if (hasDivider && this._trimDivider && lastPattern === this._divider) {
      const dividerNode = this._nodes.pop() as Node;
      cursor.moveTo(dividerNode.firstIndex);
    }

    if (this._nodes.length === 0) {
      cursor.moveTo(this._firstIndex);
      return null;
    }

    const lastIndex = this._nodes[this._nodes.length - 1].lastIndex;
    cursor.moveTo(lastIndex);

    return new Node(this._type, this._name, this._firstIndex, lastIndex, this._nodes);
  }

  private _getLastValidNode(): Node | null {
    const nodes = this._nodes.filter(node => node !== null);

    if (nodes.length === 0) {
      return null;
    }

    return nodes[nodes.length - 1];
  }

  getTokens(): string[] {
    return this._pattern.getTokens();
  }

  getTokensAfter(childReference: Pattern): string[] {
    return this.getPatternsAfter(childReference).flatMap(p => p.getTokens());
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

  clone(name = this._name): Pattern {
    const min = this._min;
    const clone = new InfiniteRepeat(name, this._pattern, {
      divider: this._divider == null ? undefined : this._divider,
      min,
      trimDivider: this._trimDivider,
    });

    clone._cloneIdFrom(this);
    return clone;
  }
}
