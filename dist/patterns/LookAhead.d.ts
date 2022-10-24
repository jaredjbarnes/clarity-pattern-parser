import Cursor from "../Cursor";
import Pattern from "./Pattern";
export default class LookAhead extends Pattern {
    constructor(pattern: Pattern);
    parse(cursor: Cursor): null;
    clone(): LookAhead;
    getTokens(): never[];
}
