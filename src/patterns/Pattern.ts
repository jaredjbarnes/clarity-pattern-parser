import { Cursor } from "./Cursor";
import { Node } from "../ast/Node";
import { ParseResult } from "./ParseResult"

export interface Pattern {
  type: string;
  name: string;
  parent: Pattern | null;
  children: Pattern[];
  isOptional: boolean;

  parse(cursor: Cursor): Node | null;
  parseText(text: string): ParseResult;
  clone(name?: string, isOptional?: boolean): Pattern;
  getTokens(): string[];
  getNextTokens(lastMatched: Pattern): string[];
  getNextPattern(): Pattern | null;
  findPattern(isMatch:(p: Pattern)=>boolean): Pattern | null;
}
