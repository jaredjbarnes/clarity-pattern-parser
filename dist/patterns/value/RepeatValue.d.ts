import ValuePattern from "./ValuePattern";
import ValueNode from "../../ast/ValueNode";
import Cursor from "../../Cursor";
export default class RepeatValue extends ValuePattern {
    _pattern: ValuePattern;
    _divider: ValuePattern;
    nodes: ValueNode[];
    cursor: Cursor;
    mark: number;
    node: ValueNode | null;
    constructor(name: string, pattern: ValuePattern, divider?: ValuePattern);
    private _assertArguments;
    private _reset;
    parse(cursor: Cursor): ValueNode | null;
    private _tryPattern;
    private _processMatch;
    clone(name?: string): RepeatValue;
    getTokens(): string[];
}
