import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Or } from "../../patterns/Or";
import { Reference } from "../../patterns/Reference";
import { name } from "./name";

const dotPropertyAccess = new And("dot-property-access", [
    new Literal("period", "."),
    name
]);

const bracketPropertyAccess = new And("bracket-property-access", [
    new Literal("open-square-bracket", "["),
    new Reference("expression"),
    new Literal("close-square-bracket", "]"),
]);

const propertyAccess = new Or("property-access", [
    dotPropertyAccess,
    bracketPropertyAccess,
]);

export { propertyAccess }