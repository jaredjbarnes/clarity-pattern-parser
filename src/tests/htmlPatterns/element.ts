import { Literal, And, Or, Regex, Repeat, Recursive } from "../../index";

const attributeName = new Regex("attribute-name", "[a-zA-Z_:]+[a-zA-Z0-9_]*");

const doubleQuote = new Literal("double-quote", '"');
const greaterThan = new Literal("greater-than", ">");
const lessThan = new Literal("less-than", "<");
const forwardSlash = new Literal("forward-slash", "/");
const equal = new Literal("equal", "=");
const spaces = new Regex(" ", "\\s+", true);
const optionalSpaces = spaces.clone("optional-spaces", true);
const value = new Regex("value", '[^"]+');

export const attribute = new And("attribute", [
  attributeName,
  equal,
  doubleQuote,
  value,
  doubleQuote,
]);
const optionalAttributes = new Repeat("attributes", attribute, spaces, true);

const elementName = new Regex("element-name", "[a-zA-Z]+[a-zA-Z-]*");
const text = new Regex("text", "[^<>]+");
const recursiveElement = new Recursive("element");

const elementContent = new Repeat(
  "children",
  new Or("content", [text, recursiveElement]),
  undefined,
  true
);

const element = new And("element", [
  lessThan,
  elementName.clone("open-element-name"),
  optionalSpaces,
  optionalAttributes,
  optionalSpaces,
  greaterThan,
  elementContent,
  lessThan,
  forwardSlash,
  elementName.clone("close-element-name"),
  optionalSpaces,
  greaterThan,
]);

export default element;
