import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Or } from "../../patterns/Or";
import { name } from "./name";
import { spaces } from "./spaces";
import { pattern } from "./pattern";

const optionalSpaces = spaces.clone("optional-spaces", true);
const assignOperator = new Literal("assign-operator", "=");

const assignStatement = new And("assign-statement", [
    optionalSpaces,
    name,
    optionalSpaces,
    assignOperator,
    optionalSpaces,
    pattern
]);

export const statement = new Or("statement", [assignStatement, name.clone("export-name")]);