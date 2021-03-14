import {
  Literal,
  OptionalValue,
  AndValue,
  OrValue,
  AndComposite,
  OrComposite,
  RegexValue,
  NotValue,
  RepeatComposite,
  RecursivePattern,
  OptionalComposite
} from "../../index";

const attributeName = new RegexValue(
  "attribute-name",
  "[a-zA-Z_:]+[a-zA-Z0-9_]*"
);

const doubleQuote = new Literal("double-quote", '"');
const greaterThan = new Literal("greater-than", ">");
const lessThan = new Literal("less-than", "<");
const forwardSlash = new Literal("forward-slash", "/");
const equal = new Literal("equal", "=");
const spaces = new RegexValue(" ", "\\s+");
const optionalSpaces = new OptionalValue(spaces);

const value = new RegexValue("value", '[^"]+');

export const attribute = new AndComposite("attribute", [
  attributeName,
  equal,
  doubleQuote,
  value,
  doubleQuote
]);
const attributes = new RepeatComposite("attributes", attribute, spaces);
const optionalAttributes = new OptionalComposite(attributes);

const elementName = new RegexValue("element-name", "[a-zA-Z]+[a-zA-Z-]*");
const text = new RegexValue("text", "[^<>]+");
const recursiveElement = new RecursivePattern("element");

const elementContent = new RepeatComposite(
  "children",
  new OrComposite("content", [text, recursiveElement])
);

const element = new AndComposite("element", [
  lessThan,
  elementName.clone("open-element-name"),
  optionalSpaces,
  optionalAttributes,
  optionalSpaces,
  greaterThan,
  new OptionalComposite(elementContent),
  lessThan,
  forwardSlash,
  elementName.clone("close-element-name"),
  optionalSpaces,
  greaterThan
]);

export default element;
