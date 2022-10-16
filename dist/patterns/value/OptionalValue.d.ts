import ValuePattern from "./ValuePattern";
import Cursor from "../../Cursor";
export default class OptionalValue extends ValuePattern {
    constructor(pattern: ValuePattern);
    private _assertArguments;
    parse(cursor: Cursor): import("../..").Node | null;
    clone(): OptionalValue;
    getTokens(): string[];
}
