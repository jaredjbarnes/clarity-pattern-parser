import type { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { Pattern } from "./Pattern";

export class Not extends BasePattern {
  get startedOnIndex() {
    return this._children[0].startedOnIndex;
  }

  constructor(name: string, pattern: Pattern) {
    super("not", name, [pattern.clone()]);
    this._assignChildrenToParent(this._children);
  }

  parse(cursor: Cursor): Node | null {
    const firstIndex = cursor.index;
    this._children[0].parse(cursor);

    if (cursor.hasError) {
      cursor.resolveError();
      cursor.moveTo(firstIndex);
    } else {
      cursor.moveTo(firstIndex);
      cursor.resolveError();
      cursor.recordErrorAt(firstIndex, firstIndex, this);
    }

    return null;
  }

  clone(name = this._name): Pattern {
    const not = new Not(name, this._children[0]);
    not._cloneIdFrom(this);
    return not;
  }

  /**
   * A negative lookahead consumes nothing, so what it "expects" is whatever
   * comes after it — never its own child, which by definition must not match.
   */
  getTokens(): string[] {
    return this.getNextTokens();
  }

  getTokensAfter(_childReference: Pattern): string[] {
    return this.getNextTokens();
  }

  getPatterns(): Pattern[] {
    return this.getNextPatterns().flatMap(p => p.getPatterns());
  }

  getPatternsAfter(_childReference: Pattern): Pattern[] {
    return this.getNextPatterns();
  }
}
