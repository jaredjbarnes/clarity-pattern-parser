import { Sequence } from "../../patterns/Sequence";
import { Literal } from "../../patterns/Literal";
import { Options } from "../../patterns/Options";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";
import { escapedCharacter } from "./escapedCharacter";
import { Optional } from "../../patterns/Optional";

const doubleQuoteStringLiteral = new Sequence("double-string-literal", [
    new Literal("double-quote", "\""),
    new Optional("optional-characters", new Repeat("characters",
        new Options("characters", [
            new Regex("normal-characters", '[^"]+'),
            escapedCharacter
        ])
    )),
    new Literal("double-quote", "\""),
]);

const singleQuoteStringLiteral = new Sequence("single-string-literal", [
    new Literal("single-quote", "'"),
    new Optional("optional-characters", new Repeat("characters",
        new Options("characters", [
            new Regex("normal-characters", "[^']+"),
            escapedCharacter
        ]),
    )),
    new Literal("single-quote", "'"),
]);

const stringLiteral = new Options("string-literal", [doubleQuoteStringLiteral, singleQuoteStringLiteral]);

export { stringLiteral };