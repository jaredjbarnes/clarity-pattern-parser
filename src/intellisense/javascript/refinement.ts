import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Or } from "../../patterns/Or";
import { Reference } from "../../patterns/Reference";
import { name } from "./name";

const dotNotation = new And("dot-notation", [
    new Literal("period", "."),
    name
]);

const bracketNotation = new And("bracket-notation", [
    new Literal("open-square-bracket", "["),
    new Reference("expression"),
    new Literal("close-square-bracket", "]"),
]);

const refinement = new Or("refinement", [
    dotNotation,
    bracketNotation,
]);

export { refinement }