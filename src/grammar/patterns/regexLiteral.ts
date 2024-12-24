import { Regex } from "../../patterns/Regex";

export const regexLiteral = new Regex("regex-literal", "/(\\\\/|[^/\\n\\r])*/");
regexLiteral.setTokens(["[REGEX_EXPRESSION]"]);

