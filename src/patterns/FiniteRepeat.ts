import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { findPattern } from "./findPattern";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";

export interface FiniteRepeatOptions {
    divider?: Pattern;
    min?: number;
    trimDivider?: boolean;
}

export class FiniteRepeat implements Pattern {
    private _type: string;
    private _name: string;
    private _parent: Pattern | null;
    private _children: Pattern[];
    private _hasDivider: boolean;
    private _min: number;
    private _max: number;
    private _trimDivider: boolean;

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

    get isOptional() {
        return this._min === 0;
    }

    get min() {
        return this._min;
    }

    get max() {
        return this._max;
    }

    constructor(name: string, pattern: Pattern, repeatAmount: number, options: FiniteRepeatOptions = {}) {
        this._type = "repeat";
        this._name = name;
        this._parent = null;
        this._children = [];
        this._hasDivider = options.divider != null;
        this._min = options.min != null ? options.min : 1;
        this._max = repeatAmount;
        this._trimDivider = options.trimDivider == null ? false : options.trimDivider;

        for (let i = 0; i < repeatAmount; i++) {
            this._children.push(pattern.clone(pattern.name));

            if (options.divider != null && (i < repeatAmount - 1 || !this._trimDivider)) {
                this._children.push(options.divider.clone(options.divider.name, false));
            }
        }
    }

    parse(cursor: Cursor): Node | null {
        const startIndex = cursor.index;
        const nodes: Node[] = [];
        const modulo = this._hasDivider ? 2 : 1;
        let matchCount = 0;


        for (let i = 0; i < this._children.length; i++) {
            const childPattern = this._children[i];
            const node = childPattern.parse(cursor);

            if (i % modulo === 0 && !cursor.hasError) {
                matchCount++
            }

            if (cursor.hasError) {
                cursor.resolveError();
                break;
            }

            if (node != null) {
                nodes.push(node);

                if (cursor.hasNext()) {
                    cursor.next();
                } else {
                    break;
                }
            }

        }

        if (this._trimDivider && this._hasDivider) {
            if (cursor.leafMatch.pattern === this.children[1]) {
                const node = nodes.pop() as Node;
                cursor.moveTo(node.firstIndex)
            }
        }

        if (matchCount < this._min) {
            cursor.moveTo(startIndex);
            cursor.recordErrorAt(startIndex, this);
            return null;
        } else if (nodes.length === 0) {
            cursor.resolveError();
            cursor.moveTo(startIndex)
            return null;
        }

        const firstIndex = nodes[0].firstIndex;
        const lastIndex = nodes[nodes.length - 1].lastIndex;

        cursor.moveTo(lastIndex);

        return new Node(this._type, this.name, firstIndex, lastIndex, nodes);
    }

    test(text: string): boolean {
        const cursor = new Cursor(text);
        const ast = this.parse(cursor);

        return ast?.value === text;
    }

    exec(text: string): ParseResult {
        const cursor = new Cursor(text);
        const ast = this.parse(cursor);

        return {
            ast: ast?.value === text ? ast : null,
            cursor
        };
    }

    clone(name = this._name, isOptional?: boolean): Pattern {
        let min = this._min;

        if (isOptional != null) {
            if (isOptional) {
                min = 0
            } else {
                min = Math.max(this._min, 1);
            }
        }

        return new FiniteRepeat(
            name,
            this._children[0],
            this._max,
            {
                divider: this._hasDivider ? this._children[1] : undefined,
                min,
                trimDivider: this._trimDivider
            }
        );
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
            return []
        }

        return this._parent.getTokensAfter(this);
    }

    getPatterns(): Pattern[] {
        return this._children[0].getPatterns();
    }

    getPatternsAfter(childReference: Pattern): Pattern[] {
        const childIndex = this._children.indexOf(childReference);

        // If Reference Pattern isn't a child.
        if (childIndex == -1) {
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

        return nextChild.getPatterns()
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

}