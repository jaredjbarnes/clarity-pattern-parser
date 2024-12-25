import { Repeat } from "../../patterns/Repeat";
import { Regex } from "../../patterns/Regex";
import { name } from "./name";
import { anonymousPattern } from "./anonymousPattern";
import { Options } from "../../patterns/Options";

const patternName = name.clone("pattern-name");
patternName.setTokens(["[PATTERN_NAME]"]);

const patterns = new Options("or-patterns", [patternName, anonymousPattern]);
const defaultDivider = new Regex("default-divider", "\\s*[|]\\s*");
defaultDivider.setTokens(["|"]);

const greedyDivider = new Regex("greedy-divider", "\\s*[<][|][>]\\s*");
greedyDivider.setTokens(["<|>"]);

const divider = new Options("options-divider", [defaultDivider, greedyDivider]);

export const optionsLiteral = new Repeat("options-literal", patterns, { divider, min: 2, trimDivider: true });