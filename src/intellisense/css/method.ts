import { Reference } from "../../patterns/Reference";
import { Literal } from "../../patterns/Literal";
import { Repeat } from "../../patterns/Repeat";
import { Sequence } from "../../patterns/Sequence";
import name from "./name";
import optionalSpaces from "./optionalSpaces";
import divider from "./divider";

const openParen = new Literal("open-paren", "(");
const closeParen = new Literal("close-paren", ")");
const values = new Reference("values");
const args = new Repeat("arguments", values, { divider, min: 0 });
const methodName = name.clone("method-name");
methodName.setTokens(["rgba", "radial-gradient", "linear-gradient"]);

const method = new Sequence("method", [
  methodName,
  openParen,
  optionalSpaces,
  args,
  optionalSpaces,
  closeParen
]);

export default method;
