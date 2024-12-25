import { Optional } from "../../patterns/Optional";
import { Sequence } from "../../patterns/Sequence";
import { exponent } from "./exponent";
import { fraction } from "./fraction";
import { integer } from "./integer";

export const numberLiteral = new Sequence("number-literal", [
    integer,
    new Optional("number-fraction", fraction),
    new Optional("number-exponent", exponent)
]);