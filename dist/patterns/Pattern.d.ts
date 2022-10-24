import Cursor from "../Cursor";
import Node from "../ast/Node";
export default abstract class Pattern {
    protected _type: string;
    protected _name: string;
    protected _children: Pattern[];
    protected _parent: Pattern | null;
    protected _isOptional: boolean;
    get isOptional(): boolean;
    constructor(type: string, name: string, children?: Pattern[], isOptional?: boolean);
    abstract parse(cursor: Cursor): Node | null;
    exec(text: string): Node | null;
    test(text: string): boolean;
    get name(): string;
    get type(): string;
    get parent(): Pattern | null;
    set parent(value: Pattern | null);
    get children(): Pattern[];
    set children(value: Pattern[]);
    abstract clone(name?: string): Pattern;
    abstract getTokens(): string[];
    getTokenValue(): string | null;
    getNextTokens(): string[];
    private cloneChildren;
    private assignAsParent;
}
