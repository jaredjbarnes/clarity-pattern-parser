import { Cursor } from "../patterns/Cursor";
import { Match } from "../patterns/CursorHistory";
import { ParseError } from "../patterns/ParseError";
import { Pattern } from "../patterns/Pattern";
import { SuggestionOption } from "./SuggestionOption";

export interface Suggestion {
  isComplete: boolean;
  options: SuggestionOption[];
  nextPattern: Pattern | null;
  cursor: Cursor | null;
  error: ParseError | null;
}
