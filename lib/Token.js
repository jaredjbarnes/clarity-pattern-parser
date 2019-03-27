"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const SPACE = /\s/;

class Token {
  parse(cursor) {
    let match = "";
    let character = cursor.getChar();

    if (SPACE.test(character)) {
      return null;
    } else {
      match = character;
    }

    while (cursor.hasNext()) {
      cursor.next();
      character = cursor.getChar();

      if (SPACE.test(character)) {
        break;
      }

      match += character;
    }

    if (match.length > 0) {
      return match;
    } else {
      return null;
    }
  }

}

exports.default = Token;
//# sourceMappingURL=Token.js.map