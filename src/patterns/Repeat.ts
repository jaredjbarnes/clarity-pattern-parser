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

export class Repeat implements Pattern {
    private _repeatPattern: InfiniteRepeat | FiniteRepeat;
    private _options: RepeatOptions;

    get type() {
        return this._repeatPattern.type;
    }

    get name() {
        return this._repeatPattern.name;
    }

    get parent() {
        return this._repeatPattern.parent;
    }

    set parent(value: Pattern | null) {
        this._repeatPattern.parent = value;
    }

    get children() {
        return this._repeatPattern.children;
    }

    get isOptional() {
        return this._repeatPattern.isOptional;
    }

    constructor(name: string, pattern: Pattern, options: RepeatOptions = {}) {
        this._options = options;

        if (options.max != null) {
            this._repeatPattern = new FiniteRepeat(name, pattern, options.max, options);
        } else {
            this._repeatPattern = new InfiniteRepeat(name, pattern, options)
        }
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

    clone(name?: string, isOptional?: boolean) {
        return this._repeatPattern.clone(name, isOptional);
    }

    getTokens(): string[] {
        return this._repeatPattern.getTokens();
    }

    getTokensAfter(childReference: Pattern): string[] {
        return this._repeatPattern.getTokensAfter(childReference);
    }

    getNextTokens(): string[] {
        return this._repeatPattern.getNextTokens();
    }

    getPatterns(): Pattern[] {
        return this._repeatPattern.getPatterns();
    }

    getPatternsAfter(childReference: Pattern): Pattern[] {
        return this._repeatPattern.getPatternsAfter(childReference);
    }

    getNextPatterns(): Pattern[] {
        return this._repeatPattern.getNextPatterns();
    }

    findPattern(predicate: (p: Pattern) => boolean): Pattern | null {
        return this._repeatPattern.findPattern(predicate);
    }

}