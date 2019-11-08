"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Mark = _interopRequireDefault(require("./Mark"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Cursor {
  constructor(string) {
    this.string = string;
    this.index = 0;
    this.length = string.length;
    this.assertValidity();
  }

  assertValidity() {
    if (this.isNullOrEmpty(this.string)) {
      throw new Error("Illegal Argument: Cursor needs to have a string that has a length greater than 0.");
    }
  }

  isNullOrEmpty(value) {
    return value == null || typeof value === "string" && value.length === 0;
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
    return new _Mark.default(this, this.index);
  }

  moveToMark(mark) {
    if (mark instanceof _Mark.default && mark.cursor === this) {
      this.index = mark.index;
      return true;
    } else {
      throw new Error("Illegal Argument: The mark needs to be an instance of Mark and created by this cursor.");
    }
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

exports.default = Cursor;
//# sourceMappingURL=Cursor.js.map