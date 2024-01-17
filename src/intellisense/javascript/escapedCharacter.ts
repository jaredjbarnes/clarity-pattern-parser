import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Or } from "../../patterns/Or";
import { Regex } from "../../patterns/Regex";

const backslash = new Literal("backslash", "\\");
const doubleQuote = new Literal("double-quote", "\"");
const singleQuote = new Literal("single-quote", "'");
const slash = new Literal("slash", "/");
const backspace = new Literal("backspace", "b");
const formFeed = new Literal("form-feed", "f");
const newLine = new Literal("new-line", "n");
const carriageReturn = new Literal("carriage-return", "r");
const tab = new Literal("tab", "t");
const hexDigit = new Regex("hex-digit", "[0-9a-fA-F]");

hexDigit.setTokens([
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "a", "b", "c", "d", "e", "f",
    "A", "B", "C", "D", "E", "F",
]);

const unicode = new And("hex", [
    new Literal("u", "u"),
    hexDigit,
    hexDigit,
    hexDigit,
    hexDigit
]);

const specialCharacter = new Or("special-character", [
    doubleQuote,
    singleQuote,
    backslash,
    slash,
    backspace,
    formFeed,
    newLine,
    carriageReturn,
    tab,
    unicode,
]);

const escapedCharacter = new And("escaped-character", [backslash, specialCharacter])
escapedCharacter.enableAstReduction();

export {
    escapedCharacter
}

