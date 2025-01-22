import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { Node } from "../ast/Node";
import { clonePatterns } from "./clonePatterns";
import { filterOutNull } from "./filterOutNull";
import { findPattern } from "./findPattern";

let idIndex = 0;

export class Sequence implements Pattern {
  private _id: string;
  private _type: string;
  private _name: string;
  private _parent: Pattern | null;
  private _children: Pattern[];
  private _nodes: (Node | null)[];
  private _firstIndex: number;

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

  constructor(name: string, sequence: Pattern[]) {
    if (sequence.length === 0) {
      throw new Error("Need at least one pattern with a 'sequence' pattern.");
    }

    const children = clonePatterns(sequence);
    this._assignChildrenToParent(children);

    this._id = `sequence-${idIndex++}`;
    this._type = "sequence";
    this._name = name;
    this._parent = null;
    this._children = children;
    this._firstIndex = -1;
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

  exec(text: string, record = false) {
    const cursor = new Cursor(text);
    record && cursor.startRecording();

    const ast = this.parse(cursor);

    return {
      ast: ast?.value === text ? ast : null,
      cursor
    };
  }

  parse(cursor: Cursor): Node | null {
    // This is a cache to help with speed
    this._firstIndex = cursor.index;
    this._nodes = [];
    const passed = this.tryToParse(cursor);

    if (passed) {
      const node = this.createNode(cursor);

      if (node !== null) {
        cursor.recordMatch(this, node);
      }

      return node;
    }

    return null;
  }

  private tryToParse(cursor: Cursor): boolean {
    if (this._isBeyondRecursiveDepth()) {
      cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
      return false;
    }

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
              continue;
            } else {
              // We are at the end of the text, it may still be valid, if all the
              // following patterns are optional.
              if (this.areRemainingPatternsOptional(i)) {
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
            continue;
          }
        } else {
          // If we don't have any results from what we parsed then record error.
          const lastNode = this.getLastValidNode();
          if (lastNode === null) {
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

  private _isBeyondRecursiveDepth() {
    let depth = 0;
    let pattern: Pattern | null = this;

    while (pattern != null) {
      if (pattern.id === this.id && this._firstIndex === (pattern as Sequence)._firstIndex) {
        depth++;
      }

      if (depth > 1) {
        return true;
      }

      pattern = pattern.parent;
    }

    return false;
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
      if (pattern.type !== "optional") {
        return false;
      }
    }

    return true;
  }

  private createNode(cursor: Cursor): Node | null {
    const children = filterOutNull(this._nodes);

    const lastIndex = children[children.length - 1].lastIndex;

    cursor.moveTo(lastIndex);

    return new Node(
      "sequence",
      this._name,
      this._firstIndex,
      lastIndex,
      children
    );
  }

  getTokens(): string[] {
    const tokens: string[] = [];

    for (const child of this._children) {
      tokens.push(...child.getTokens());

      if (child.type !== "optional" && child.type !== "not") {
        break;
      }
    }

    return tokens;
  }

  getTokensAfter(childReference: Pattern): string[] {
    const patterns = this.getPatternsAfter(childReference);
    const tokens: string[] = [];

    patterns.forEach(p => tokens.push(...p.getTokens()));

    return tokens;
  }

  getNextTokens(): string[] {
    if (this.parent == null) {
      return [];
    }

    return this.parent.getTokensAfter(this);
  }

  getPatterns(): Pattern[] {
    const patterns: Pattern[] = [];

    for (const child of this._children) {
      patterns.push(...child.getPatterns());

      if (child.type !== "optional" && child.type !== "not") {
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

  getNextPatterns(): Pattern[] {
    if (this.parent == null) {
      return [];
    }

    return this.parent.getPatternsAfter(this);
  }

  find(predicate: (p: Pattern) => boolean): Pattern | null {
    return findPattern(this, predicate);
  }

  clone(name = this._name): Pattern {
    const clone = new Sequence(name, this._children);
    clone._id = this._id;

    return clone;
  }

  isEqual(pattern: Sequence): boolean {
    return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
  }
}
