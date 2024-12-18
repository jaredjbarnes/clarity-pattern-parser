import { Or } from "../../patterns/Or";
import { Regex } from "../../patterns/Regex";
import { Repeat } from "../../patterns/Repeat";

export const tabs = new Regex("tabs", "\\t+");
export const spaces = new Regex("spaces", "[ ]+");
export const newLine = new Regex("new-line", "(\\r?\\n)+");

spaces.setTokens([" "]);
tabs.setTokens(["\t"]);
newLine.setTokens(["\n"]);

export const lineSpaces = new Repeat("line-spaces", new Or("line-space", [tabs, spaces]));
export const allSpaces = new Regex("all-spaces", "\\s+", true);
