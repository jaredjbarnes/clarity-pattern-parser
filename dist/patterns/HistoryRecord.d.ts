import { Node } from "../ast/Node";
import { ParseError } from "./ParseError";
import { Pattern } from "./Pattern";
export interface HistoryRecord {
    pattern: Pattern;
    error: ParseError | null;
    ast: Node | null;
}
