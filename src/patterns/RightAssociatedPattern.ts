import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";

let indexId = 0;

export class RightAssociatedPattern implements Pattern {
    readonly id: string;
    readonly type: string;
    readonly name: string;
    private _parent: Pattern | null;
    readonly children: Pattern[];

    get parent() {
        return this._parent;
    }

    set parent(pattern: Pattern | null) {
        this._parent = pattern;
    }

    constructor(pattern: Pattern) {
        this.id = `right-associated-${indexId++}`;
        this.type = "right-associated";
        this.name = "";
        this.parent = null;
        this.children = [pattern];
    }

    parse(cursor: Cursor): Node | null {
        return this.children[0].parse(cursor);
    }

    exec(text: string, record?: boolean | undefined): ParseResult {
        return this.children[0].exec(text, record);
    }

    test(text: string, record?: boolean | undefined): boolean {
        return this.children[0].test(text, record);
    }

    clone(name?: string | undefined): Pattern {
        return new RightAssociatedPattern(this.children[0]);
    }

    getTokens(): string[] {
        return this.children[0].getTokens();
    }
    getTokensAfter(childReference: Pattern): string[] {
        return this.children[0].getTokensAfter(childReference);
    }
    getNextTokens(): string[] {
        return this.children[0].getNextTokens();
    }
    getPatterns(): Pattern[] {
        return this.children[0].getPatterns();
    }
    getPatternsAfter(childReference: Pattern): Pattern[] {
        return this.children[0].getPatternsAfter(childReference);
    }
    getNextPatterns(): Pattern[] {
        return this.children[0].getNextPatterns();
    }
    find(predicate: (pattern: Pattern) => boolean): Pattern | null {
        return this.children[0].find(predicate);
    }
    isEqual(pattern: Pattern): boolean {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }
}