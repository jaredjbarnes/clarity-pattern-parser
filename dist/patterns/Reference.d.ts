import Pattern from "./Pattern";
import Cursor from "../Cursor";
export default class Reference extends Pattern {
    private isRecursing;
    constructor(name: string, isOptional?: boolean);
    private getRoot;
    private findPattern;
    private walkTheTree;
    parse(cursor: Cursor): import("..").Node | null;
    clone(name?: string, isOptional?: boolean): Reference;
    getTokenValue(): string | null;
    private safelyGetPattern;
    getTokens(): string[];
}
