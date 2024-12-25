import { Sequence } from "../../patterns/Sequence";
import { Literal } from "../../patterns/Literal";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";
import { name } from "./name";
import { optionalSpaces } from "./optionalSpaces";

const divider = new Regex(",", "\\s*[,]\\s*");
divider.setTokens([", "]);


const parameters = new Sequence("parameters", [
    new Literal("open-paren", "("),
    optionalSpaces,
    new Repeat("arguments", name, { divider, trimDivider: true }),
    optionalSpaces,
    new Literal("close-paren", ")"),
]);

export { parameters }