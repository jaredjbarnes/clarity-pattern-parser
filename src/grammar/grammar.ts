import { And } from "../patterns/And";
import { Or } from "../patterns/Or";
import { Regex } from "../patterns/Regex";
import { Repeat } from "../patterns/Repeat";
import { comment } from "./comment";
import { statement } from "./statement";

const newLine = new Regex("new-line", "\\r?\\n");
const optionalWhitespace = new Regex("optional-whitespace", "\\s+", true);
const line = new Or("line", [
    comment,
    statement,
]);

const lines = new Repeat("lines", line, newLine);
export const grammar = new And("grammar", [
    optionalWhitespace,
    lines,
    optionalWhitespace,
]);