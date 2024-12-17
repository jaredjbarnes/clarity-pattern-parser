import { Repeat } from "../../patterns/Repeat"
import { name } from "./name"
import { Regex } from "../../patterns/Regex";

const divider = new Regex("or-divider", "\\s*[|]\\s*");
divider.setTokens([" | "]);

export const orLiteral = new Repeat("or-literal", name.clone("pattern-name"), { divider, min: 2, trimDivider: true });