import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { FiniteRepeat } from "./FiniteRepeat";
import { InfiniteRepeat } from "./InfiniteRepeat";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";

export interface RepeatOptions {
    min?: number;
    max?: number;
    divider?: Pattern;
}

interface InternalRepeatOptions {
    min: number;
    max: number;
    divider?: Pattern;
}

export class Repeat implements Pattern {
    private _repeatPattern: InfiniteRepeat | FiniteRepeat;
    private _parent: Pattern | null;
    private _pattern: Pattern;
    private _options: InternalRepeatOptions;
    private _children: Pattern[];

    get type() {
        return this._repeatPattern.type;
    }

    get name() {
        return this._repeatPattern.name;
    }

    get parent() {
        return this._parent;
    }

    set parent(value: Pattern | null) {
        this._parent = value;
    }

    get children() {
        return this._children;
    }

    get isOptional() {
        return this._repeatPattern.isOptional;
    }

    constructor(name: string, pattern: Pattern, options: RepeatOptions = {}) {
        this._pattern = pattern;
        this._parent = null;
        this._options = {
            ...options,
            min: options.min == null ? 1 : options.min,
            max: options.max == null ? Infinity : options.max
        };

        if (this._options.max != Infinity) {
            this._repeatPattern = new FiniteRepeat(name, pattern, this._options.max, this._options);
        } else {
            this._repeatPattern = new InfiniteRepeat(name, pattern, this._options)
        }

        this._children = [this._repeatPattern]
        this._repeatPattern.parent = this;
    }

    parse(cursor: Cursor): Node | null {
        return this._repeatPattern.parse(cursor);
    }

    exec(text: string): ParseResult {
        return this._repeatPattern.exec(text);
    }

    test(text: string): boolean {
        return this._repeatPattern.test(text);
    }

    clone(name = this.name, isOptional?: boolean) {
        let min = this._options.min;

        if (isOptional != null) {
            if (isOptional) {
                min = 0
            } else {
                min = Math.max(this._options.min, 1);
            }
        }

        return new Repeat(name, this._pattern, { ...this._options, min });
    }

    getTokens(): string[] {
        return this._repeatPattern.getTokens();
    }

    getTokensAfter(_childReference: Pattern): string[] {
        if (this._parent == null) {
            return []
        }

        return this._parent.getTokensAfter(this);
    }

    getNextTokens(): string[] {
        if (this._parent == null) {
            return []
        }

        return this._parent.getNextTokens();
    }

    getPatterns(): Pattern[] {
        return this._repeatPattern.getPatterns();
    }

    getPatternsAfter(_childReference: Pattern): Pattern[] {
        if (this._parent == null) {
            return []
        }

        return this._parent.getPatternsAfter(this);
    }

    getNextPatterns(): Pattern[] {
        if (this._parent == null) {
            return []
        }

        return this._parent.getNextPatterns();
    }

    findPattern(predicate: (p: Pattern) => boolean): Pattern | null {
        return this._repeatPattern.findPattern(predicate);
    }

}