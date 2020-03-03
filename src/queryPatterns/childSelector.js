import {
  AndComposite,
  Literal,
  RecursivePattern,
  RegexValue,
  OptionalValue
} from "../index.js";

import elementSelector from "./elementSelector.js";

const greaterThan = new Literal(">", ">");
const spaces = new RegexValue("spaces", "\\s+");
const optionalSpaces = new OptionalValue(spaces);
const cssSelector = new RecursivePattern("css-selector");

const childSelector = new AndComposite("child-selector", [
  elementSelector,
  optionalSpaces,
  greaterThan,
  optionalSpaces,
  cssSelector
]);

export default childSelector;
