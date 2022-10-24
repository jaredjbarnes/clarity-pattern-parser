import {
  Literal,
  And,
  Repeat,
  Recursive,
} from "../../index";

import name from "./name";
import optionalSpaces from "./optionalSpaces";
import divider from "./divider";

const openParen = new Literal("open-paren", "(");
const closeParen = new Literal("close-paren", ")");
const values = new Recursive("values");
const args = new Repeat("arguments", values, divider, true);

const method = new And("method", [
  name.clone("[Method Name]"),
  openParen,
  optionalSpaces,
  args,
  optionalSpaces,
  closeParen
]);

export default method;
