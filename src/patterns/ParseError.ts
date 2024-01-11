import { Pattern } from "./Pattern";

export class ParseError {
  public index: number;
  public pattern: Pattern;

  constructor(index: number, pattern: Pattern) {
    this.index = index;
    this.pattern = pattern;
  }
}
