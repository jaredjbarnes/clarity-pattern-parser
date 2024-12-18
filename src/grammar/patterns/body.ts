import { And } from "../../patterns/And";
import { Or } from "../../patterns/Or";
import { Repeat } from "../../patterns/Repeat";
import { comment } from "./comment";
import { lineSpaces, newLine } from "./spaces";
import { statement } from "./statement";

const bodyLineContent = new Or("body-line-content", [
    comment,
    statement
]);

const bodyLine = new And("body-line", [
    lineSpaces.clone("line-spaces", true),
    bodyLineContent,
    lineSpaces.clone("line-spaces", true),
]);

export const body = new Repeat("body", bodyLine, {divider: newLine, min: 0});
