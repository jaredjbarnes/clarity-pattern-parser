import CursorHistory from "./CursorHistory";

export default class Cursor {
  constructor(string) {
    this.string = string;
    this.index = 0;
    this.length = string.length;
    this.history = new CursorHistory();
    this.isInErrorState = false;

    this.assertValidity();
  }

  assertValidity() {
    if (this.isNullOrEmpty(this.string)) {
      throw new Error(
        "Illegal Argument: Cursor needs to have a string that has a length greater than 0."
      );
    }
  }

  startRecording(){
    this.history.startRecording();
  }

  stopRecording(){
    this.history.stopRecording();
  }

  get parseError (){
    return this.history.getFurthestError();
  }

  throwError(parseError) {
    this.isInErrorState = true;
    this.history.addError(parseError);
  }

  addMatch(pattern, astNode){
    this.history.addMatch(pattern, astNode);
  }

  resolveError() {
    this.isInErrorState = false;
  }

  hasUnresolvedError() {
    return this.isInErrorState;
  }

  isNullOrEmpty(value) {
    return value == null || (typeof value === "string" && value.length === 0);
  }

  hasNext() {
    return this.index + 1 < this.string.length;
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

  moveToMark(mark) {
    this.index = mark;
  }

  moveToBeginning() {
    this.index = 0;
  }

  moveToLast() {
    this.index = this.string.length - 1;
  }

  getChar() {
    return this.string.charAt(this.index);
  }

  getIndex() {
    return this.index;
  }

  setIndex(index) {
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
    return this.index === this.string.length - 1;
  }

  lastIndex() {
    return this.length - 1;
  }

  didSuccessfullyParse(){
    return !this.hasUnresolvedError() && this.isAtEnd();
  }
}
