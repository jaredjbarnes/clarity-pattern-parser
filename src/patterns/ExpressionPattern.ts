import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { DepthCache } from "./DepthCache";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";
import { findPattern } from "./findPattern";

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
    private _firstIndex: number;
    private _originalPatterns: Pattern[];
    private _patterns: Pattern[];
    private _unaryPatterns: Pattern[];
    private _binaryPatterns: Pattern[];
    private _binaryAssociation: Association[];
    private _precedenceMap: Record<string, number>;
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
        this._parent = null;
        this._firstIndex = -1;
        this._unaryPatterns = [];
        this._binaryPatterns = [];
        this._binaryNames = [];
        this._binaryAssociation = [];
        this._precedenceMap = {};
        this._originalPatterns = patterns;
        this._patterns = this._organizePatterns(patterns);

        if (this._unaryPatterns.length === 0){
            throw new Error("Need at least one operand pattern with an 'expression' pattern.");
        }
    }

    private _organizePatterns(patterns: Pattern[]) {
        const finalPatterns: Pattern[] = [];
        patterns.forEach((pattern) => {
            if (this._isBinary(pattern)) {
                const binaryName = this._extractName(pattern);
                const clone = this._extractDelimiter(pattern).clone();
                clone.parent = this;

                this._precedenceMap[binaryName] = this._binaryPatterns.length;
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

    private _extractDelimiter(pattern: Pattern) {
        return pattern.children[1];
    }

    private _extractName(pattern: Pattern) {
        if (pattern.type === "right-associated") {
            return pattern.children[0].name;
        }

        return pattern.name;
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
        let lastUnaryNode: Node | null = null;
        let lastBinaryNode: Node | null = null;
        let onIndex = cursor.index;

        outer: while (true) {
            onIndex = cursor.index;

            for (let i = 0; i < this._unaryPatterns.length; i++) {
                cursor.moveTo(onIndex);

                const pattern = this._unaryPatterns[i];
                const node = pattern.parse(cursor);

                if (node != null) {
                    lastUnaryNode = node;
                    break;
                } else {
                    lastUnaryNode = null;
                    cursor.resolveError();
                }
            }


            if (lastUnaryNode == null && lastBinaryNode != null && lastBinaryNode.children.length > 2) {
                break;
            }

            if (cursor.hasNext()) {
                cursor.next();
            } else {
                if (lastBinaryNode != null && lastUnaryNode != null){
                    lastBinaryNode.appendChild(lastUnaryNode);
                }
                break;
            }

            onIndex = cursor.index;

            for (let i = 0; i < this._binaryPatterns.length; i++) {
                cursor.moveTo(onIndex);

                const pattern = this._binaryPatterns[i];
                const name = this._binaryNames[i];
                const delimiterNode = pattern.parse(cursor);

                if (delimiterNode == null) {
                    if (i === this._binaryPatterns.length - 1) {
                        if (lastBinaryNode == null) {
                            return lastUnaryNode;
                        } else if (lastUnaryNode != null) {
                            lastBinaryNode.appendChild(lastUnaryNode);
                        }
                    }
                    continue;
                }

                if (lastBinaryNode == null && lastUnaryNode != null && delimiterNode != null) {
                    const node = Node.createNode(name, [lastUnaryNode, delimiterNode]);
                    lastBinaryNode = node;
                } else if (lastBinaryNode != null && lastUnaryNode != null && delimiterNode != null) {
                    const precedence = this._precedenceMap[name];
                    const lastPrecendece = lastBinaryNode == null ? 0 : this._precedenceMap[lastBinaryNode.name];

                    if (precedence >= lastPrecendece) {
                        const root = lastBinaryNode.findRoot();
                        lastBinaryNode.appendChild(lastUnaryNode);

                        if (root != null) {
                            const node = Node.createNode(name, [root, delimiterNode]);
                            lastBinaryNode = node;
                        } else {
                            const node = Node.createNode(name, [lastUnaryNode, delimiterNode]);
                            lastBinaryNode = node;
                        }

                    } else {
                        const node = Node.createNode(name, [lastUnaryNode, delimiterNode]);
                        lastBinaryNode.appendChild(node);
                        lastBinaryNode = node;
                    }

                }

                if (cursor.hasNext()){
                    cursor.next();
                } else {
                    break outer;
                }

                break;
            }
        }

        if (lastBinaryNode == null) {
            return lastUnaryNode;
        } else {
            const root = lastBinaryNode.findAncestor(n => n.parent == null) as Node || lastBinaryNode;
            if (lastBinaryNode.children.length < 3){
                lastBinaryNode.remove();
            }
            root.normalize(this._firstIndex);
            return root;
        }
    }

    test(text: string) {
        const cursor = new Cursor(text);
        const ast = this.parse(cursor);

        return ast?.value === text;
    }

    exec(text: string, record = false): ParseResult {
        const cursor = new Cursor(text);
        record && cursor.startRecording();

        const ast = this.parse(cursor);

        return {
            ast: ast?.value === text ? ast : null,
            cursor
        };
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

    find(predicate: (p: Pattern) => boolean): Pattern | null {
        return findPattern(this, predicate);
    }

    clone(name = this._name): Pattern {
        const clone = new ExpressionPattern(name, this._originalPatterns);
        clone._id = this._id;
        return clone;
    }

    isEqual(pattern: ExpressionPattern): boolean {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }
}
