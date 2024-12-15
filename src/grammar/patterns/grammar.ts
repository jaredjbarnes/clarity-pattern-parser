import { Or } from "../../patterns/Or";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";
import { comment } from "./comment";
import { statement } from "./statement";
import { importStatement } from './import';

const whitespace = new Regex("whitespace", "[ \\t]+");
const newLine = new Regex("new-line", "([ \\t]+)?(\\r?\\n)+([ \\t]+)?");

whitespace.setTokens([" "]);
newLine.setTokens(["\n"]);

const line = new Or("line", [
    importStatement,
    comment,
    statement,
], true);



export const grammar = new Repeat("grammer", line, { divider: newLine, min: 1 });
