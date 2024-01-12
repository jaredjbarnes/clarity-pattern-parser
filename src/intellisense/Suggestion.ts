import { Cursor } from "../patterns/Cursor";
import { Match } from "../patterns/CursorHistory";
import { ParseError } from "../patterns/ParseError";
import { SuggestionOption } from "./SuggestionOption";

export interface Suggestion {
  isComplete: boolean;
  options: SuggestionOption[];
  cursor: Cursor | null;
  error: ParseError | null;
}
