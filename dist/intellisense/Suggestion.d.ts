import type { Node } from "../ast/Node";
import type { ParseError } from "../index.js";
import type { Cursor } from "../patterns/Cursor";
import type { SuggestionOption } from "./SuggestionOption";
export interface Suggestion {
    isComplete: boolean;
    options: SuggestionOption[];
    error: ParseError | null;
    errorAtIndex: number | null;
    cursor: Cursor;
    ast: Node | null;
}
