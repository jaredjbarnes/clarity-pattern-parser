import { Pattern } from "./Pattern";

export class ParseError {
  public startIndex: number
  public endIndex: number;
  public pattern: Pattern;

  constructor(startIndex: number, endIndex: number, pattern: Pattern) {
    this.startIndex = startIndex;
    this.endIndex = endIndex;
    this.pattern = pattern;
  }
}
