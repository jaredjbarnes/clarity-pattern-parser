import type { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { ParseResult } from "./ParseResult";
import type { Pattern } from "./Pattern";

export class RightAssociated extends BasePattern {
  get startedOnIndex() {
    return this._children[0].startedOnIndex;
  }

  constructor(pattern: Pattern) {
    // Deliberately does not reparent its child: this wrapper is a marker read
    // by Expression during classification, not a link in the pattern tree.
    super("right-associated", "", [pattern.clone()]);
  }

  parse(cursor: Cursor): Node | null {
    return this._children[0].parse(cursor);
  }

  exec(text: string, record?: boolean | undefined): ParseResult {
    return this._children[0].exec(text, record);
  }

  test(text: string, record?: boolean | undefined): boolean {
    return this._children[0].test(text, record);
  }

  clone(_name?: string | undefined): Pattern {
    const clone = new RightAssociated(this._children[0]);
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

  find(predicate: (pattern: Pattern) => boolean): Pattern | null {
    return this._children[0].find(predicate);
  }
}
