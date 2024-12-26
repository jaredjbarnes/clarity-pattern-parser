import { Sequence } from "../../patterns/Sequence";
import { Options } from "../../patterns/Options";
import { Repeat } from "../../patterns/Repeat";
import { comment } from "./comment";
import { lineSpaces, newLine } from "./spaces";
import { statement } from "./statement";
import { Optional } from "../../patterns/Optional";

const bodyLineContent = new Options("body-line-content", [
    comment,
    statement
]);

const optionalLineSpaces = new Optional("optional-line-spaces", lineSpaces);

const bodyLine = new Sequence("body-line", [
    optionalLineSpaces,
    bodyLineContent,
    optionalLineSpaces,
]);

export const body = new Optional("optional-body", new Repeat("body", bodyLine, {divider: newLine}));
