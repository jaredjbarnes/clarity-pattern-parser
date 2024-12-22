import { Repeat } from "../../patterns/Repeat";
import { Regex } from "../../patterns/Regex";
import { name } from "./name";
import { anonymousPattern } from "./anonymousPattern";
import { Or } from "../../patterns/Or";

const patternName = name.clone("pattern-name");
const patterns = new Or("or-patterns", [patternName, anonymousPattern]);
const defaultDivider = new Regex("default-divider", "\\s*[|]\\s*");
const greedyDivider = new Regex("greedy-divider", "\\s*[<][|][>]\\s*");

const divider = new Or("or-divider", [defaultDivider, greedyDivider]);
defaultDivider.setTokens([" | "]);
greedyDivider.setTokens([" <|> "]);

export const orLiteral = new Repeat("or-literal", patterns, { divider, min: 2, trimDivider: true });