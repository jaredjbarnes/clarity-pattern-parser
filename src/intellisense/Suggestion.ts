import { Node } from "../ast/Node";
import { Cursor } from "../patterns/Cursor";
import { Match } from "../patterns/CursorHistory";
import { ParseError } from "../patterns/ParseError";
import { Pattern } from "../patterns/Pattern";
import { SuggestionOption } from "./SuggestionOption";

export interface Suggestion {
  isComplete: boolean;
  options: SuggestionOption[];
  nextPatterns: Pattern[];
  cursor: Cursor | null;
  ast: Node | null;
}
