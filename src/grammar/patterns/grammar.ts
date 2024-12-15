import { Or } from "../../patterns/Or";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";
import { comment } from "./comment";
import { statement } from "./statement";
import { importStatement } from './import';

const whitespace = new Regex("whitespace", "[ \\t]+((\\r?\\n)+)?");
const newLine = new Regex("new-line", "(\\r?\\n)+");

whitespace.setTokens([" "]);
newLine.setTokens(["\n"]);

const line = new Or("line", [
    newLine,
    whitespace,
    comment,
    importStatement,
    statement
]);

export const grammar = new Repeat("grammer", line);
