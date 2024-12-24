import { Sequence } from "../../patterns/Sequence";
import { Literal } from "../../patterns/Literal";
import { Options } from "../../patterns/Options";
import { Reference } from "../../patterns/Reference";
import { name } from "./name";

const dotPropertyAccess = new Sequence("dot-property-access", [
    new Literal("period", "."),
    name.clone("property-name")
]);

const bracketPropertyAccess = new Sequence("bracket-property-access", [
    new Literal("open-square-bracket", "["),
    new Reference("expression"),
    new Literal("close-square-bracket", "]"),
]);

const propertyAccessTypes = new Options("property-access-types", [
    dotPropertyAccess,
    bracketPropertyAccess
]);

const propertyAccess = new Sequence("property-access", [
    propertyAccessTypes,
    new Reference("property-access", true)
]);

export { propertyAccess }