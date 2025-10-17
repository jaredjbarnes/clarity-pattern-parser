import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { FiniteRepeat } from "./FiniteRepeat";
import { InfiniteRepeat } from "./InfiniteRepeat";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";

let idIndex = 0;

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

export class Repeat implements Pattern {
    private _id: string;
    private _repeatPattern: InfiniteRepeat | FiniteRepeat;
    private _parent: Pattern | null;
    private _pattern: Pattern;
    private _options: InternalRepeatOptions;
    private _children: Pattern[];

    get id() {
        return this._id;
    }

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
        this._id = `repeat-${idIndex++}`;
        this._pattern = pattern;
        this._parent = null;
        this._options = {
            ...options,
            min: options.min == null ? 1 : options.min,
            max: options.max == null ? Infinity : options.max
        };

        if (this._options.max !== Infinity) {
            this._repeatPattern = new FiniteRepeat(name, pattern, this._options);
        } else {
            this._repeatPattern = new InfiniteRepeat(name, pattern, this._options);
        }

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
        let min = this._options.min;
        const clone = new Repeat(name, this._pattern, { ...this._options, min });

        clone._id = this._id;
        return clone;
    }

    getTokens(): string[] {
        return this._repeatPattern.getTokens();
    }

    getTokensAfter(_childReference: Pattern): string[] {
        if (this._parent == null) {
            return [];
        }

        return this._parent.getTokensAfter(this);
    }

    getNextTokens(): string[] {
        if (this._parent == null) {
            return [];
        }

        return this._parent.getTokensAfter(this);
    }

    getPatterns(): Pattern[] {
        return this._repeatPattern.getPatterns();
    }

    getPatternsAfter(_childReference: Pattern): Pattern[] {
        if (this._parent == null) {
            return [];
        }

        return this._parent.getPatternsAfter(this);
    }

    getNextPatterns(): Pattern[] {
        if (this._parent == null) {
            return [];
        }

        return this._parent.getPatternsAfter(this);
    }

    find(predicate: (p: Pattern) => boolean): Pattern | null {
        return this._repeatPattern.find(predicate);
    }

    isEqual(pattern: Repeat): boolean {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }
}