import { Sequence } from "../../patterns/Sequence";
import { exponent } from "./exponent";
import { fraction } from "./fraction";
import { integer } from "./integer";

export const numberLiteral = new Sequence("number-literal", [
    integer,
    fraction.clone("number-fraction", true),
    exponent.clone("number-exponent", true)
]);