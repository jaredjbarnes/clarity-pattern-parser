import { Repeat } from "../../patterns/Repeat"
import { Regex } from "../../patterns/Regex";
import { pattern } from "./pattern";

const divider = new Regex("and-divider", "\\s*[&]\\s*");
divider.setTokens([" & "]);

export const andLiteral = new Repeat("and-literal", pattern, { divider, min: 2, trimDivider: true });