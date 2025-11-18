import { Expression } from "../../patterns/Expression";
import { Literal } from "../../patterns/Literal";
import { Optional } from "../../patterns/Optional";
import { Options } from "../../patterns/Options";
import { Reference } from "../../patterns/Reference";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";
import { Sequence } from "../../patterns/Sequence";

export const syntax = new Literal("syntax", "syntax");
export const imprt = new Literal("import", "import");
export const useParams = new Literal("use params", "use params");
export const withParams = new Literal("with params", "with params");
export const from = new Literal("from", "from");
export const right = new Literal("right", "right");
export const ws = new Regex("ws", "\\s+");
export const ls = new Regex("ls", "[ \\t]+");
export const assign = new Literal("assign", "=");
export const bar = new Literal("|", "|");
export const greedyBar = new Literal("<|>", "<|>");
export const concat = new Literal("+", "+");
export const colon = new Literal(":", ":");
export const openParen = new Literal("(", "(");
export const closeParen = new Literal(")", ")");
export const openSquareBracket = new Literal("[", "[");
export const closeSquareBracket = new Literal("]", "]");
export const openBracket = new Literal("{", "{");
export const closeBracket = new Literal("}", "}");
export const comma = new Regex(",", "\\s*[,]\\s*");
export const trim = new Literal("trim", "trim");
export const not = new Literal("not", "!");
export const optional = new Literal("?", "?");
export const newLine = new Regex("newLine", "\\s*(\\r\\n|\\r|\\n)\\s*");
export const syntaxVersion = new Regex("syntaxVersion", "\\S*");
export const at = new Literal("@", "@");
export const optionalWs = new Optional("optionalWs", ws);
export const optionalLs = new Optional("optionalLs", ls);

export const literal = new Regex("literal", '"(?:\\\\.|[^"\\\\])*"');
export const regex = new Regex("regex", "\\/(\\\\|[^\\n\\r])*\\/");

export const integer = new Regex("integer", "[1-9][0-9]*|[0]");
export const name = new Regex("name", "[a-zA-Z_-]+[a-zA-Z0-9_-]*");
export const patternName = name.clone("patternName");
export const patternIdentifier = name.clone("patternIdentifier");
export const resource = literal.clone("resource");

export const comment = new Regex("comment", "#[^\\n\\r]*");

export const jsonString = literal.clone("jsonString");
export const jsonNumber = new Regex("jsonNumber", "-?\\d+(\\.\\d+)?");
export const trueLiteral = new Literal("trueLiteral", "true");
export const falseLiteral = new Literal("falseLiteral", "false");
export const jsonBoolean = new Options("jsonBoolean", [trueLiteral, falseLiteral]);
export const jsonNull = new Literal("jsonNull", "null");
export const jsonArrayItems = new Repeat("jsonArrayItems", new Reference("jsonValue"), { divider: comma, trimDivider: true });
export const jsonArray = new Sequence("jsonArray", [openSquareBracket, optionalWs, jsonArrayItems, optionalWs, closeSquareBracket]);
export const jsonObjectPropertyName = literal.clone("jsonObjectPropertyName");
export const jsonObjectProperty = new Sequence("jsonObjectProperty", [jsonObjectPropertyName, optionalWs, colon, optionalWs, new Reference("jsonValue")]);
export const jsonObjectProperties = new Repeat("jsonObjectProperties", jsonObjectProperty, { divider: comma, trimDivider: true });
export const jsonObject = new Sequence("jsonObject", [openBracket, optionalWs, jsonObjectProperties, optionalWs, closeBracket]);
export const jsonValue = new Options("jsonValue", [jsonString, jsonNumber, jsonBoolean, jsonNull, jsonArray, jsonObject]);

export const syntaxStatement = new Sequence("syntaxStatement", [syntax, optionalWs, syntaxVersion]);

export const decorationName = name.clone("decorationName");
export const decorationStatement = new Sequence("decorationStatement", [at, optionalWs, decorationName, optionalWs, openParen, optionalWs, jsonValue, optionalWs, closeParen]);

