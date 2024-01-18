import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
export interface ParseResult {
    ast: Node | null;
    cursor: Cursor;
}
