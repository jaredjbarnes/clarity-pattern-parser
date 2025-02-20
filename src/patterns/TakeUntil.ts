import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { execPattern } from "./execPattern";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";
import { testPattern } from "./testPattern";

let idIndex = 0;

export class TakeUntil implements Pattern {
    private _id: string;
    private _type: string;
    private _name: string;
    private _parent: Pattern | null;
    private _children: Pattern[];
    private _startedOnIndex: number;
    private _terminatingPattern: Pattern;
    private _tokens: string[];
    private _shouldCache: boolean;
    get id(): string {
        return this._id;
    }

    get type(): string {
        return this._type;
    }

    get name(): string {
        return this._name;
    }

    get children(): Pattern[] {
        return this._children;
    }

    get parent(): Pattern | null {
        return this._parent;
    }

    set parent(pattern: Pattern | null) {
        this._parent = pattern;
    }

    get startedOnIndex(): number {
        return this._startedOnIndex;
    }

    constructor(name: string, terminatingPattern: Pattern) {
        this._id = String(idIndex++);
        this._type = "take-until";
        this._name = name;
        this._parent = null;
        this._terminatingPattern = terminatingPattern;
        this._children = [this._terminatingPattern];
        this._tokens = [];
        this._startedOnIndex = 0;
        this._shouldCache = terminatingPattern.type === "literal" || terminatingPattern.type === "regex";
    }

    parse(cursor: Cursor): Node | null {
        // We can use caching if our terminating pattern is a literal or a regex.
        if (this._shouldCache) {
            // This is a major optimization when backtracking happens.
            // Most parsing will be cached.
            const record = cursor.getRecord(this, cursor.index);

            if (record != null) {
                if (record.ast != null) {
                    const node = new Node(
                        this._type,
                        this._name,
                        record.ast.firstIndex,
                        record.ast.lastIndex,
                        [],
                        record.ast.value
                    );

                    cursor.recordMatch(this, node);
                    cursor.moveTo(node.lastIndex);
                    return node;
                }

                if (record.error) {
                    cursor.recordErrorAt(record.error.startIndex, record.error.lastIndex, this);
                    cursor.moveTo(record.error.lastIndex);
                    return null;
                }
            }
        }


        let cursorIndex = cursor.index;
        let foundMatch = false;
        this._startedOnIndex = cursor.index;

        let terminatingResult = this._terminatingPattern.parse(cursor);
        cursor.resolveError();

        if (terminatingResult == null) {
            foundMatch = true;

            cursor.moveTo(cursorIndex);
            cursorIndex += 1;
            cursor.hasNext() && cursor.next();
        }

        while (true) {
            terminatingResult = this._terminatingPattern.parse(cursor);
            cursor.resolveError();

            if (terminatingResult == null) {
                cursor.moveTo(cursorIndex);
                cursorIndex += 1;

                if (cursor.hasNext()) {
                    cursor.next();
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        if (foundMatch) {
            cursor.moveTo(cursorIndex - 1);
            const value = cursor.getChars(this.startedOnIndex, cursorIndex - 1);
            const node = Node.createValueNode(this._type, this._name, value);

            cursor.recordMatch(this, node, this._shouldCache);
            return node;
        } else {
            cursor.moveTo(this.startedOnIndex);
            cursor.recordErrorAt(this._startedOnIndex, this._startedOnIndex, this);
            return null;
        }
    }

    exec(text: string, record?: boolean | undefined): ParseResult {
        return execPattern(this, text, record);
    }

    test(text: string, record?: boolean | undefined): boolean {
        return testPattern(this, text, record);
    }

    clone(name = this.name): Pattern {
        const clone = new TakeUntil(name, this._terminatingPattern);
        clone._id = this._id;

        return clone;
    }

    getTokens() {
        return this._tokens;
    }

    getTokensAfter(_childReference: Pattern): string[] {
        return [];
    }

    getNextTokens(): string[] {
        if (this.parent == null) {
            return [];
        }

        return this.parent.getTokensAfter(this);
    }

    getPatterns(): Pattern[] {
        return [this];
    }

    getPatternsAfter(_childReference: Pattern): Pattern[] {
        return [];
    }

    getNextPatterns(): Pattern[] {
        if (this.parent == null) {
            return [];
        }

        return this.parent.getPatternsAfter(this);
    }

    find(_predicate: (p: Pattern) => boolean): Pattern | null {
        return null;
    }

    setTokens(tokens: string[]) {
        this._tokens = tokens;
    }

    isEqual(pattern: Pattern): boolean {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }

}