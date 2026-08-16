import { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { Pattern } from "./Pattern";
import { clonePatterns } from "./clonePatterns";
import { filterOutNull } from "./filterOutNull";
import { isRecursivePattern } from "./isRecursivePattern";

export class Sequence extends BasePattern {
  private _nodes: (Node | null)[];

  constructor(name: string, sequence: Pattern[]) {
    if (sequence.length === 0) {
      throw new Error("Need at least one pattern with a 'sequence' pattern.");
    }

    super("sequence", name, clonePatterns(sequence));
    this._assignChildrenToParent(this._children);

    this._firstIndex = -1;
    this._nodes = [];
  }

  parse(cursor: Cursor): Node | null {
    this._firstIndex = cursor.index;
    this._nodes = [];
    const passed = this._tryToParse(cursor);
    if (passed) {
      const node = this._createNode(cursor);

      if (node !== null) {
        cursor.recordMatch(this, node);
      }

      return node;
    }

    return null;
  }

  private _tryToParse(cursor: Cursor): boolean {
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
              // We had a match. Increment the cursor and use the next pattern.
              cursor.next();
            } else {
              // We are at the end of the text, it may still be valid, if all the
              // following patterns are optional.
              if (this._areRemainingPatternsOptional(i)) {
                passed = true;
                break;
              }

              // We didn't finish the parsing sequence.
              cursor.recordErrorAt(this._firstIndex, cursor.index + 1, this);
              break;
            }
          } else {
            // An optional pattern did not matched, try from the same spot on the next
            // pattern.
            cursor.moveTo(runningCursorIndex);
          }
        } else {
          // If we don't have any results from what we parsed then record error.
          const lastNode = this._getLastValidNode();
          if (lastNode === null && !this._areAllPatternsOptional()) {
            cursor.recordErrorAt(this._firstIndex, cursor.index, this);
            break;
          }

          // The sequence was parsed fully.
          passed = true;
          break;
        }
      } else {
        // The pattern failed.
        cursor.moveTo(this._firstIndex);
        break;
      }
    }

    return passed;
  }

  private _getLastValidNode(): Node | null {
    const nodes = filterOutNull(this._nodes);

    if (nodes.length === 0) {
      return null;
    }

    return nodes[nodes.length - 1];
  }

  private _areAllPatternsOptional() {
    return this._areRemainingPatternsOptional(-1);
  }

  private _areRemainingPatternsOptional(fromIndex: number): boolean {
    const startOnIndex = fromIndex + 1;
    const length = this._children.length;

    for (let i = startOnIndex; i < length; i++) {
      const pattern = this._children[i];
      if (pattern.type !== "optional") {
        return false;
      }
    }

    return true;
  }

  private _createNode(cursor: Cursor): Node | null {
    const children = filterOutNull(this._nodes);

    if (children.length === 0) {
      cursor.moveTo(this._firstIndex);
      return null;
    }

    const lastIndex = children[children.length - 1].lastIndex;

    cursor.moveTo(lastIndex);

    return new Node("sequence", this._name, this._firstIndex, lastIndex, children);
  }

  getTokens(): string[] {
    const tokens: string[] = [];

    for (const pattern of this._children) {
      if (isRecursivePattern(pattern) && pattern === this._children[0]) {
        return tokens;
      }

      tokens.push(...pattern.getTokens());
      if (pattern.type !== "optional" && pattern.type !== "not") {
        break;
      }
    }

    return tokens;
  }

  getTokensAfter(childReference: Pattern): string[] {
    return this.getPatternsAfter(childReference).flatMap(p => p.getTokens());
  }

  getPatterns(): Pattern[] {
    const patterns: Pattern[] = [];

    for (const pattern of this._children) {
      if (isRecursivePattern(pattern) && pattern === this._children[0]) {
        return patterns;
      }

      patterns.push(...pattern.getPatterns());

      if (pattern.type !== "optional" && pattern.type !== "not") {
        break;
      }
    }

    return patterns;
  }

  getPatternsAfter(childReference: Pattern): Pattern[] {
    const patterns: Pattern[] = [];
    let nextSiblingIndex = -1;
    let index = -1;

    for (let i = 0; i < this._children.length; i++) {
      if (this._children[i] === childReference) {
        nextSiblingIndex = i + 1;
        index = i;
        break;
      }
    }

    // The child reference isn't one of the child patterns.
    if (index === -1) {
      return [];
    }

    // The reference pattern is the last child. So ask the parent for the next pattern.
    if (nextSiblingIndex === this._children.length && this._parent !== null) {
      return this._parent.getPatternsAfter(this);
    }

    // Send back as many optional patterns as possible.
    for (let i = nextSiblingIndex; i < this._children.length; i++) {
      const child = this._children[i];
      patterns.push(child);

      if (child.type !== "optional") {
        break;
      }

      // If we are on the last child and its options then ask for the next pattern from the parent.
      if (i === this._children.length - 1 && this._parent !== null) {
        patterns.push(...this._parent.getPatternsAfter(this));
      }
    }

    return patterns;
  }

  clone(name = this._name): Pattern {
    const clone = new Sequence(name, this._children);
    clone._cloneIdFrom(this);

    return clone;
  }
}
