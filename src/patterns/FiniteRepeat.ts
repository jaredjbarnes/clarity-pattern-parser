import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { findPattern } from "./findPattern";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";
import { RepeatOptions } from "./Repeat";

export interface FiniteRepeatOptions {
    divider?: Pattern;
    min?: number;
}

export class FiniteRepeat implements Pattern {
    private _type: string;
    private _name: string;
    private _parent: Pattern | null;
    private _children: Pattern[];
    private _isOptional: boolean;
    private _hasDivider: boolean;
    private _min: number;
    private _max: number;

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
        return this._isOptional;
    }

    get min() {
        return this._min;
    }

    get max() {
        return this._max;
    }

    constructor(name: string, pattern: Pattern, repeatAmount: number, options: RepeatOptions = {}) {
        this._type = "repeat";
        this._name = name;
        this._parent = null;
        this._children = [];
        this._hasDivider = options.divider != null;
        this._min = options.min != null ? options.min : 1;
        this._max = repeatAmount;
        this._isOptional = this._min < 1;

        for (let i = 0; i < repeatAmount; i++) {
            this._children.push(pattern.clone(pattern.name, false));

            if (options.divider != null && i < repeatAmount - 1) {
                this._children.push(options.divider.clone(options.divider.name, false));
            }
        }
    }

    parse(cursor: Cursor): Node | null {
        const startIndex = cursor.index;
        const nodes: Node[] = [];

        for (let i = 0; i < this._children.length; i++) {
            const childPattern = this._children[i];
            const node = childPattern.parse(cursor);

            if (cursor.hasError || node == null) {
                cursor.resolveError();
                break;
            }

            nodes.push(node);

            if (cursor.hasNext()) {
                cursor.next();
            } else {
                break;
            }
        }

        // Make sure we backtrack if we landed on a divider.
        if (this._hasDivider) {
            if (nodes.length % 2 === 0) {
                const node = nodes.pop() as Node;
                cursor.moveTo(node.firstIndex)
            }
        }

        const matchCount = this._hasDivider ? Math.ceil(nodes.length / 2) : nodes.length;

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
            if (isOptional){
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
                min
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

    findPattern(predicate: (p: Pattern) => boolean): Pattern | null {
        return findPattern(this, predicate);
    }

}