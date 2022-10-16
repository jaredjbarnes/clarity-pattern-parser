import ValueNode from "../../ast/ValueNode";
import ValuePattern from "./ValuePattern";
import Cursor from "../../Cursor";
export default class RegexValue extends ValuePattern {
    regexString: string;
    regex: RegExp;
    node: ValueNode | null;
    cursor: Cursor;
    substring: string;
    constructor(name: string, regex: string);
    private _assertArguments;
    parse(cursor: Cursor): ValueNode | null;
    private _reset;
    private _tryPattern;
    private _processError;
    clone(name: string): RegexValue;
    getTokenValue(): string;
    getTokens(): string[];
}
