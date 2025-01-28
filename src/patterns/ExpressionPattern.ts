import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { DepthCache } from "./DepthCache";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";

let indexId = 0;
const depthCache = new DepthCache();

enum Association {
    left = 0,
    right = 1,
}

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
    private _binaryAssociation: Association[];
    private _binaryNames: string[];

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
        if (patterns.length === 0) {
            throw new Error("Need at least one pattern with an 'expression' pattern.");
        }

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
        patterns.forEach((pattern) => {
            if (this._isBinary(pattern)) {
                const binaryName = pattern.name;
                const clone = this._extractDelimiter(pattern).clone();
                clone.parent = this;

                this._binaryPatterns.push(clone);
                this._binaryNames.push(binaryName);

                if (pattern.type === "right-associated") {
                    this._binaryAssociation.push(Association.right);
                } else {
                    this._binaryAssociation.push(Association.left);
                }

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
        // This is a cache to help with speed
        this._firstIndex = cursor.index;
        depthCache.incrementDepth(this._id, this._firstIndex);

        this._firstIndex = cursor.index;
        const node = this._tryToParse(cursor);

        depthCache.decrementDepth(this._id, this._firstIndex);

        if (node != null) {
            cursor.moveTo(node.lastIndex);
            cursor.resolveError();
            return node;
        }

        cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
        return null;
    }

    private _tryToParse(cursor: Cursor): Node | null {
        const astStack: Node[] = [];
        let binaryIndex: number = -1;
        let associationStack: Association[] = [];
        let onIndex = cursor.index;

        while (true) {
            onIndex = cursor.index;

            for (let i = 0; i < this._unaryPatterns.length; i++) {
                cursor.moveTo(onIndex);

                const pattern = this._unaryPatterns[i];
                const node = pattern.parse(cursor);
                if (node != null) {
                    astStack.push(node);
                    break;
                }
            }

            if (astStack.length === 0) {
                return null;
            } else if (astStack.length > 1) {
                // if (association === Association.left){

                // }
            } else if (astStack.length === 1) {
                return astStack[0]
            }

            const canContinue = cursor.hasNext();

            if (canContinue) {
                cursor.next();
            } else if (!canContinue && astStack.length > 1) {

            } else if (!canContinue && astStack.length === 1) {
                return astStack[0];
            }

            onIndex = cursor.index;

            for (let i = 0; i < this._binaryPatterns.length; i++) {
                cursor.moveTo(onIndex);
                const name = this._binaryNames[i];
                const pattern = this._binaryPatterns[i];

                const node = pattern.parse(cursor);

                if (node != null) {
                    binaryIndex = i;

                    // const binaryNode = Node.createNode(name, []);
                    // association = this._binaryAssociation[i];

                    // if (association === Association.left) {
                    //     if (nodeToAppendTo != null){
                    //         nodeToAppendTo = binaryNode;
                    //     } else {
                    //         nodeToAppendTo.
                    //     }
                    //  } else {

                    // }
                }

            }
        }

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