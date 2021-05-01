import Cursor from "../Cursor";
import Node from "../ast/Node";
export default abstract class Pattern {
    protected _type: string;
    protected _name: string;
    protected _children: Pattern[];
    protected _parent: Pattern | null;
    isSequence: boolean;
    constructor(type: string | undefined, name: string, children?: Pattern[]);
    private _assertName;
    abstract parse(cursor: Cursor): Node | null;
    exec(text: string): Node | null;
    test(text: string): boolean;
    get name(): string;
    get type(): string;
    get parent(): Pattern | null;
    set parent(value: Pattern | null);
    get children(): Pattern[];
    set children(value: Pattern[]);
    protected _assertChildren(): void;
    private _cloneChildren;
    private _assignAsParent;
    abstract clone(name?: string): Pattern;
    abstract getTokens(): string[];
    getNextTokens(): string[];
    getTokenValue(): string | null;
}
