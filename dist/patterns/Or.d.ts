import Pattern from "./Pattern";
import ParseError from "./ParseError";
import Cursor from "../Cursor";
import Node from "../ast/Node";
export default class Or extends Pattern {
    patternIndex: number;
    errors: ParseError[];
    node: Node | null;
    cursor: Cursor | null;
    mark: number;
    parseError: ParseError | null;
    constructor(name: string, patterns: Pattern[], isOptional?: boolean);
    private assertArguments;
    private resetState;
    private safelyGetCursor;
    parse(cursor: Cursor): Node | null;
    private tryToParse;
    private processError;
    private processResult;
    clone(name?: string, isOptional?: boolean): Or;
    getTokens(): string[];
}
