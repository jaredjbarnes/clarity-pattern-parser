import ValuePattern from "./ValuePattern";
import ValueNode from "../../ast/ValueNode";
import Cursor from "../../Cursor";
export default class NotValue extends ValuePattern {
    match: string;
    node: ValueNode | null;
    cursor: Cursor;
    mark: number;
    constructor(name: string, pattern: ValuePattern);
    private _assertArguments;
    private _reset;
    parse(cursor: Cursor): ValueNode | null;
    private _tryPattern;
    private _processMatch;
    clone(name?: string): NotValue;
    getTokens(): never[];
}
