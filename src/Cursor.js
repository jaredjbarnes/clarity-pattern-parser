import Mark from "./Mark.js";

export default class Cursor {
  constructor(string, { verbose } = {}) {
    this.string = string;
    this.index = 0;
    this.length = string.length;
    this.parseError = null;
    this.verbose = typeof verbose === "boolean" ? verbose : false;
    this.isInErrorState = false;
    this.assertValidity();
  }

  throwError(parseError) {
    this.isInErrorState = true;
    if (this.parseError == null || parseError.index >= this.parseError.index){
      this.parseError = parseError;
    }
  }

  resolveError() {
    this.isInErrorState = false;
  }

  hasUnresolvedError() {
    return this.isInErrorState;
  }

  assertValidity() {
    if (this.isNullOrEmpty(this.string)) {
      throw new Error(
        "Illegal Argument: Cursor needs to have a string that has a length greater than 0."
      );
    }
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
    this.setIndex(mark);
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
}
