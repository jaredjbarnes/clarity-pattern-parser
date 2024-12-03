import { Node } from "../ast/Node";
import { ParseError } from "../index.js";
import { Cursor } from "../patterns/Cursor";
import { SuggestionOption } from "./SuggestionOption";

export interface Suggestion {
  isComplete: boolean;
  options: SuggestionOption[];
  error: ParseError | null;
  errorAtIndex: number | null;
  cursor: Cursor;
  ast: Node | null;
}
