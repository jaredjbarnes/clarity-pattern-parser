import ValueNode from "../../ast/ValueNode";
import ValuePattern from "./ValuePattern";
import Cursor from "../../Cursor";
export default class Literal extends ValuePattern {
    literal: string;
    node: ValueNode | null;
    cursor: Cursor;
    mark: number;
    substring: string;
    constructor(name: string, literal: string);
    private _assertArguments;
    parse(cursor: Cursor): ValueNode | null;
    private _reset;
    private _tryPattern;
    private _processError;
    private _processMatch;
    clone(name?: string): Literal;
    getTokenValue(): string;
    getTokens(): string[];
}
