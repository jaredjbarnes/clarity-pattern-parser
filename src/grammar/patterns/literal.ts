import { Regex } from "../../patterns/Regex";

export const literal = new Regex("literal", '"(?:\\\\.|[^"\\\\])*"');
literal.setTokens(["[LITERAL]"]);