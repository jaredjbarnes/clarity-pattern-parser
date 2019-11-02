import Literal from "../Literal.js";
import Or from "../Or.js";
import And from "../And.js";
import Not from "../Not.js";
import Cursor from "../../Cursor.js";
import Repetition from "../Repetition.js";
import Any from "../Any.js";

describe("Combination", () => {
  test("Whitespace.", () => {
    const space = new Literal("space", " ");
    const carriageReturn = new Literal("carriage-return", "\r");
    const newLine = new Literal("new-line", "\n");
    const tab = new Literal("tab", "\t");
    const doubleSlash = new Literal("double-slash", "//");
    const slashStar = new Literal("slash-star", "/*");
    const starSlash = new Literal("star-slash", "*/");

    const lineEnd = new Or([carriageReturn, newLine]);
    const anyCharacterButLineEnd = new Not("comment", lineEnd);
    const anyCharacterButStarSlash = new Not("comment", starSlash);

    const singleLineComment = new And("single-line-comment", [
      doubleSlash,
      anyCharacterButLineEnd,
      lineEnd
    ]);

    const multilineComment = new And("multiline-comment", [
      slashStar,
      anyCharacterButStarSlash,
      starSlash
    ]);

    const whitespaceOptions = new Or([
      space,
      lineEnd,
      tab,
      singleLineComment,
      multilineComment
    ]);

    const whitespace = new Repetition("whitespace", whitespaceOptions);

    const cursor = new Cursor(`
            //This is a single line comment!

            /*
                First line!
                Second line!
            */
        `);

    const node = whitespace.parse(cursor);
  });

  test("Method Invocation.", () => {
    const number = new Any("number", "0123456789");
    const openParen = new Literal("openParen", "(");
    const closeParen = new Literal("closeParen", ")");
    const letter = new Any(
      "letter",
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    );
    const dash = new Literal("dash", "-");
    const underscore = new Literal("underscore", "_");
    const acceptableCharacters = Or([letter, number, dash, underscore]);

    const identifier = new And("method-name", [letter, acceptableCharacters]);

    const comma = new new Literal(",")();
    const notAComma = new Not("argument", comma);
    const space = new Literal("space", " ");
    const spaces = new Repetition("spaces", space);
    const surroundWithSpace = new And(" , ", [spaces, comma, spaces]);
    const beginWithSpace = new And(" ,", [spaces, comma]);
    const endWithSpace = new And(", ", [comma, spaces]);

    const divider = Or([
      comma,
      surroundWithSpace,
      beginWithSpace,
      endWithSpace
    ]);

    const args = new Repetition("arguments", notAComma, divider);
    const methodSignature = new And("method-signature", [
      identifier,
      openParen,
      closeParen
    ]);
  });
});
