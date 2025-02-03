import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";
import { findPattern } from "./findPattern";
import { Sequence } from "./Sequence";
import { Association, PrecedenceTree } from './PrecedenceTree';
import { testPattern } from "./testPattern";
import { execPattern } from "./execPattern";

let indexId = 0;

export class ExpressionPattern implements Pattern {
    private _id: string;
    private _type: string;
    private _name: string;
    private _parent: Pattern | null;
    private _firstIndex: number;
    private _originalPatterns: Pattern[];
    private _patterns: Pattern[];
    private _atomPatterns: Pattern[];
    private _prefixPatterns: Pattern[];
    private _prefixNames: string[];
    private _postfixPatterns: Pattern[];
    private _postfixNames: string[];
    private _binaryPatterns: Pattern[];
    private _binaryNames: string[];
    private associationMap: Record<string, Association>;
    private _precedenceMap: Record<string, number>;
    private _shouldStopParsing: boolean;
    private _precedenceTree: PrecedenceTree;

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

    get prefixPatterns(): readonly Pattern[] {
        return this._prefixPatterns;
    }

    get atomPatterns(): readonly Pattern[] {
        return this._atomPatterns;
    }

    get postfixPatterns(): readonly Pattern[] {
        return this._postfixPatterns;
    }

    get binaryPatterns(): readonly Pattern[] {
        return this._binaryPatterns;
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
        this._prefixPatterns = [];
        this._prefixNames = [];
        this._postfixPatterns = [];
        this._postfixNames = [];
        this._binaryPatterns = [];
        this._binaryNames = [];
        this.associationMap = {};
        this._precedenceMap = {};
        this._originalPatterns = patterns;
        this._patterns = this._organizePatterns(patterns);
        this._shouldStopParsing = false;
        this._precedenceTree = new PrecedenceTree(this._precedenceMap, this.associationMap);

        if (this._atomPatterns.length === 0) {
            throw new Error("Need at least one terminating pattern with an 'expression' pattern.");
        }
    }

    private _organizePatterns(patterns: Pattern[]) {
        const finalPatterns: Pattern[] = [];
        patterns.forEach((pattern) => {

            if (this._isAtom(pattern)) {
                const atom = pattern.clone();
                atom.parent = this;

                this._atomPatterns.push(atom);

                finalPatterns.push(atom);
            } else if (this._isPrefix(pattern)) {
                const name = this._extractName(pattern);
                const prefix = this._extractPrefix(pattern);

                prefix.parent = this;

                this._prefixPatterns.push(prefix);
                this._prefixNames.push(name);

                finalPatterns.push(prefix);
            } else if (this._isPostfix(pattern)) {
                const name = this._extractName(pattern);
                const postfix = this._extractPostfix(pattern);
                postfix.parent = this;

                this._postfixPatterns.push(postfix);
                this._postfixNames.push(name);

                finalPatterns.push(postfix);
            } else if (this._isBinary(pattern)) {
                const name = this._extractName(pattern);
                const clone = this._extractBinary(pattern);
                clone.parent = this;

                this._precedenceMap[name] = this._binaryPatterns.length;
                this._binaryPatterns.push(clone);
                this._binaryNames.push(name);

                if (pattern.type === "right-associated") {
                    this.associationMap[name] = Association.right;
                } else {
                    this.associationMap[name] = Association.left;
                }

                finalPatterns.push(clone);
            }
        });

        return finalPatterns;
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
        const lastChildIsReference = this._isRecursiveReference(lastChild);

        return lastChildIsReference &&
            referenceCount === 1;
    }

