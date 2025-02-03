import { Repeat } from "../../patterns/Repeat";
import { Regex } from "../../patterns/Regex";
import { name } from "./name";
import { anonymousPattern } from "./anonymousPattern";
import { Options } from "../../patterns/Options";
import { Sequence } from "../../patterns/Sequence";
import { Optional } from "../../patterns/Optional";
import { Literal } from "../../patterns/Literal";

const patternName = name.clone("pattern-name");
patternName.setTokens(["[PATTERN_NAME]"]);

const patterns = new Sequence("patterns", [
    new Options("options-patterns", [patternName, anonymousPattern]),
    new Optional("optional-right-associated", new Literal("right-associated", " right"))
]);
const defaultDivider = new Regex("default-divider", "\\s*[|]\\s*");
defaultDivider.setTokens(["|"]);

const greedyDivider = new Regex("greedy-divider", "\\s*[<][|][>]\\s*");
greedyDivider.setTokens(["<|>"]);

const divider = new Options("options-divider", [defaultDivider, greedyDivider]);

export const optionsLiteral = new Repeat("options-literal", patterns, { divider, min: 2, trimDivider: true });