import Pattern from "./Pattern";
import Cursor from "../Cursor";
export default class Not extends Pattern {
    cursor: Cursor;
    mark: number;
    constructor(pattern: Pattern);
    parse(cursor: Cursor): null;
    private tryToParse;
    clone(name?: string): Not;
    getTokens(): never[];
}
