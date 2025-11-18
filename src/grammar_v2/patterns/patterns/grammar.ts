import { Expression } from "../../../patterns/Expression";
import { Literal } from "../../../patterns/Literal";
import { Optional } from "../../../patterns/Optional";
import { Options } from "../../../patterns/Options";
import { Reference } from "../../../patterns/Reference";
import { Regex } from "../../../patterns/Regex";
import { Repeat } from "../../../patterns/Repeat";
import { Sequence } from "../../../patterns/Sequence";

export const syntax = new Literal("syntax", "syntax");
export const imprt = new Literal("import", "import");
export const useParams = new Literal("useParams", "use params");
export const withParams = new Literal("withParams", "with params");
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
export const optionalWS = new Optional("optionalWS", ws);
export const optionalLS = new Optional("optionalLS", ls);

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
export const jsonArray = new Sequence("jsonArray", [openSquareBracket, optionalWS, jsonArrayItems, optionalWS, closeSquareBracket]);
export const jsonObjectPropertyName = literal.clone("jsonObjectPropertyName");
export const jsonObjectProperty = new Sequence("jsonObjectProperty", [jsonObjectPropertyName, optionalWS, colon, optionalWS, new Reference("jsonValue")]);
export const jsonObjectProperties = new Repeat("jsonObjectProperties", jsonObjectProperty, { divider: comma, trimDivider: true });
export const jsonObject = new Sequence("jsonObject", [openBracket, optionalWS, jsonObjectProperties, optionalWS, closeBracket]);
export const jsonValue = new Options("jsonValue", [jsonString, jsonNumber, jsonBoolean, jsonNull, jsonArray, jsonObject]);

export const syntaxStatement = new Sequence("syntaxStatement", [syntax, optionalWS, syntaxVersion]);

export const decorationName = name.clone("decorationName");
export const decorationStatement = new Sequence("decorationStatement", [at, optionalWS, decorationName, optionalWS, openParen, optionalWS, jsonValue, optionalWS, closeParen]);

export const useParamPatterns = new Repeat("useParamPatterns", patternName, { divider: comma, trimDivider: true });
export const useParamsStatement = new Sequence("useParamsStatement", [useParams, optionalLS, openBracket, optionalWS, useParamPatterns, optionalWS, closeBracket]);

export const withParamStatements = new Repeat("withParamStatements", new Reference("patternAssignment"), { divider: newLine, trimDivider: true });
export const withParamsExpr = new Sequence("withParamsExpr", [withParams, optionalLS, openBracket, optionalWS, withParamStatements, optionalWS, closeBracket]);

export const patternNames = new Repeat("patternNames", patternName, { divider: comma, trimDivider: true });
export const importedPatterns = new Sequence("importedPatterns", [openBracket, optionalWS, patternNames, optionalWS, closeBracket]);
export const importStatement = new Sequence("importStatement", [imprt, optionalLS, importedPatterns, optionalLS, from, optionalLS, resource, optionalLS, new Optional("optionalWithParamsExpr", withParamsExpr)]);

export const notExpr = new Sequence("notExpr", [not, optionalLS, new Reference("unaryPatternExpr")]);
export const optionalExpr = new Sequence("optionalExpr", [new Reference("unaryPatternExpr"), optionalLS, optional]);
export const rightAssociationExpr = new Sequence("rightAssociationExpr", [new Reference("unaryPatternExpr"), optionalLS, right]);
export const unaryPatternExpr = new Expression("unaryPatternExpr", [notExpr, optionalExpr, rightAssociationExpr, patternIdentifier]);

export const repeatBounds = new Sequence("repeatBounds", [openBracket, optionalWS, new Optional("optionalInteger", integer), optionalWS, new Optional("optionalComma", comma), optionalWS, new Optional("optionalInteger", integer), optionalWS, closeBracket]);
export const oneOrMore = new Literal("oneOrMore", "+");
export const zeroOrMore = new Literal("zeroOrMore", "*");
export const repeatOptions = new Options("repeatOptions", [oneOrMore, zeroOrMore, repeatBounds]);
export const delimiter = new Sequence("delimiter", [comma, new Reference("patternExpr"), optionalWS, new Optional("optionalTrim", trim)]);
export const repeatExpr = new Sequence("repeatExpr", [openParen, optionalWS, new Reference("patternExpr"), optionalWS, new Optional("optionalDelimiter", delimiter), optionalWS, closeParen, repeatOptions]);

export const sequenceExpr = new Sequence("sequenceExpr", [new Reference("patternExpr"), optionalWS, concat, optionalWS, new Reference("patternExpr")]);
export const optionsExpr = new Sequence("optionsExpr", [new Reference("patternExpr"), optionalWS, bar, optionalWS, new Reference("patternExpr")]);
export const greedyOptionsExpr = new Sequence("greedyOptionsExpr", [new Reference("patternExpr"), optionalWS, greedyBar, optionalWS, new Reference("patternExpr")]);
export const patternGroupExpr = new Sequence("patternGroupExpr", [openParen, optionalWS, new Reference("patternExpr"), optionalWS, closeParen]);

export const exportPattern = patternName.clone("exportPattern");
export const patternExpr = new Expression("patternExpr", [sequenceExpr, optionsExpr, greedyOptionsExpr, repeatExpr, patternGroupExpr, literal, regex, unaryPatternExpr]);
export const patternAssignment = new Sequence("patternAssignment", [patternName, optionalWS, assign, optionalWS, patternExpr]);
export const statement = new Options("statement", [useParamsStatement, importStatement, patternAssignment, decorationStatement, exportPattern, comment]);
export const statements = new Repeat("statements", statement, { divider: newLine});
export const cpat = new Sequence("cpat", [optionalWS, new Optional("optionalSyntaxStatement", syntaxStatement), optionalWS, new Optional("optionalStatements", statements)]);

export const grammar = cpat;