    private _extractPrefix(pattern: Pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);
        return new Sequence(`${pattern.name}-prefix`, pattern.children.slice(0, -1));
    }

    private _isAtom(pattern: Pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);

        const firstChild = pattern.children[0];
        const lastChild = pattern.children[1];
        const firstChildIsReference = this._isRecursiveReference(firstChild);
        const lastChildIsReference = this._isRecursiveReference(lastChild);

        return !firstChildIsReference && !lastChildIsReference;
    }

    private _isPostfix(pattern: Pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);

        const firstChild = pattern.children[0];
        const referenceCount = this._referenceCount(pattern);
        const firstChildIsReference = this._isRecursiveReference(firstChild);

        return firstChildIsReference &&
            referenceCount === 1;
    }

    private _extractPostfix(pattern: Pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);
        return new Sequence(`${pattern.name}-postfix`, pattern.children.slice(1));
    }

    private _isBinary(pattern: Pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);

        const firstChild = pattern.children[0];
        const lastChild = pattern.children[pattern.children.length - 1];
        const firstChildIsReference = this._isRecursiveReference(firstChild);
        const lastChildIsReference = this._isRecursiveReference(lastChild);

        return firstChildIsReference && lastChildIsReference && pattern.children.length > 2;
    }

    private _extractBinary(pattern: Pattern) {
        pattern = this._unwrapAssociationIfNecessary(pattern);
        const children = pattern.children.slice(1, -1);
        const binarySequence = new Sequence(`${pattern.name}-delimiter`, children);

        return binarySequence;
    }

    private _unwrapAssociationIfNecessary(pattern: Pattern) {
        if (pattern.type === "right-associated") {
            return pattern.children[0];
        }

        return pattern;
    }

    private _referenceCount(pattern: Pattern) {
        return pattern.children.filter(p => this._isRecursiveReference(p)).length;
    }

    private _isRecursiveReference(pattern: Pattern) {
        if (pattern == null){
            return false;
        }
        return pattern.type === "reference" && pattern.name === this.name;
    }

    parse(cursor: Cursor): Node | null {
        this._firstIndex = cursor.index;
        const node = this._tryToParse(cursor);

        if (node != null) {
            node.normalize(this._firstIndex);

            cursor.moveTo(node.lastIndex);
            cursor.resolveError();
            return node;
        }

        cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
        return null;
    }


    private _tryToParse(cursor: Cursor): Node | null {
        if (this._isBeyondRecursiveAllowance()) {
            cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
            return null;
        }

        this._shouldStopParsing = false;

        while (true) {
            cursor.resolveError();

            this._tryToMatchPrefix(cursor);

            if (this._shouldStopParsing) {
                break;
            }

            this._tryToMatchAtom(cursor);

            if (this._shouldStopParsing) {
                break;
            }

            this._tryToMatchPostfix(cursor);

            if (this._shouldStopParsing) {
                break;
            }

            if (this._precedenceTree.hasAtom()) {
                this._tryToMatchBinary(cursor);

                if (this._shouldStopParsing) {
                    break;
                }
            } else {
                break;
            }
        }

        return this._precedenceTree.commit();
    }

    private _tryToMatchPrefix(cursor: Cursor) {
        let onIndex = cursor.index;

        for (let i = 0; i < this._prefixPatterns.length; i++) {
            const pattern = this._prefixPatterns[i];
            const name = this._prefixNames[i];
            const node = pattern.parse(cursor);

            if (node != null) {
                this._precedenceTree.addPrefix(name, ...node.children);

                if (cursor.hasNext()) {
                    cursor.next();
                    onIndex = cursor.index;
                    i = -1;

                    continue;
                } else {
                    this._shouldStopParsing = true;
                    break;
                }

            } else {
                cursor.moveTo(onIndex);
                cursor.resolveError();
            }
        }
    }

    private _tryToMatchAtom(cursor: Cursor) {
        let onIndex = cursor.index;

        for (let i = 0; i < this._atomPatterns.length; i++) {
            cursor.moveTo(onIndex);

            const pattern = this._atomPatterns[i];
            const node = pattern.parse(cursor);

            if (node != null) {
                this._precedenceTree.addAtom(node);

                if (cursor.hasNext()) {
                    cursor.next();
                } else {
                    this._shouldStopParsing = true;
                }

                break;
            } else {
                cursor.resolveError();
                cursor.moveTo(onIndex);
            }
        }
    }

    private _tryToMatchPostfix(cursor: Cursor) {
        let onIndex = cursor.index;

        for (let i = 0; i < this._postfixPatterns.length; i++) {
            const pattern = this._postfixPatterns[i];
            const name = this._postfixNames[i];
            const node = pattern.parse(cursor);

            if (node != null) {
                this._precedenceTree.addPostfix(name, ...node.children);

                if (cursor.hasNext()) {
                    cursor.next();
                    onIndex = cursor.index;
                    i = -1;

                    continue;
                } else {
                    this._shouldStopParsing = true;
                    break;
                }

            } else {
                cursor.moveTo(onIndex);
                cursor.resolveError();
            }
        }
    }

    private _tryToMatchBinary(cursor: Cursor) {
        let onIndex = cursor.index;
        let foundMatch = false;

        if (this.binaryPatterns.length === 0) {
            this._shouldStopParsing = true;
        }

        for (let i = 0; i < this._binaryPatterns.length; i++) {
            cursor.moveTo(onIndex);

            const pattern = this._binaryPatterns[i];
            const name = this._binaryNames[i];
            const node = pattern.parse(cursor);

            if (node != null) {
                foundMatch = true;
                this._precedenceTree.addBinary(name, ...node.children);

                if (cursor.hasNext()) {
                    cursor.next();
                } else {
                    this._shouldStopParsing = true;
                }

                break;
            } else {
                cursor.resolveError();
                cursor.moveTo(onIndex);
            }
        }

        if (!foundMatch) {
            this._shouldStopParsing = true;
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

    test(text: string, record = false): boolean {
        return testPattern(this, text, record);
    }

    exec(text: string, record = false): ParseResult {
        return execPattern(this, text, record);
    }

    getTokens(): string[] {
        return this.atomPatterns.map(p => p.getTokens()).flat();
    }

    getTokensAfter(_childReference: Pattern): string[] {
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

    getPatternsAfter(_childReference: Pattern): Pattern[] {
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
        return clone;
    }

    isEqual(pattern: ExpressionPattern): boolean {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }
}
