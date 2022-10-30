import Pattern from "./Pattern";
import Cursor from "../Cursor";
export default class Recursive extends Pattern {
    isRecursing: boolean;
    pattern: Pattern | null;
    constructor(name: string, isOptional?: boolean);
    getPattern(): Pattern | null;
    private climb;
    parse(cursor: Cursor): import("..").Node | null;
    clone(name?: string, isOptional?: boolean): Recursive;
    getTokens(): string[];
}
