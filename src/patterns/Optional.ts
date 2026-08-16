import type { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { Pattern } from "./Pattern";

export class Optional extends BasePattern {
  get startedOnIndex() {
    return this._children[0].startedOnIndex;
  }

  constructor(name: string, pattern: Pattern) {
    super("optional", name, [pattern.clone()]);
    this._assignChildrenToParent(this._children);
  }

  parse(cursor: Cursor): Node | null {
    const firstIndex = cursor.index;
    const node = this._children[0].parse(cursor);

    if (cursor.hasError) {
      cursor.resolveError();
      cursor.moveTo(firstIndex);

      return null;
    } else {
      return node;
    }
  }

  clone(name = this._name): Pattern {
    const clone = new Optional(name, this._children[0]);
    clone._cloneIdFrom(this);
    return clone;
  }

  getTokens(): string[] {
    return this._children[0].getTokens();
  }

  getTokensAfter(_childReference: Pattern): string[] {
    return this.getNextTokens();
  }

  getPatterns(): Pattern[] {
    return this._children[0].getPatterns();
  }

  getPatternsAfter(_childReference: Pattern): Pattern[] {
    return this.getNextPatterns();
  }
}
