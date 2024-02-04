import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { name } from "./name";

const optionalNot = new Literal("not", "!", true);
const optionalIsOptional = new Literal("is-optional", "?", true);
const patternName = name.clone("pattern-name");

export const pattern = new And("pattern", [
    optionalNot,
    patternName,
    optionalIsOptional,
]);