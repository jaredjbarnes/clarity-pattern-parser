import { Repeat } from "../patterns/Repeat"
import { Regex } from "../patterns/Regex";
import { pattern } from "./pattern";

const divider = new Regex("and-divider", "\\s*[&]\\s*");

export const andLiteral = new Repeat("and-literal", pattern, divider, false, 2);