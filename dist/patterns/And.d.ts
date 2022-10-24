import Cursor from "../Cursor";
import Pattern from "./Pattern";
import Node from "../ast/Node";
export default class And extends Pattern {
    onPatternIndex: number;
    nodes: (Node | null)[];
    node: Node | null;
    cursor: Cursor | null;
    mark: number;
    constructor(name: string, patterns: Pattern[], isOptional?: boolean);
    parse(cursor: Cursor): Node | null;
    clone(name?: string, isOptional?: boolean): And;
    getTokens(): string[];
    private resetState;
    private tryToParse;
    private safelyGetCursor;
    private processResult;
    private processError;
    private shouldProceed;
    private hasMorePatterns;
    private assertRestOfPatternsAreOptional;
    private areTheRemainingPatternsOptional;
    private processSuccess;
}
