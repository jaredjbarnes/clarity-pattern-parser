import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";

let contextId = 0;

export class Context implements Pattern {
    private _id: string;
    private _type: string;
    private _name: string;
    private _parent: Pattern | null;
    private _children: Pattern[];
    private _pattern: Pattern;
    private _patterns: Record<string, Pattern>;

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

    getPatternWithinContext(name: string): Pattern | null {
        return this._patterns[name] || null;
    }

    getPatternsWithinContext() {
        return { ...this._patterns };
    }

    constructor(name: string, pattern: Pattern, context: Pattern[] = []) {
        this._id = `context-${contextId++}`;
        this._type = "context";
        this._name = name;
        this._parent = null;
        this._patterns = {};


        const clonedPattern = pattern.clone();
        context.forEach(p => this._patterns[p.name] = p);
        clonedPattern.parent = this;

        this._pattern = clonedPattern;
        this._children = [clonedPattern];
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
        const clone = new Context(name, this._pattern, Object.values(this._patterns));
        return clone;
    }

    getTokens(): string[] {
        return this._pattern.getTokens();
    }

    getTokensAfter(childReference: Pattern): string[] {
        if (this.parent == null) {
            return [];
        }
        return this._pattern.getTokensAfter(childReference);
    }

    getNextTokens(): string[] {
        return this._pattern.getNextTokens();
    }

    getPatterns(): Pattern[] {
        return this._pattern.getPatterns();
    }

    getPatternsAfter(childReference: Pattern): Pattern[] {
        if (this.parent == null) {
            return [];
        }

        return this.parent.getPatternsAfter(childReference);
    }

    getNextPatterns(): Pattern[] {
        return this._pattern.getNextPatterns();
    }

    find(predicate: (pattern: Pattern) => boolean): Pattern | null {
        return this._pattern.find(predicate);
    }

    isEqual(pattern: Pattern): boolean {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }

}