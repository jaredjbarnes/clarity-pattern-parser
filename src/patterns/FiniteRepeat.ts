import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { findPattern } from "./findPattern";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";

let idIndex = 0;

export interface FiniteRepeatOptions {
    divider?: Pattern;
    min?: number;
    max?: number;
    trimDivider?: boolean;
}

export class FiniteRepeat implements Pattern {
    private _id: string;
    private _type: string;
    private _name: string;
    private _parent: Pattern | null;
    private _children: Pattern[];
    private _hasDivider: boolean;
    private _min: number;
    private _max: number;
    private _trimDivider: boolean;

    get id() {
        return this._id;
    }

    get type() {
        return this._type;
    }

    get name() {
        return this._name;
    }

    get parent() {
        return this._parent;
    }

    set parent(value: Pattern | null) {
        this._parent = value;
    }

    get children() {
        return this._children;
    }

    get min() {
        return this._min;
    }

    get max() {
        return this._max;
    }

    constructor(name: string, pattern: Pattern, options: FiniteRepeatOptions = {}) {
        this._id = `finite-repeat-${idIndex++}`;
        this._type = "finite-repeat";
        this._name = name;
        this._parent = null;
        this._children = [];
        this._hasDivider = options.divider != null;
        this._min = options.min != null ? Math.max(options.min, 1) : 1;
        this._max = Math.max(this.min, options.max || this.min);
        this._trimDivider = options.trimDivider == null ? false : options.trimDivider;

        for (let i = 0; i < this._max; i++) {
            const child = pattern.clone();
            child.parent = this;

            this._children.push(child);

            if (options.divider != null && (i < this._max - 1 || !this._trimDivider)) {
                const divider = options.divider.clone();
                divider.parent = this;
                this._children.push(divider);
            }
        }

    }

    parse(cursor: Cursor): Node | null {
        cursor.startParseWith(this);

        const startIndex = cursor.index;
        const nodes: Node[] = [];
        const modulo = this._hasDivider ? 2 : 1;
        let matchCount = 0;

        for (let i = 0; i < this._children.length; i++) {
            const childPattern = this._children[i];
            const runningIndex = cursor.index;
            const node = childPattern.parse(cursor);

            if (cursor.hasError) {
                break;
            }

            if (i % modulo === 0 && !cursor.hasError) {
                matchCount++;
            }

            if (node == null) {
                cursor.moveTo(runningIndex);
            } else {
                nodes.push(node);

                if (cursor.hasNext()) {
                    cursor.next();
                } else {
                    break;
                }
            }
        }

        if (this._trimDivider && this._hasDivider) {
            const isDividerLastMatch = cursor.leafMatch.pattern?.id === this.children[1].id;
            if (isDividerLastMatch) {
                const node = nodes.pop() as Node;
                cursor.moveTo(node.firstIndex);
            }
        }

        if (matchCount < this._min) {
            const lastIndex = cursor.index;
            cursor.moveTo(startIndex);
            cursor.recordErrorAt(startIndex, lastIndex, this);
            cursor.endParse();
            return null;
        }

        if (nodes.length === 0 && !cursor.hasError) {
            cursor.moveTo(startIndex);
            cursor.endParse();
            return null;
        }

        const firstIndex = nodes[0].firstIndex;
        const lastIndex = nodes[nodes.length - 1].lastIndex;

        cursor.resolveError();
        cursor.moveTo(lastIndex);
        cursor.endParse();

        return new Node(this._type, this.name, firstIndex, lastIndex, nodes);
    }

    test(text: string): boolean {
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

    clone(name = this._name): Pattern {
        let min = this._min;
        let max = this._max;

        const clone = new FiniteRepeat(
            name,
            this._children[0],
            {
                divider: this._hasDivider ? this._children[1] : undefined,
                min,
                max,
                trimDivider: this._trimDivider
            }
        );

        clone._id = this._id;

        return clone;
    }

    getTokens(): string[] {
        return this._children[0].getTokens();
    }

    getTokensAfter(childReference: Pattern): string[] {
        const patterns = this.getPatternsAfter(childReference);
        const tokens: string[] = [];

        patterns.forEach(p => tokens.push(...p.getTokens()));

        return tokens;
    }

    getNextTokens(): string[] {
        if (this._parent == null) {
            return [];
        }

        return this._parent.getTokensAfter(this);
    }

    getPatterns(): Pattern[] {
        return this._children[0].getPatterns();
    }

    getPatternsAfter(childReference: Pattern): Pattern[] {
        const childIndex = this._children.indexOf(childReference);

        // If Reference Pattern isn't a child.
        if (childIndex === -1) {
            return [];
        }

        // If Reference Pattern is the last pattern. Ask for the parents next patterns 
        if (childIndex === this._children.length - 1) {
            if (this._parent == null) {
                return [];
            } else {
                return this._parent.getPatternsAfter(this);
            }
        }

        // Get the next childs patterns.
        const nextChild = this._children[childIndex + 1];

        return nextChild.getPatterns();
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

    isEqual(pattern: FiniteRepeat): boolean {
        return pattern.type === this.type && this.children.every((c, index) => c.isEqual(pattern.children[index]));
    }

}