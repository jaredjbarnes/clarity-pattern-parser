import Pattern from "./Pattern";
import Node from "../ast/Node";
import CursorHistory from "./CursorHistory";
import ParseError from "./ParseError";

export default class Cursor {
  public text: string;
  public index: number;
  public length: number;
  public history: CursorHistory;
  public isInErrorState: boolean;

  constructor(text: string) {
    this.text = text;
    this.assertValidity();

    this.index = 0;
    this.length = text.length;
    this.history = new CursorHistory();
    this.isInErrorState = false;
  }

  assertValidity() {
    if (this.isNullOrEmpty(this.text)) {
      throw new Error(
        "Illegal Argument: Cursor needs to have a string that has a length greater than 0."
      );
    }
  }

  startRecording() {
    this.history.startRecording();
  }

  stopRecording() {
    this.history.stopRecording();
  }

  get parseError() {
    return this.history.getFurthestError();
  }

  get lastMatch() {
    return this.history.getFurthestMatch();
  }

  throwError(parseError: ParseError) {
    this.isInErrorState = true;
    this.history.addError(parseError);
  }

  addMatch(pattern: Pattern, astNode: Node) {
    this.history.addMatch(pattern, astNode);
  }

  resolveError() {
    this.isInErrorState = false;
  }

  hasUnresolvedError() {
    return this.isInErrorState;
  }

  isNullOrEmpty(value: string | null) {
    return value == null || (typeof value === "string" && value.length === 0);
  }

  hasNext() {
    return this.index + 1 < this.text.length;
  }

  hasPrevious() {
    return this.index - 1 >= 0;
  }

  next() {
    if (this.hasNext()) {
      this.index++;
    } else {
      throw new Error("Cursor: Out of Bounds Exception.");
    }
  }

  previous() {
    if (this.hasPrevious()) {
      this.index--;
    } else {
      throw new Error("Cursor: Out of Bounds Exception.");
    }
  }

  mark() {
    return this.index;
  }

  moveToMark(mark: number) {
    this.index = mark;
  }

  moveToBeginning() {
    this.index = 0;
  }

  moveToEnd() {
    this.index = this.text.length - 1;
  }

  getChar() {
    return this.text.charAt(this.index);
  }

  getChars(firstIndex: number, lastIndex: number) {
    return this.text.substring(firstIndex, lastIndex - 1);
  }

  safelyGetChars(firstIndex: number, lastIndex: number) {
    firstIndex = Math.max(firstIndex, 0);
    lastIndex = Math.min(lastIndex, this.text.length - 1);

    return this.getChars(firstIndex, lastIndex);
  }

  getIndex() {
    return this.index;
  }

  setIndex(index: number) {
    if (typeof index === "number") {
      if (index < 0 || index > this.lastIndex()) {
        throw new Error("Cursor: Out of Bounds Exception.");
      }

      this.index = index;
    }
  }

  isAtBeginning() {
    return this.index === 0;
  }

  isAtEnd() {
    return this.index === this.text.length - 1;
  }

  lastIndex() {
    return this.length - 1;
  }

  didSuccessfullyParse() {
    return !this.hasUnresolvedError() && this.isAtEnd();
  }
}
