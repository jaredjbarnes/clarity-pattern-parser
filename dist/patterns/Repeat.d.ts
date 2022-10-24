import Pattern from "./Pattern";
import Node from "../ast/Node";
import Cursor from "../Cursor";
export default class Repeat extends Pattern {
    _pattern: Pattern;
    _divider: Pattern;
    nodes: Node[];
    cursor: Cursor;
    mark: number;
    node: Node | null;
    constructor(name: string, pattern: Pattern, divider?: Pattern, isOptional?: boolean);
    private assertArguments;
    private _reset;
    parse(cursor: Cursor): Node | null;
    private tryToParse;
    private processResult;
    private safelyGetCursor;
    clone(name?: string, isOptional?: boolean): Repeat;
    getTokens(): string[];
}
