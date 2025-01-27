import { Pattern } from "./Pattern";

export class ParseError {
  readonly firstIndex: number;
  readonly startIndex: number;
  readonly endIndex: number;
  readonly lastIndex: number;
  readonly pattern: Pattern;

  constructor(startIndex: number, lastIndex: number, pattern: Pattern) {
    this.firstIndex = startIndex;
    this.startIndex = startIndex;
    this.lastIndex = lastIndex;
    this.endIndex = lastIndex + 1;
    this.pattern = pattern;
  }
}
