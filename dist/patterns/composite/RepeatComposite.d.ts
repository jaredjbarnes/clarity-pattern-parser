import CompositePattern from "./CompositePattern";
import CompositeNode from "../../ast/CompositeNode";
import Pattern from "../Pattern";
import Cursor from "../../Cursor";
import Node from "../../ast/Node";
export default class RepeatComposite extends CompositePattern {
    private _pattern;
    private _divider;
    nodes: Node[];
    cursor: Cursor;
    mark: number;
    node: CompositeNode | null;
    constructor(name: string, pattern: Pattern, divider?: Pattern);
    private _assertArguments;
    private _reset;
    parse(cursor: Cursor): CompositeNode | null;
    private _tryPattern;
    private _processMatch;
    clone(name?: string): RepeatComposite;
    getTokens(): string[];
}
