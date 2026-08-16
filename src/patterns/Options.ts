import { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { clonePatterns } from "./clonePatterns";
import { isRecursivePattern } from "./isRecursivePattern";

export class Options extends BasePattern {
  private _isGreedy: boolean;

  constructor(name: string, options: Pattern[], isGreedy = false) {
    if (options.length === 0) {
      throw new Error("Need at least one pattern with an 'options' pattern.");
    }

    super("options", name, clonePatterns(options));
    this._assignChildrenToParent(this._children);

    this._isGreedy = isGreedy;
  }

  parse(cursor: Cursor): Node | null {
    this._firstIndex = cursor.index;
    const node = this._tryToParse(cursor);

    if (node != null) {
      cursor.moveTo(node.lastIndex);
      cursor.resolveError();

      return node;
    }

    cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
    return null;
  }

  private _tryToParse(cursor: Cursor): Node | null {
    const results: (Node | null)[] = [];

    for (const pattern of this._children) {
      cursor.moveTo(this._firstIndex);
      let result = null;

      result = pattern.parse(cursor);

      if (this._isGreedy) {
        results.push(result);
      }

      if (result != null && !this._isGreedy) {
        return result;
      }

      cursor.resolveError();
    }

    const nonNullResults = results.filter(r => r != null) as Node[];
    nonNullResults.sort((a, b) => b.endIndex - a.endIndex);

    return nonNullResults[0] || null;
  }

  getTokens(): string[] {
    const tokens: string[] = [];

    for (const pattern of this._children) {
      if (isRecursivePattern(pattern)) {
        continue;
      }
      tokens.push(...pattern.getTokens());
    }

    return tokens;
  }

  getTokensAfter(_childReference: Pattern): string[] {
    return this.getNextTokens();
  }

  getPatterns(): Pattern[] {
    const patterns: Pattern[] = [];

    for (const pattern of this._children) {
      if (isRecursivePattern(pattern)) {
        continue;
      }
      patterns.push(...pattern.getPatterns());
    }

    return patterns;
  }

  getPatternsAfter(_childReference: Pattern): Pattern[] {
    return this.getNextPatterns();
  }

  clone(name = this._name): Pattern {
    const clone = new Options(name, this._children, this._isGreedy);
    clone._cloneIdFrom(this);
    return clone;
  }
}
