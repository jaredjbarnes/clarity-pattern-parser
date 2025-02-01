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

interface ParseContext {
    atomPrefixNode: Node | null;
    atomPrefixName: string;
    atomSuffixNode: Node | null;
    atomSuffixName: string;
    atomNode: Node | null;
    binaryNode: Node | null;
    onIndex: number;
    cursor: Cursor;
    shouldStop: boolean;
}

export class ExpressionPattern implements Pattern {
    private _id: string;
    private _type: string;
    private _name: string;
    private _parent: Pattern | null;
    private _firstIndex: number;
    private _originalPatterns: Pattern[];
    private _patterns: Pattern[];
    private _atomPatterns: Pattern[];
    private _atomPrefixPatterns: Pattern[];
    private _atomPrefixNames: string[];
    private _atomSuffixPatterns: Pattern[];
    private _atomSuffixNames: string[];
    private _binaryPatterns: Pattern[];
    private _recursivePatterns: Pattern[];
    private _recursiveNames: string[];
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

    get unaryPrefixPatterns(): readonly Pattern[] {
        return this._atomPrefixPatterns;
    }

    get atomPatterns(): readonly Pattern[] {
        return this._atomPatterns;
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
        this._atomPatterns = [];
        this._atomPrefixPatterns = [];
        this._atomPrefixNames = [];
        this._atomSuffixPatterns = [];
        this._atomSuffixNames = [];
        this._binaryPatterns = [];
        this._recursivePatterns = [];
        this._recursiveNames = [];
        this._binaryNames = [];
        this._binaryAssociation = [];
        this._precedenceMap = {};
        this._originalPatterns = patterns;
        this._shouldCompactPatternsMap = {};
        this._patterns = this._organizePatterns(patterns);

        if (this._atomPatterns.length === 0) {
            throw new Error("Need at least one operand pattern with an 'expression' pattern.");
        }
    }

    private _organizePatterns(patterns: Pattern[]) {
        const finalPatterns: Pattern[] = [];
        patterns.forEach((pattern) => {
            this._shouldCompactPatternsMap[pattern.name] = pattern.shouldCompactAst;

            if (this._isAtom(pattern)) {
                const clone = pattern.clone();
                clone.parent = this;

                this._atomPatterns.push(clone);
                finalPatterns.push(clone);
            } else if (this._isPrefix(pattern)) {
                const name = this._extractName(pattern);
                const atomPrefix = this._unwrapAssociationIfNecessary(pattern).clone();
               
                atomPrefix.parent = this;

                this._atomPrefixPatterns.push(atomPrefix);
                this._atomPrefixNames.push(name);
                finalPatterns.push(atomPrefix);
            } else if (this._isSuffix(pattern)) {
                const name = this._extractName(pattern);
                const suffix = this._extractSuffix(pattern);
                suffix.parent = this;

                this._atomSuffixPatterns.push(suffix);
                this._atomSuffixNames.push(name);
                finalPatterns.push(suffix);
            } else if (this._isRecursive(pattern)) {
                const name = this._extractName(pattern);
                const recursionSuffix = this._extractRecursionSuffix(pattern);

                recursionSuffix.parent = this;

                this._recursivePatterns.push(recursionSuffix);
                this._recursiveNames.push(name);
                finalPatterns.push(recursionSuffix);
            } else if (this._isBinary(pattern)) {
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
            }
        });

        return finalPatterns;
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

    private _isPrefix(pattern: Pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);

        const lastChild = pattern.children[pattern.children.length - 1];
        const referenceCount = this._referenceCount(pattern);
        const lastChildIsReference = lastChild.type === "reference" &&
            lastChild.name === this.name;

        return lastChildIsReference &&
            referenceCount === 1;
    }

    private _isAtom(pattern: Pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);

        const firstChild = pattern.children[0];
        const lastChild = pattern.children[1];
        const firstChildIsReference = firstChild.type === "reference" &&
            firstChild.name === this.name;
        const lastChildIsReference = lastChild.type === "reference" &&
            lastChild.name === this.name;

