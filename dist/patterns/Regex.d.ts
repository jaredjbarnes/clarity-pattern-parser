import Node from "../ast/Node";
import Pattern from "./Pattern";
import Cursor from "../Cursor";
export default class Regex extends Pattern {
    private regexString;
    private regex;
    private node;
    private cursor;
    private substring;
    constructor(name: string, regex: string, isOptional?: boolean);
    private assertArguments;
    parse(cursor: Cursor): Node | null;
    private resetState;
    private tryToParse;
    private processResult;
    private processError;
    private safelyGetCursor;
    clone(name?: string, isOptional?: boolean): Regex;
    getTokenValue(): string;
    getTokens(): string[];
}
