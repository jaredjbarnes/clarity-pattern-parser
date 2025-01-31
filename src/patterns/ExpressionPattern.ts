import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";
import { findPattern } from "./findPattern";
import { Sequence } from "./Sequence";

let indexId = 0;

function createNode(name: string, children: Node[]) {
    return new Node("expression", name, 0, 0, children, "");
}

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
    private _recursivePatterns: Pattern[];
    private _recursiveNames: string[];
    private _endsInRecursion: boolean[];
    private _binaryAssociation: Association[];
    private _precedenceMap: Record<string, number>;
    private _binaryNames: string[];
    private _shouldCompactPatternsMap: Record<string, boolean>;

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
        return this._patterns;
    }

    get unaryPatterns(): readonly Pattern[] {
        return this._unaryPatterns;
    }

    get binaryPatterns(): readonly Pattern[] {
        return this._binaryPatterns;
    }

    get recursivePatterns(): readonly Pattern[] {
        return this._recursivePatterns;
    }

    get startedOnIndex() {
        return this._firstIndex;
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
        this._recursivePatterns = [];
        this._recursiveNames = [];
        this._endsInRecursion = [];
        this._binaryNames = [];
        this._binaryAssociation = [];
        this._precedenceMap = {};
        this._originalPatterns = patterns;
        this._shouldCompactPatternsMap = {};
        this._patterns = this._organizePatterns(patterns);

        if (this._unaryPatterns.length === 0) {
            throw new Error("Need at least one operand pattern with an 'expression' pattern.");
        }
    }

    private _organizePatterns(patterns: Pattern[]) {
        const finalPatterns: Pattern[] = [];
        patterns.forEach((pattern) => {
            this._shouldCompactPatternsMap[pattern.name] = pattern.shouldCompactAst;

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
            } else if (this._isRecursive(pattern)) {
                const name = this._extractName(pattern);
                const tail = this._extractRecursiveTail(pattern);

                tail.parent = this;

                this._recursivePatterns.push(tail);
                this._recursiveNames.push(name);
                this._endsInRecursion.push(this._endsWithRecursion(pattern));
                finalPatterns.push(tail);
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
            pattern.children.length === 3 &&
            pattern.children[0].type === "reference" &&
            pattern.children[0].name === this.name &&
            pattern.children[2].type === "reference" &&
            pattern.children[2].name === this.name;
    }

    private _extractDelimiter(pattern: Pattern) {
        if (pattern.type === "right-associated") {
            return pattern.children[0].children[1];
        }
        return pattern.children[1];
    }

    private _extractName(pattern: Pattern) {
        if (pattern.type === "right-associated") {
            return pattern.children[0].name;
        }

        return pattern.name;
    }

    private _isRecursive(pattern: Pattern) {
        if (pattern.type === "right-associated" && this._isRecursivePattern(pattern.children[0])) {
            return true;
        }

        return this._isRecursivePattern(pattern);
    }

    private _isRecursivePattern(pattern: Pattern) {
        return pattern.type === "sequence" &&
            pattern.children[0].type === "reference" &&
            pattern.children[0].name === this.name &&
            pattern.children.length > 1;
    }

    private _extractRecursiveTail(pattern: Pattern) {
        if (pattern.type === "right-associated") {
            return new Sequence(`${pattern.children[0].name}-tail`, pattern.children[0].children.slice(1));
        }
        return new Sequence(`${pattern.name}-tail`, pattern.children.slice(1));
    }

    private _endsWithRecursion(pattern: Pattern) {
        if (pattern.type === "right-associated") {
            pattern = pattern.children[0];
        }

        const lastChild = pattern.children[pattern.children.length - 1];
        return pattern.type === "sequence" &&
            pattern.children.length > 1 &&
            lastChild.type === "reference" &&
            lastChild.name === this.name;
    }

    parse(cursor: Cursor): Node | null {
        this._firstIndex = cursor.index;
        const node = this._tryToParse(cursor);

        if (node != null) {
            cursor.moveTo(node.lastIndex);
            cursor.resolveError();
            this._compactResult(node);
            return node;
        }

        cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
        return null;
    }

    private _compactResult(node: Node | null) {
        if (node == null) {
            return;
        }

        if (this.shouldCompactAst) {
            node.compact();
            return;
        }

        // This could be really expensive with large trees. So we optimize with these checks,
        // as well as use breadth first as to not recompact nodes over and over again. 
        const isCompactingNeeded = Object.values(this._shouldCompactPatternsMap).some(p => p);
        if (isCompactingNeeded) {
            node.walkBreadthFirst(n => {
                if (this._shouldCompactPatternsMap[n.name]) {
                    n.compact();
                }
            });
        }
    }

    private _tryToParse(cursor: Cursor): Node | null {
        if (this._isBeyondRecursiveAllowance()) {
            cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
            return null;
        }

        let lastUnaryNode: Node | null = null;
        let lastBinaryNode: Node | null = null;
        let onIndex = cursor.index;

        outer: while (true) {
            cursor.resolveError();
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

            if (lastUnaryNode == null) {
                break;
            }

            if (cursor.hasNext()) {
                cursor.next();
            } else {
                if (lastBinaryNode != null && lastUnaryNode != null) {
                    lastBinaryNode.appendChild(lastUnaryNode);
                }
                break;
            }

            onIndex = cursor.index;

            for (let i = 0; i < this._recursivePatterns.length; i++) {
                const pattern = this._recursivePatterns[i];
                const node = pattern.parse(cursor);

                if (node != null) {
                    const name = this._recursiveNames[i];

                    if (this._endsInRecursion[i]) {
                        if (lastBinaryNode != null && lastUnaryNode != null) {
                            lastBinaryNode.appendChild(lastUnaryNode);
                        }

                        const frontExpression = lastBinaryNode == null ? lastUnaryNode as Node : lastBinaryNode.findRoot();
                        const recursiveNode = createNode(name, [frontExpression, ...node.children]);

                        recursiveNode.normalize(this._firstIndex);

                        return recursiveNode;
                    } else {
                        const recursiveNode = createNode(name, [lastUnaryNode, ...node.children]);
                        recursiveNode.normalize(lastUnaryNode.startIndex);
                        lastUnaryNode = recursiveNode;

                        if (cursor.hasNext()) {
                            cursor.next();
                        } else {
                            if (lastBinaryNode != null) {
                                lastBinaryNode.appendChild(lastUnaryNode);
                            }
                            break outer;
                        }
                        onIndex = cursor.index;
                        i = -1;
                        continue;
                    }
                }

                cursor.resolveError();
                cursor.moveTo(onIndex);
            }

            onIndex = cursor.index;
            for (let i = 0; i < this._binaryPatterns.length; i++) {
                cursor.resolveError();
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
                    const node = createNode(name, [lastUnaryNode, delimiterNode]);
                    lastBinaryNode = node;
                } else if (lastBinaryNode != null && lastUnaryNode != null && delimiterNode != null) {
                    const precedence = this._precedenceMap[name];
                    const lastPrecendece = lastBinaryNode == null ? 0 : this._precedenceMap[lastBinaryNode.name] == null ? -1 : this._precedenceMap[lastBinaryNode.name];
                    const association = this._binaryAssociation[i];

                    if (precedence === lastPrecendece && association === Association.right) {
                        const node = createNode(name, [lastUnaryNode, delimiterNode]);
                        lastBinaryNode.appendChild(node);

                        lastBinaryNode = node;
                    } else if (precedence === lastPrecendece) {
                        const node = createNode(name, []);

                        lastBinaryNode.replaceWith(node);
                        lastBinaryNode.appendChild(lastUnaryNode);

                        node.append(lastBinaryNode, delimiterNode);
                        lastBinaryNode = node;
                    } else if (precedence > lastPrecendece) {
                        let ancestor = lastBinaryNode.parent;
                        let root: Node | null = lastBinaryNode;

                        while (ancestor != null) {
                            const nodePrecedence = this._precedenceMap[ancestor.name];

                            if (nodePrecedence > precedence) {
                                break;
                            }
                            root = ancestor;
                            ancestor = ancestor.parent;
                        }

                        lastBinaryNode.appendChild(lastUnaryNode);

                        if (root != null) {
                            const node = createNode(name, []);
                            root.replaceWith(node);
                            node.append(root, delimiterNode);

                            lastBinaryNode = node;
                        } else {
                            const node = createNode(name, [lastUnaryNode, delimiterNode]);
                            lastBinaryNode = node;
                        }

                    } else {
                        const node = createNode(name, [lastUnaryNode, delimiterNode]);
                        lastBinaryNode.appendChild(node);

                        lastBinaryNode = node;
                    }

                }

                if (cursor.hasNext()) {
                    cursor.next();
                } else {
                    break outer;
                }

                break;
            }

            if (lastBinaryNode == null) {
                break;
            }
        }

        if (lastBinaryNode == null) {
            return lastUnaryNode;
        } else {
            const root = lastBinaryNode.findAncestor(n => n.parent == null) as Node || lastBinaryNode;
            if (lastBinaryNode.children.length < 3) {
                lastBinaryNode.remove();

                if (lastBinaryNode === root) {
                    return lastUnaryNode;
                }
            }

            root.normalize(this._firstIndex);
            return root;
        }
    }

    private _isBeyondRecursiveAllowance() {
        let depth = 0;
        let pattern: Pattern | null = this;

        while (pattern != null) {
            if (pattern.id === this.id && pattern.startedOnIndex === this.startedOnIndex) {
                depth++;
            }

            if (depth > 2) {
                return true;
            }
            pattern = pattern.parent;
        }

        return false;
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
        return this.unaryPatterns.map(p => p.getTokens()).flat();
    }

    getTokensAfter(childReference: Pattern): string[] {
        if (this.unaryPatterns.indexOf(childReference)) {
            const recursiveTokens = this._recursivePatterns.map(p => p.getTokens()).flat();
            const binaryTokens = this._binaryPatterns.map(p => p.getTokens()).flat();

            return [...recursiveTokens, ...binaryTokens];
        }

        if (this.recursivePatterns.indexOf(childReference)) {
            return this._binaryPatterns.map(p => p.getTokens()).flat();
        }

        if (this.binaryPatterns.indexOf(childReference)) {
            const unaryTokens = this._unaryPatterns.map(p => p.getTokens()).flat();

            if (this._parent != null) {
                const nextTokens = this._parent.getTokensAfter(this);
                return [...unaryTokens, ...nextTokens];
            }

            return unaryTokens;
        }

        return [];
    }

    getNextTokens(): string[] {
        if (this._parent == null) {
            return [];
        }

        return this._parent.getTokensAfter(this);
    }

    getPatterns(): Pattern[] {
        return this.unaryPatterns.map(p => p.getPatterns()).flat();
    }

    getPatternsAfter(childReference: Pattern): Pattern[] {
        if (this.unaryPatterns.indexOf(childReference)) {
            const recursivePatterns = this._recursivePatterns.map(p => p.getPatterns()).flat();
            const binaryPatterns = this._binaryPatterns.map(p => p.getPatterns()).flat();

            return [...recursivePatterns, ...binaryPatterns];
        }

        if (this.recursivePatterns.indexOf(childReference)) {
            return this._binaryPatterns.map(p => p.getPatterns()).flat();
        }

        if (this.binaryPatterns.indexOf(childReference)) {
            const unaryPatterns = this._unaryPatterns.map(p => p.getPatterns()).flat();

            if (this._parent != null) {
                const nextPatterns = this._parent.getPatternsAfter(this);
                return [...unaryPatterns, ...nextPatterns];
            }

            return unaryPatterns;
        }

        return [];
    }

    getNextPatterns(): Pattern[] {
        if (this._parent == null) {
            return [];
        }

        return this._parent.getPatternsAfter(this);
    }

    find(predicate: (p: Pattern) => boolean): Pattern | null {
        return findPattern(this, predicate);
    }

    clone(name = this._name): Pattern {
        const clone = new ExpressionPattern(name, this._originalPatterns);
        clone._id = this._id;
        clone.shouldCompactAst = this.shouldCompactAst;
        return clone;
    }

    isEqual(pattern: ExpressionPattern): boolean {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }
}
