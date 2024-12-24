import { Sequence } from "../../patterns/Sequence";
import { Options } from "../../patterns/Options";
import { Repeat } from "../../patterns/Repeat";
import { comment } from "./comment";
import { lineSpaces, newLine } from "./spaces";
import { statement } from "./statement";

const bodyLineContent = new Options("body-line-content", [
    comment,
    statement
]);

const bodyLine = new Sequence("body-line", [
    lineSpaces.clone("line-spaces", true),
    bodyLineContent,
    lineSpaces.clone("line-spaces", true),
]);

export const body = new Repeat("body", bodyLine, {divider: newLine, min: 0});
