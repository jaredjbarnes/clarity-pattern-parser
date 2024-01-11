import { Cursor } from "./Cursor";
import { Node } from "../ast/Node";

export interface Pattern {
  type: string;
  name: string;
  parent: Pattern | null;
  children: Pattern[];
  isOptional: boolean;

  parse(cursor: Cursor): Node | null;
  clone(name?: string, isOptional?: boolean): Pattern;
  getTokens(): string[];
  getNextTokens(lastMatched: Pattern): string[];
}
