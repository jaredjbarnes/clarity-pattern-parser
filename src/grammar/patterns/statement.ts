import { Sequence } from "../../patterns/Sequence";
import { Literal } from "../../patterns/Literal";
import { Options } from "../../patterns/Options";
import { name } from "./name";
import { spaces } from "./spaces";
import { pattern } from "./pattern";
import { Optional } from "../../patterns/Optional";

const optionalSpaces = new Optional("optional-spaces", spaces);
const assignOperator = new Literal("assign-operator", "=");

const assignStatement = new Sequence("assign-statement", [
    optionalSpaces,
    name,
    optionalSpaces,
    assignOperator,
    optionalSpaces,
    pattern,
]);

export const statement = new Options("statement", [assignStatement, name.clone("export-name")]);