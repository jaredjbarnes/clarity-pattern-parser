import Node from "../ast/Node";
import Pattern from "./Pattern";
import Cursor from "../Cursor";
export default class Literal extends Pattern {
    literal: string;
    node: Node | null;
    cursor: Cursor;
    mark: number;
    substring: string;
    constructor(name: string, literal: string, isOptional?: boolean);
    parse(cursor: Cursor): Node | null;
    clone(name?: string, isOptional?: boolean): Literal;
    getTokens(): string[];
    private assertArguments;
    private resetState;
    private tryToParse;
    private processError;
    private processResult;
}
