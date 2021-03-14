import Pattern from "./Pattern";

export default class ParseError {
  public message: string;
  public name: string;
  public index: number;
  public pattern: Pattern;

  constructor(message: string, index: number, pattern: Pattern) {
    this.name = "ParseError";
    this.message = message;
    this.index = index;
    this.pattern = pattern;
  }
}
