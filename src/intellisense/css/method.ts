import { Reference } from "../../patterns/Reference";
import { Literal } from "../../patterns/Literal";
import { Repeat } from "../../patterns/Repeat";
import { And } from "../../patterns/And";
import name from "./name";
import optionalSpaces from "./optionalSpaces";
import divider from "./divider";

const openParen = new Literal("open-paren", "(");
const closeParen = new Literal("close-paren", ")");
const values = new Reference("values");
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
