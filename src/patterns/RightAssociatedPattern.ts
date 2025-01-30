import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";

let indexId = 0;

export class RightAssociatedPattern implements Pattern {
    private _id: string;
    private _type: string;
    private _name: string;
    private _parent: Pattern | null;
    private _children: Pattern[];

    shouldCompactAst = false;

    get id(): string {
        return this._id;
    }

    get type(): string {
        return this._type;
    }

    get name(): string {
        return this._name;
    }

    get parent(): Pattern | null {
        return this._parent;
    }

    set parent(pattern: Pattern | null) {
        this._parent = pattern;
    }

    get children(): Pattern[] {
        return this._children;
    }

    constructor(pattern: Pattern) {
        this._id = `right-associated-${indexId++}`;
        this._type = "right-associated";
        this._name = "";
        this._parent = null;
        this._children = [pattern.clone()];
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

    clone(_name?: string | undefined): Pattern {
        const clone = new RightAssociatedPattern(this.children[0]);
        clone._id = this._id;
        return clone;
    }

    getTokens(): string[] {
        return this.children[0].getTokens();
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
        return this.children[0].getPatterns();
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
    find(predicate: (pattern: Pattern) => boolean): Pattern | null {
        return this.children[0].find(predicate);
    }
    isEqual(pattern: Pattern): boolean {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }
}