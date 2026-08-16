import type { Node } from "../ast/Node";
import type { Cursor } from "./Cursor";
export interface ParseResult {
    ast: Node | null;
    cursor: Cursor;
}
