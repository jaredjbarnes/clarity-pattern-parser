import {
  Literal,
  OrValue,
  RepeatValue,
  AndValue,
  AnyOfThese,
  OptionalValue,
  RegexValue
} from "../../index.js";

const number = new RegexValue(
  "number",
  "[-+]?[0-9]*[.]?[0-9]+([eE][-+]?[0-9]+)?"
);

export default number;
