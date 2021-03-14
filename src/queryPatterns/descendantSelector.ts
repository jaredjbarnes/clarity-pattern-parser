import {
  AndComposite,
  RecursivePattern,
  RegexValue,
} from "../index";
import elementSelector from "./elementSelector";

const spaces = new RegexValue("spaces", "\\s+");
const cssSelector = new RecursivePattern("css-selector");

const descendantSelector = new AndComposite("descendant-selector", [
  elementSelector,
  spaces,
  cssSelector
]);

export default descendantSelector;
