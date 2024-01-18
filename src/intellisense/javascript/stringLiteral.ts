import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Or } from "../../patterns/Or";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";
import { escapedCharacter } from "./escapedCharacter";

const doubleQuoteStringLiteral = new And("double-string-literal", [
    new Literal("double-quote", "\""),
    new Repeat("characters", new Or("characters", [
        new Regex("normal-characters", "[^\\\"]+"),
        escapedCharacter
    ])),
    new Literal("double-quote", "\""),
]);

const singleQuoteStringLiteral = new And("single-string-literal", [
    new Literal("single-quote", "'"),
    new Repeat("characters", new Or("characters", [
        new Regex("normal-characters", "[^\\']+"),
        escapedCharacter
    ])),
    new Literal("single-quote", "'"),
]);

const stringLiteral = new Or("string-literal", [doubleQuoteStringLiteral, singleQuoteStringLiteral]);

export { stringLiteral }