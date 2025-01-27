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
    private _patterns: Pattern[];
    private _unaryPatterns: Pattern[];
    private _binaryPatterns: Pattern[];

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
        return this._patterns;
    }

    constructor(name: string, patterns: Pattern[]) {
        this._id = `expression-${indexId++}`;
        this._type = "expression";
        this._name = name;
        this._unaryPatterns = [];
        this._binaryPatterns = [];

        this._patterns.forEach(p => p.parent = this);
        this._patterns = this._organizePatterns(patterns);
    }

    private _organizePatterns(patterns: Pattern[]) {
        const finalPatterns: Pattern[] = [];
        this._patterns.forEach((pattern) => {


            if (this._isBinary(pattern)) {
                const clone = this._extractDelimiter(pattern).clone();
                clone.parent = this;

                this._binaryPatterns.push(clone);
                finalPatterns.push(clone);
            } else {
                const clone = pattern.clone();
                clone.parent = this;

                this._unaryPatterns.push(clone);
                finalPatterns.push(clone);
            }
        });

        return finalPatterns;
    }

    private _isBinary(pattern: Pattern) {
        if (pattern.type === "right-associated" && this._isBinaryPattern(pattern.children[0])) {
            return true;
        }

        return this._isBinaryPattern(pattern);
    }

    private _isBinaryPattern(pattern: Pattern) {
        return pattern.type === "sequence" &&
            pattern.children[0].type === "reference" &&
            pattern.children[0].name === this.name &&
            pattern.children[2].type === "reference" &&
            pattern.children[2].name === this.name &&
            pattern.children.length === 3;
    }

    private _extractDelimiter(pattern) {
        return pattern.children[1];
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