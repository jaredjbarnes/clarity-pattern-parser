import Cursor from "../patterns/Cursor";
import { Match } from "../patterns/CursorHistory";
import ParseError from "../patterns/ParseError";
import { SuggestionOption } from "./SuggestionOption";

export interface Suggestion {
  isComplete: boolean;
  hasError: boolean;
  error: ParseError | null;
  options: SuggestionOption[];
  leafMatch: Match;
  rootMatch: Match;
  cursor: Cursor | null;
}
