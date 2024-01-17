import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Or } from "../../patterns/Or";
import { Reference } from "../../patterns/Reference";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";
import { name } from "./name";
import { optionalSpaces } from "./optionalSpaces";
import { stringLiteral } from "./stringLiteral";

const propertyName = new Or("property-name", [stringLiteral, name]);
const property = new And("property", [
    propertyName,
    optionalSpaces,
    new Literal("colon", ":"),
    optionalSpaces,
    new Reference("expression"),
]);
const divider = new Regex("property-divider", "\\s*,\\s*");
const properties = new Repeat("properties", property, divider, true);

const objectLiteral = new And("object-literal", [
    new Literal("open-curly-bracket", "{"),
    optionalSpaces,
    properties,
    optionalSpaces,
    new Literal("close-curly-bracket", "}"),
]);

export { objectLiteral }