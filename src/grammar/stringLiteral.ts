import { Regex } from "../patterns/Regex";

export const stringLiteral = new Regex("string-literal", "\"(?:\\\\[\"\\\\]|[^\n\"\\\\])*\"");



