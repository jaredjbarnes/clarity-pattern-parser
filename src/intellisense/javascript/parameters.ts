import { And } from "../../patterns/And";
import { Literal } from "../../patterns/Literal";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";
import { name } from "./name";

const divider = new Regex(",", "\\s*[,]\\s*");
divider.setTokens([", "]);

const optionalSpace = new Regex("optional-space", "\\s", true)

const parameters = new And("parameters", [
    new Literal("open-paren", "("),
    optionalSpace,
    new Repeat("arguments", name, divider),
    optionalSpace,
    new Literal("close-paren", ")"),
]);

export { parameters }