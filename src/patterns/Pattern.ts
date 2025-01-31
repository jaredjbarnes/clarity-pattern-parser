import { Cursor } from "./Cursor";
import { Node } from "../ast/Node";
import { ParseResult } from "./ParseResult";

export interface Pattern {
  id: string;
  type: string;
  name: string;
  shouldCompactAst: boolean;
  startedOnIndex: number;
  parent: Pattern | null;
  children: Pattern[];

  parse(cursor: Cursor): Node | null;
  exec(text: string, record?: boolean): ParseResult;
  test(text: string, record?: boolean): boolean;
  clone(name?: string): Pattern;
  getTokens(): string[];
  getTokensAfter(childReference: Pattern): string[];
  getNextTokens(): string[];
  getPatterns(): Pattern[];
  getPatternsAfter(childReference: Pattern): Pattern[];
  getNextPatterns(): Pattern[];
  find(predicate: (pattern: Pattern) => boolean): Pattern | null;
  isEqual(pattern: Pattern): boolean;
}