        return !firstChildIsReference && !lastChildIsReference;
    }

    private _isRecursive(pattern: Pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);

        const firstChild = pattern.children[0];
        const lastChild = pattern.children[1];
        const firstChildIsReference = firstChild.type === "reference" &&
            firstChild.name === this.name;
        const lastChildIsReference = lastChild.type === "reference" &&
            lastChild.name === this.name;


        return firstChildIsReference &&
            lastChildIsReference &&
            this._referenceCount(pattern) > 2;
    }

    private _isSuffix(pattern: Pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);

        const firstChild = pattern.children[0];
        const referenceCount = this._referenceCount(pattern);
        const firstChildIsReference = firstChild.type === "reference" &&
            firstChild.name === this.name;

        return firstChildIsReference &&
            referenceCount === 1;
    }

    private _isBinary(pattern: Pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);

        const firstChild = pattern.children[0];
        const lastChild = pattern.children[1];
        const firstChildIsReference = firstChild.type === "reference" &&
            firstChild.name === this.name;
        const lastChildIsReference = lastChild.type === "reference" &&
            lastChild.name === this.name;


        return firstChildIsReference &&
            lastChildIsReference &&
            this._referenceCount(pattern) === 2;
    }

    private _unwrapAssociationIfNecessary(pattern: Pattern) {
        if (pattern.type === "right-associated") {
            return pattern.children[0];
        }

        return pattern;
    }

    private _referenceCount(pattern: Pattern) {
        return pattern.children.filter(p => p.type === "reference" && p.name === this.name).length;
    }

    private _extractRecursionSuffix(pattern: Pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);
        return new Sequence(`${pattern.name}-recursion`, pattern.children.slice(1));
    }

    private _extractSuffix(pattern: Pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);
        return new Sequence(`${pattern.name}-suffix`, pattern.children.slice(1));
    }

    parse(cursor: Cursor): Node | null {
        this._firstIndex = cursor.index;
        const node = this._tryToParse(cursor);

        if (node != null) {
            node.normalize(this._firstIndex);

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

        const context: ParseContext = {
            atomPrefixNode: null,
            atomPrefixName: "",
            atomSuffixNode: null,
            atomSuffixName: "",
            atomNode: null,
            binaryNode: null,
            onIndex: cursor.index,
            cursor,
            shouldStop: false
        };


        while (true) {
            cursor.resolveError();
            context.onIndex = cursor.index;

            this._matchAtomPrefix(context);

            if (context.shouldStop) {

            }

            this._matchAtom(context);

            if (context.shouldStop) {

            }

            this._matchAtomSuffix(context);

            if (context.shouldStop) {

            }

            if (cursor.hasNext()) {
                cursor.next();
            } else {
                if (lastBinaryNode != null && lastAtomNode != null) {
                    if (prefix != null) {
                        lastAtomNode = createNode(prefixName, [prefix, lastAtomNode]);
                    }
                    lastBinaryNode.appendChild(lastAtomNode);
                }
                break;
            }

            onIndex = cursor.index;

            if (prefix != null && this._recursivePatterns.length === 0) {
                lastAtomNode = createNode(prefixName, [prefix, lastAtomNode]);
            }

            for (let i = 0; i < this._recursivePatterns.length; i++) {
                const pattern = this._recursivePatterns[i];
                const node = pattern.parse(cursor);

                if (node != null) {
                    const name = this._recursiveNames[i];

                    if (this._endsInRecursion[i]) {
                        if (lastBinaryNode != null && lastAtomNode != null) {
                            if (prefix != null) {
                                lastAtomNode = createNode(prefixName, [prefix, lastAtomNode]);
                            }
                            lastBinaryNode.appendChild(lastAtomNode);
                        }

                        const frontExpression = lastBinaryNode == null ? lastAtomNode as Node : lastBinaryNode.findRoot();
                        const recursiveNode = createNode(name, [frontExpression, ...node.children]);


                        return recursiveNode;
                    } else {
                        if (prefix != null) {
                            lastAtomNode = createNode(prefixName, [prefix, lastAtomNode]);
                        }

                        const recursiveNode = createNode(name, [lastAtomNode, ...node.children]);
                        lastAtomNode = recursiveNode;

                        if (cursor.hasNext()) {
                            cursor.next();
                        } else {
                            if (lastBinaryNode != null) {
                                lastBinaryNode.appendChild(lastAtomNode);
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
                            return lastAtomNode;
                        } else if (lastAtomNode != null) {
                            lastBinaryNode.appendChild(lastAtomNode);
                        }
                    }
                    continue;
                }

                if (lastBinaryNode == null && lastAtomNode != null && delimiterNode != null) {
                    const node = createNode(name, [lastAtomNode, delimiterNode]);
                    lastBinaryNode = node;
                } else if (lastBinaryNode != null && lastAtomNode != null && delimiterNode != null) {
                    const precedence = this._precedenceMap[name];
                    const lastPrecendece = lastBinaryNode == null ? 0 : this._precedenceMap[lastBinaryNode.name] == null ? -1 : this._precedenceMap[lastBinaryNode.name];
                    const association = this._binaryAssociation[i];

                    if (precedence === lastPrecendece && association === Association.right) {
                        const node = createNode(name, [lastAtomNode, delimiterNode]);
                        lastBinaryNode.appendChild(node);

                        lastBinaryNode = node;
                    } else if (precedence === lastPrecendece) {
                        const node = createNode(name, []);

                        lastBinaryNode.replaceWith(node);
                        lastBinaryNode.appendChild(lastAtomNode);

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

                        lastBinaryNode.appendChild(lastAtomNode);

                        if (root != null) {
                            const node = createNode(name, []);
                            root.replaceWith(node);
                            node.append(root, delimiterNode);

                            lastBinaryNode = node;
                        } else {
                            const node = createNode(name, [lastAtomNode, delimiterNode]);
                            lastBinaryNode = node;
                        }

                    } else {
                        const node = createNode(name, [lastAtomNode, delimiterNode]);
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
            return lastAtomNode;
        } else {
            const root = lastBinaryNode.findAncestor(n => n.parent == null) as Node || lastBinaryNode;
            if (lastBinaryNode.children.length < 3) {
                lastBinaryNode.remove();

                if (lastBinaryNode === root) {
                    return lastAtomNode;
                }
            }

            return root;
        }
    }

    private _matchAtomPrefix(context: ParseContext) {
        const cursor = context.cursor;
        let onIndex = context.onIndex;
        let atomPrefixNode: Node | null = null;

        for (let i = 0; i < this._atomPrefixPatterns.length; i++) {
            cursor.moveTo(onIndex);
            const pattern = this._atomPrefixPatterns[i];
            const name = this._atomPrefixNames[i];
            const node = pattern.parse(cursor);

            if (node != null) {
                const prefixNode = createNode(name, [node]);

                if (atomPrefixNode != null) {
                    atomPrefixNode.appendChild(prefixNode);
                }

                atomPrefixNode = prefixNode;

                if (cursor.hasNext()) {
                    cursor.next();
                    onIndex = cursor.index;
                    i = -1;

                    continue;
                } else {
                    context.shouldStop = true;
                    break;
                }

            } else {
                cursor.moveTo(onIndex);
                cursor.resolveError();
            }
        }

        context.onIndex = cursor.index;
        context.atomPrefixNode = atomPrefixNode;
    }

    private _matchAtom(context: ParseContext) {
        const { onIndex, cursor } = context;

        for (let i = 0; i < this._atomPatterns.length; i++) {
            cursor.moveTo(onIndex);

            const pattern = this._atomPatterns[i];
            const node = pattern.parse(cursor);

            if (node != null) {
                context.atomNode = node;
                break;
            } else {
                context.shouldStop = true;
                cursor.resolveError();
                cursor.moveTo(onIndex);
            }
        }
    }

    private _matchAtomSuffix(context: ParseContext) {
        const cursor = context.cursor;
        let onIndex = context.onIndex;
        let atomSuffixNode: Node | null = null;

        for (let i = 0; i < this._recursivePatterns.length; i++) {
            const pattern = this._recursivePatterns[i];
            const name = this._atomSuffixNames[i];
            const node = pattern.parse(cursor);

            if (node != null) {

                if (prefix != null) {
                    lastAtomNode = createNode(prefixName, [prefix, lastAtomNode]);
                }

                const recursiveNode = createNode(name, [lastAtomNode, ...node.children]);
                lastAtomNode = recursiveNode;

                if (cursor.hasNext()) {
                    cursor.next();
                } else {
                    if (lastBinaryNode != null) {
                        lastBinaryNode.appendChild(lastAtomNode);
                    }
                    break outer;
                }
                onIndex = cursor.index;
                i = -1;
                continue;
            }

            cursor.resolveError();
            cursor.moveTo(onIndex);
        }
    }

    private _matchRecursion(context: ParseContext) {

        if (lastBinaryNode != null && lastAtomNode != null) {
            if (prefix != null) {
                lastAtomNode = createNode(prefixName, [prefix, lastAtomNode]);
            }
            lastBinaryNode.appendChild(lastAtomNode);
        }

        const frontExpression = lastBinaryNode == null ? lastAtomNode as Node : lastBinaryNode.findRoot();
        const recursiveNode = createNode(name, [frontExpression, ...node.children]);


        return recursiveNode;
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
        return this.atomPatterns.map(p => p.getTokens()).flat();
    }

    getTokensAfter(childReference: Pattern): string[] {
        if (this.atomPatterns.indexOf(childReference)) {
            const recursiveTokens = this._recursivePatterns.map(p => p.getTokens()).flat();
            const binaryTokens = this._binaryPatterns.map(p => p.getTokens()).flat();

            return [...recursiveTokens, ...binaryTokens];
        }

        if (this.recursivePatterns.indexOf(childReference)) {
            return this._binaryPatterns.map(p => p.getTokens()).flat();
        }

        if (this.binaryPatterns.indexOf(childReference)) {
            const unaryTokens = this._atomPatterns.map(p => p.getTokens()).flat();

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
        return this.atomPatterns.map(p => p.getPatterns()).flat();
    }

    getPatternsAfter(childReference: Pattern): Pattern[] {
        if (this.atomPatterns.indexOf(childReference)) {
            const recursivePatterns = this._recursivePatterns.map(p => p.getPatterns()).flat();
            const binaryPatterns = this._binaryPatterns.map(p => p.getPatterns()).flat();

            return [...recursivePatterns, ...binaryPatterns];
        }

        if (this.recursivePatterns.indexOf(childReference)) {
            return this._binaryPatterns.map(p => p.getPatterns()).flat();
        }

        if (this.binaryPatterns.indexOf(childReference)) {
            const unaryPatterns = this._atomPatterns.map(p => p.getPatterns()).flat();

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
