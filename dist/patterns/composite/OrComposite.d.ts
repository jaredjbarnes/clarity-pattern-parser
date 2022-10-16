import CompositePattern from "./CompositePattern";
import Pattern from "../Pattern";
import Cursor from "../../Cursor";
export default class OrComposite extends CompositePattern {
    cursor: any;
    mark: any;
    index: any;
    node: any;
    constructor(name: string, patterns: Pattern[]);
    private _assertArguments;
    private _reset;
    parse(cursor: Cursor): any;
    private _tryPattern;
    clone(name?: string): OrComposite;
    getTokens(): string[];
}
