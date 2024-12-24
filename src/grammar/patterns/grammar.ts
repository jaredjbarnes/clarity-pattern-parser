import { Options } from "../../patterns/Options";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";
import { comment } from "./comment";
import { importStatement } from './import';
import { Sequence } from "../../patterns/Sequence";
import { allSpaces } from "./spaces";
import { body } from "./body";

const tabs = new Regex("tabs", "\\t+");
const spaces = new Regex("spaces", "[ ]+");
const newLine = new Regex("new-line", "(\\r?\\n)+");

spaces.setTokens([" "]);
tabs.setTokens(["\t"]);
newLine.setTokens(["\n"]);

const lineSpaces = new Repeat("line-spaces", new Options("line-space", [tabs, spaces]));

const headLineContent = new Options("head-line-content", [
    comment,
    importStatement
]);

const headLine = new Sequence("head-line-content", [
    lineSpaces.clone("line-spaces", true),
    headLineContent,
    lineSpaces.clone("line-spaces", true),
]);

const head = new Repeat("head", headLine, { divider: newLine, min: 0 });

export const grammar = new Sequence("grammar", [
    allSpaces,
    head,
    allSpaces,
    body,
    allSpaces
]);
