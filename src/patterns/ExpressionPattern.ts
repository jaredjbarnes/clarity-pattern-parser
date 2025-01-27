import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";

let indexId = 0;

export class ExpressionPattern implements Pattern {
    private _id: string;
    private _type: string;
    private _name: string;
    private _parent: Pattern | null;
    private _token: string;
    private _firstIndex: number;

    get id(): string {
        return this._id;
    }

    get type(): string {
        return this._type;
    }

    get name(): string {
        return this._name;
    }

    get token(): string {
        return this._token;
    }

    get parent(): Pattern | null {
        return this._parent;
    }

    set parent(pattern: Pattern | null) {
        this._parent = pattern;
    }

    get children(): Pattern[] {
        return [];
    }

    constructor(){
        this._id = `expression-${indexId++}`;
        this._type = "expression";

    }

    parse(cursor: Cursor): Node | null {
        this._firstIndex = cursor.index;
        return null;
    }

    exec(text: string, record?: boolean | undefined): ParseResult {
        throw new Error("Method not implemented.");
    }

    test(text: string, record?: boolean | undefined): boolean {
        throw new Error("Method not implemented.");
    }

    clone(name?: string | undefined): Pattern {
        throw new Error("Method not implemented.");
    }

    getTokens(): string[] {
        throw new Error("Method not implemented.");
    }

    getTokensAfter(childReference: Pattern): string[] {
        throw new Error("Method not implemented.");
    }

    getNextTokens(): string[] {
        throw new Error("Method not implemented.");
    }

    getPatterns(): Pattern[] {
        throw new Error("Method not implemented.");
    }

    getPatternsAfter(childReference: Pattern): Pattern[] {
        throw new Error("Method not implemented.");
    }

    getNextPatterns(): Pattern[] {
        throw new Error("Method not implemented.");
    }

    find(predicate: (pattern: Pattern) => boolean): Pattern | null {
        throw new Error("Method not implemented.");
    }

    isEqual(pattern: Pattern): boolean {
        throw new Error("Method not implemented.");
    }
}