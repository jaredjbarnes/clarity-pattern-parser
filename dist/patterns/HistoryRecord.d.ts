import type { Node } from "../ast/Node";
import type { ParseError } from "./ParseError";
import type { Pattern } from "./Pattern";
export interface HistoryRecord {
    pattern: Pattern;
    error: ParseError | null;
    ast: Node | null;
}
