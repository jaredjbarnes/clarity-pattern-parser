import { Node } from "../ast/Node";
import { Cursor } from "../patterns/Cursor";
import { Pattern } from "../patterns/Pattern";
import { SuggestionOption } from "./SuggestionOption";

export interface Suggestion {
  isComplete: boolean;
  options: SuggestionOption[];
  errorAtIndex: number | null;
  cursor: Cursor | null;
  ast: Node | null;
}
