import { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import { Cursor } from "./Cursor";
import { FiniteRepeat } from "./FiniteRepeat";
import { InfiniteRepeat } from "./InfiniteRepeat";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";

export interface RepeatOptions {
  min?: number;
  max?: number;
  divider?: Pattern;
  trimDivider?: boolean;
}

interface InternalRepeatOptions {
  min: number;
  max: number;
  divider?: Pattern;
}

/**
 * Facade that picks the bounded or unbounded implementation. It reports the
 * chosen implementation's `type`, so its id keeps the "repeat-" prefix while
 * `type` is "finite-repeat" or "infinite-repeat".
 */
export class Repeat extends BasePattern {
  private _repeatPattern: InfiniteRepeat | FiniteRepeat;
  private _pattern: Pattern;
  private _options: InternalRepeatOptions;

  get min() {
    return this._options.min;
  }

  get max() {
    return this._options.max;
  }

  get startedOnIndex() {
    return this._repeatPattern.startedOnIndex;
  }

  get pattern() {
    return this._pattern;
  }

  get options() {
    return this._options;
  }

  constructor(name: string, pattern: Pattern, options: RepeatOptions = {}) {
    super("repeat", name);

    this._pattern = pattern;
    this._options = {
      ...options,
      min: options.min == null ? 1 : options.min,
      max: options.max == null ? Infinity : options.max,
    };

    if (this._options.max !== Infinity) {
      this._repeatPattern = new FiniteRepeat(name, pattern, this._options);
    } else {
      this._repeatPattern = new InfiniteRepeat(name, pattern, this._options);
    }

    this._type = this._repeatPattern.type;
    this._children = [this._repeatPattern];
    this._repeatPattern.parent = this;
  }

  parse(cursor: Cursor): Node | null {
    return this._repeatPattern.parse(cursor);
  }

  exec(text: string, record = false): ParseResult {
    return this._repeatPattern.exec(text, record);
  }

  test(text: string, record = false): boolean {
    return this._repeatPattern.test(text, record);
  }

  clone(name = this.name) {
    const clone = new Repeat(name, this._pattern, { ...this._options });

    clone._cloneIdFrom(this);
    return clone;
  }

  getTokens(): string[] {
    return this._repeatPattern.getTokens();
  }

  getTokensAfter(_childReference: Pattern): string[] {
    return this.getNextTokens();
  }

  getPatterns(): Pattern[] {
    return this._repeatPattern.getPatterns();
  }

  getPatternsAfter(_childReference: Pattern): Pattern[] {
    return this.getNextPatterns();
  }

  find(predicate: (p: Pattern) => boolean): Pattern | null {
    return this._repeatPattern.find(predicate);
  }
}