export const useParamPatterns = new Repeat("useParamPatterns", patternName, { divider: comma, trimDivider: true });
export const useParamsStatement = new Sequence("useParamsStatement", [useParams, optionalLs, openBracket, optionalWs, useParamPatterns, optionalWs, closeBracket]);

export const withParamStatements = new Repeat("withParamStatements", new Reference("patternAssignment"), { divider: newLine, trimDivider: true });
export const withParamsExpr = new Sequence("withParamsExpr", [withParams, optionalLs, openBracket, optionalWs, withParamStatements, optionalWs, closeBracket]);

export const patternNames = new Repeat("patternNames", patternName, { divider: comma, trimDivider: true });
export const importedPatterns = new Sequence("importedPatterns", [openBracket, optionalWs, patternNames, optionalWs, closeBracket]);
export const importStatement = new Sequence("importStatement", [imprt, optionalLs, importedPatterns, optionalLs, from, optionalLs, resource, optionalLs, new Optional("optionalWithParamsExpr", withParamsExpr)]);

export const notExpr = new Sequence("notExpr", [not, optionalLs, new Reference("unaryPatternExpr")]);
export const optionalExpr = new Sequence("optionalExpr", [new Reference("unaryPatternExpr"), optionalLs, optional]);
export const rightAssociationExpr = new Sequence("rightAssociationExpr", [new Reference("unaryPatternExpr"), optionalLs, right]);
export const unaryPatternExpr = new Expression("unaryPatternExpr", [notExpr, optionalExpr, rightAssociationExpr, patternIdentifier]);

export const repeatBounds = new Sequence("repeatBounds", [openBracket, optionalWs, new Optional("optionalInteger", integer), optionalWs, new Optional("optionalComma", comma), optionalWs, new Optional("optionalInteger", integer), optionalWs, closeBracket]);
export const oneOrMore = new Literal("oneOrMore", "+");
export const zeroOrMore = new Literal("zeroOrMore", "*");
export const repeatOptions = new Options("repeatOptions", [oneOrMore, zeroOrMore, repeatBounds]);
export const delimiter = new Sequence("delimiter", [comma, new Reference("patternExpr"), optionalWs, new Optional("optionalTrim", trim)]);
export const repeatExpr = new Sequence("repeatExpr", [openParen, optionalWs, new Reference("patternExpr"), optionalWs, new Optional("optionalDelimiter", delimiter), optionalWs, closeParen, repeatOptions]);

export const sequenceExpr = new Sequence("sequenceExpr", [new Reference("patternExpr"), optionalWs, concat, optionalWs, new Reference("patternExpr")]);
export const optionsExpr = new Sequence("optionsExpr", [new Reference("patternExpr"), optionalWs, bar, optionalWs, new Reference("patternExpr")]);
export const greedyOptionsExpr = new Sequence("greedyOptionsExpr", [new Reference("patternExpr"), optionalWs, greedyBar, optionalWs, new Reference("patternExpr")]);
export const patternGroupExpr = new Sequence("patternGroupExpr", [openParen, optionalWs, new Reference("patternExpr"), optionalWs, closeParen]);

export const exportPattern = patternName.clone("exportPattern");
export const patternExpr = new Expression("patternExpr", [sequenceExpr, optionsExpr, greedyOptionsExpr, repeatExpr, patternGroupExpr, literal, regex, unaryPatternExpr]);
export const patternAssignment = new Sequence("patternAssignment", [patternName, optionalWs, assign, optionalWs, patternExpr]);
export const statement = new Options("statement", [useParamsStatement, importStatement, patternAssignment, decorationStatement, exportPattern, comment]);
export const statements = new Repeat("statements", statement, { divider: newLine});
export const cpat = new Sequence("cpat", [optionalWs, new Optional("optionalSyntaxStatement", syntaxStatement), optionalWs, new Optional("optionalStatements", statements)]);

export const grammar = cpat;