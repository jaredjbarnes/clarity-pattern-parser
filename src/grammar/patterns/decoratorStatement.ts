import { Literal } from "../../patterns/Literal";
import { Optional } from "../../patterns/Optional";
import { Options } from "../../patterns/Options";
import { Reference } from "../../patterns/Reference";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";
import { Sequence } from "../../patterns/Sequence";
import { name } from "./name";
import { allSpaces } from "./spaces";

const colon = new Literal("colon", ":");
const comma = new Regex("comma", "\\s*,\\s*");
const openBracket = new Literal("open-bracket", "{");
const closeBracket = new Literal("close-bracket", "}");
const openSquareBracket = new Literal("open-square-bracket", "[");
const closeSquareBracket = new Literal("close-square-bracket", "]");
const optionalAllSpaces = new Optional("optional-all-spaces", allSpaces);

const stringLiteral = new Regex("string-literal", '"(?:\\\\.|[^"\\\\])*"');
const numberLiteral = new Regex("number-literal", '[+-]?\\d+(\\\\.\\d+)?([eE][+-]?\\d+)?');
const nullLiteral = new Literal("null-literal", "null");
const trueLiteral = new Literal("true-literal", "true");
const falseLiteral = new Literal("false-literal", "false");
const booleanLiteral = new Options("", [trueLiteral, falseLiteral]);

const objectKey = name.clone("object-key");
const objectProperty = new Sequence("object-property", [
    objectKey,
    optionalAllSpaces,
    colon,
    optionalAllSpaces,
    new Reference("literal"),
]);
const objectProperies = new Repeat("object-properties", objectProperty, { divider: comma });
const objectLiteral = new Sequence("object-literal", [
    openBracket,
    optionalAllSpaces,
    new Optional("optional-object-properties", objectProperies),
    optionalAllSpaces,
    closeBracket
]);

const arrayItems = new Repeat("array-items", new Reference("literal"), { divider: comma });
const arrayLiteral = new Sequence("array-literal", [
    openSquareBracket,
    optionalAllSpaces,
    arrayItems,
    optionalAllSpaces,
    closeSquareBracket,
]);

const literal = new Options("literal", [
    objectLiteral,
    arrayLiteral,
    stringLiteral,
    booleanLiteral,
    nullLiteral,
    numberLiteral,
]);

const decoratorPrefix = new Literal("decorator-prefix", "@");
const decoratorName = name.clone("decorator-name");
const openParen = new Literal("open-paren", "(");
const closeParen = new Literal("close-paren", ")");

const methodDecoration = new Sequence("method-decorator", [
    decoratorPrefix,
    decoratorName,
    optionalAllSpaces,
    openParen,
    optionalAllSpaces,
    new Optional("optional-args", literal),
    optionalAllSpaces,
    closeParen
]);

const nameDecoration = new Sequence("name-decorator", [
    decoratorPrefix,
    decoratorName,
]);

export const decoratorStatement = new Options("decorator-statement", [
    methodDecoration,
    nameDecoration,
]);