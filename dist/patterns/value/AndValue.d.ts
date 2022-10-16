import ValuePattern from "./ValuePattern";
import ValueNode from "../../ast/ValueNode";
import Cursor from "../../Cursor";
export default class AndValue extends ValuePattern {
    index: number;
    nodes: ValueNode[];
    node: ValueNode | null;
    cursor: Cursor;
    mark: number;
    constructor(name: string, patterns: ValuePattern[]);
    private _assertArguments;
    private _reset;
    parse(cursor: Cursor): ValueNode | null;
    private _tryPatterns;
    private _next;
    private _hasMorePatterns;
    private _assertRestOfPatternsAreOptional;
    private _processValue;
    clone(name?: string): AndValue;
    getTokens(): string[];
}
