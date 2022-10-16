import CompositePattern from "./CompositePattern";
import Pattern from "../Pattern";
import Cursor from "../../Cursor";
export default class OptionalComposite extends CompositePattern {
    mark: any;
    constructor(pattern: Pattern);
    parse(cursor: Cursor): import("../..").Node | null;
    clone(): OptionalComposite;
    getTokens(): string[];
}
