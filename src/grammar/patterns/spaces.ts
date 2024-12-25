import { Options } from "../../patterns/Options";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";

export const tabs = new Regex("tabs", "\\t+");
tabs.setTokens(["\t"]);

export const spaces = new Regex("spaces", "[ ]+");
spaces.setTokens([" "]);

export const newLine = new Regex("new-line", "(\\r?\\n)+");
newLine.setTokens(["\n"]);

export const lineSpaces = new Repeat("line-spaces", new Options("line-space", [tabs, spaces]));
export const allSpaces = new Regex("all-spaces", "\\s+");
allSpaces.setTokens([" "]);
