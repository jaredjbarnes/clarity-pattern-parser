import ValuePattern from "./ValuePattern";
import ValueNode from "../../ast/ValueNode";
import ParseError from "../ParseError";
import Cursor from "../../Cursor";
export default class OrValue extends ValuePattern {
    index: number;
    errors: ParseError[];
    node: ValueNode | null;
    cursor: Cursor;
    mark: number;
    parseError: ParseError | null;
    constructor(name: string, patterns: ValuePattern[]);
    private _assertArguments;
    private _reset;
    parse(cursor: Cursor): ValueNode | null;
    private _tryPattern;
    clone(name: string): OrValue;
    getTokens(): string[];
}
