import { Or } from "../../patterns/Or";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";
import { comment } from "./comment";
import { statement } from "./statement";
import { importBlock } from './import';
import { And } from "../../patterns/And";

const whitespace = new Regex("whitespace", "[ \\t]+");
const newLine = new Regex("new-line", "(\\r?\\n)+");

whitespace.setTokens([" "]);
newLine.setTokens(["\n"])

const line = new Or("line", [
    comment,
    statement,
    whitespace
], true);

const bodyBlock = new Repeat("body-block", line, { divider: newLine })

export const grammar = new And("grammer", [importBlock, bodyBlock]);
