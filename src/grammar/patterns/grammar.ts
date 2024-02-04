import { Or } from "../../patterns/Or";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";
import { comment } from "./comment";
import { statement } from "./statement";

const whitespace = new Regex("whitespace", "[ \\t]+");
const newLine = new Regex("new-line", "(\\r?\\n)+");

const line = new Or("line", [
    comment,
    statement,
    whitespace
], true);

export const grammar = new Repeat("grammer", line, { divider: newLine });
