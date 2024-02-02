import { Repeat } from "../patterns/Repeat"
import { name } from "./name"
import { Regex } from "../patterns/Regex";

const divider = new Regex("or-divider", "\\s*[|]\\s*");

export const orLiteral = new Repeat("or-literal", name, divider, false, 2);