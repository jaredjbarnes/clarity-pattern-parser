import { And } from "../../patterns/And";
import { exponent } from "./exponent";
import { fraction } from "./fraction";
import { integer } from "./integer";

export const numberLiteral = new And("number-literal", [
    integer,
    fraction.clone("number-fraction", true),
    exponent.clone("number-exponent", true)
]);