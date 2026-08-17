import type { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { ParseResult } from "./ParseResult";
import type { Pattern } from "./Pattern";

export class Context extends BasePattern {
  private _referencePatternName: string;
  private _patterns: Record<string, Pattern>;

  get startedOnIndex() {
    return this._children[0].startedOnIndex;
  }

  private get _pattern(): Pattern {
    return this._children[0];
  }

  constructor(name: string, pattern: Pattern, context: Pattern[] = []) {
    super("context", name, [pattern.clone()]);

    this._referencePatternName = name;
    this._patterns = {};
    context.forEach(p => {
      this._patterns[p.name] = p;
    });

    this._assignChildrenToParent(this._children);
  }

  getPatternWithinContext(name: string): Pattern | null {
    if (this._name === name || this._referencePatternName === name) {
      return this;
    }

    return this._patterns[name] || null;
  }

  getPatternsWithinContext() {
    return { ...this._patterns };
  }

  parse(cursor: Cursor): Node | null {
    return this._pattern.parse(cursor);
  }

  exec(text: string, record?: boolean | undefined): ParseResult {
    return this._pattern.exec(text, record);
  }

  test(text: string, record?: boolean | undefined): boolean {
    return this._pattern.test(text, record);
  }

  clone(name = this._name): Pattern {
    const clone = new Context(
      name,
      this._pattern.clone(name),
      Object.values(this._patterns)
    );
    clone._referencePatternName = this._referencePatternName;
    clone._cloneIdFrom(this);
    return clone;
  }

  getTokens(): string[] {
    return this._pattern.getTokens();
  }

  getTokensAfter(_childReference: Pattern): string[] {
    return this.getNextTokens();
  }

  getPatterns(): Pattern[] {
    return this._pattern.getPatterns();
  }

  getPatternsAfter(_childReference: Pattern): Pattern[] {
    return this.getNextPatterns();
  }

  find(predicate: (pattern: Pattern) => boolean): Pattern | null {
    return this._pattern.find(predicate);
  }
}
