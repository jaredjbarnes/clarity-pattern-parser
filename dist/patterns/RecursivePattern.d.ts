import Pattern from "./Pattern";
import Cursor from "../Cursor";
export default class RecursivePattern extends Pattern {
    isRecursing: boolean;
    pattern: Pattern | null;
    constructor(name: string);
    getPattern(): Pattern | null;
    _climb(pattern: Pattern | null, isMatch: (pattern: Pattern | null) => boolean): Pattern | null;
    parse(cursor: Cursor): import("..").Node | null;
    clone(name?: string): Pattern;
    getTokenValue(): string | null;
    getTokens(): string[];
}
