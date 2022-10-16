import ValuePattern from "./ValuePattern";
import ValueNode from "../../ast/ValueNode";
import Cursor from "../../Cursor";
export default class AnyOfThese extends ValuePattern {
    characters: string;
    node: ValueNode | null;
    cursor: Cursor;
    mark: number;
    constructor(name: string, characters: string);
    private _assertArguments;
    parse(cursor: Cursor): ValueNode | null;
    private _reset;
    private _tryPattern;
    private _isMatch;
    private _processError;
    clone(name?: string): AnyOfThese;
    getTokens(): string[];
}
