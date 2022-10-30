import Pattern from "./Pattern";
import Cursor from "../Cursor";
export default class Reference extends Pattern {
    constructor(name: string, isOptional?: boolean);
    private getRoot;
    private findPattern;
    private walkTheTree;
    parse(cursor: Cursor): import("..").Node | null;
    clone(name?: string, isOptional?: boolean): Reference;
    private safelyGetPattern;
    getTokens(): string[];
}
