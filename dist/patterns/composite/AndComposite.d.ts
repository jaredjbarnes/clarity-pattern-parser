import CompositePattern from "./CompositePattern";
import CompositeNode from "../../ast/CompositeNode";
import Pattern from "../Pattern";
import Cursor from "../../Cursor";
export default class AndComposite extends CompositePattern {
    index: number;
    nodes: CompositeNode[];
    node: CompositeNode | null;
    cursor: Cursor;
    mark: number;
    constructor(name: string, patterns?: Pattern[]);
    private _assertArguments;
    private _reset;
    parse(cursor: Cursor): CompositeNode | null;
    private _tryPatterns;
    private _next;
    private _hasMorePatterns;
    private _assertRestOfPatternsAreOptional;
    private _processValue;
    clone(name?: string): AndComposite;
    getTokens(): string[];
}
