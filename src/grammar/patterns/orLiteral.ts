import { Repeat } from "../../patterns/Repeat";
import { Regex } from "../../patterns/Regex";
import { name } from "./name";
import { anonymousPattern } from "./anonymousPattern";
import { Or } from "../../patterns/Or";

const patternName = name.clone("pattern-name");
const patterns = new Or("or-patterns", [patternName, anonymousPattern]);

const divider = new Regex("or-divider", "\\s*[|]\\s*");
divider.setTokens([" | "]);

export const orLiteral = new Repeat("or-literal", patterns, { divider, min: 2, trimDivider: true });