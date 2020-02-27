import {
  Literal,
  AndComposite,
  RepeatComposite,
  RecursivePattern,
  OptionalComposite
} from "../../index.js";

import name from "./name.js";
import optionalSpaces from "./optionalSpaces.js";
import divider from "./divider.js";

const openParen = new Literal("open-paren", "(");
const closeParen = new Literal("close-paren", ")");
const values = new RecursivePattern("values");
const args = new RepeatComposite("arguments", values, divider);
const optionalArgs = new OptionalComposite(args);

const method = new AndComposite("method", [
  name.clone("[Method Name]"),
  openParen,
  optionalSpaces,
  optionalArgs,
  optionalSpaces,
  closeParen
]);

export default method;
