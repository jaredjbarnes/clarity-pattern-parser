import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";

let contextId = 0;

export class ContextPattern implements Pattern {
    private _id: string;
    private _type: string;
    private _name: string;
    private _parent: Pattern | null;
    private _children: Pattern[];
    private _pattern: Pattern;

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

    constructor(name: string, pattern: Pattern, context: Pattern[] = []) {
        this._id = `context-${contextId++}`;
        this._type = "context";
        this._name = name;
        this._parent = null;
        
        const clonedContext = context.map(p => p.clone());
        const clonedPattern = pattern.clone();
        
        clonedContext.forEach(p => p.parent = this);
        clonedPattern.parent = this;
        
        this._pattern = clonedPattern;
        this._children = [...clonedContext, clonedPattern];
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
        const clone = new ContextPattern(name, this._pattern, this._children.slice(-1));
        return clone;
    }

    getTokens(): string[] {
        return this._pattern.getTokens();
    }

    getTokensAfter(childReference: Pattern): string[] {
        return this._pattern.getTokensAfter(childReference);
    }

    getNextTokens(): string[] {
        return this._pattern.getNextTokens();
    }

    getPatterns(): Pattern[] {
        return this._pattern.getPatterns();
    }

    getPatternsAfter(childReference: Pattern): Pattern[] {
        return this._pattern.getPatternsAfter(childReference);
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