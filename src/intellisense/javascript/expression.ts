import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Or } from "../../patterns/Or";
import { Reference } from "../../patterns/Reference";
import { infixOperator } from "./infixOperator";
import { invocation } from "./invocation";
import { literal } from "./literal";
import { name } from "./name";
import { optionalSpaces } from "./optionalSpaces";
import { prefixOperator } from "./prefixOperator";
import { refinement } from "./refinement";

export const expression = new Or("expression", [
    literal,
    name,
    new And("grouped-expression", [
        new Literal("open-paren", "("),
        optionalSpaces,
        new Reference("expression"),
        optionalSpaces,
        new Literal("close-paren", ")"),
    ]),
    new And("prefixed-expression", [
        prefixOperator,
        optionalSpaces,
        new Reference("expression"),
    ]),
    new And("infixed-operator-expression", [
        new Reference("expression"),
        optionalSpaces,
        infixOperator,
        optionalSpaces,
        new Reference("expression")
    ]),
    new And("ternary-expression", [
        new Reference("expression"),
        optionalSpaces,
        new Literal("question-mark", "?"),
        optionalSpaces,
        new Reference("expression"),
        optionalSpaces,
        new Literal("colon", ":"),
        optionalSpaces,
        new Reference("expression"),
    ]),
    new And("expression-invocation", [
        new Reference("expression"),
        optionalSpaces,
        invocation,
    ]),
    new And("expression-refinement", [
        new Reference("expression"),
        optionalSpaces,
        refinement,
    ]),
]);

