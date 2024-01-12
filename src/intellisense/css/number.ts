import { Regex } from "../../patterns/Regex";

const number = new Regex(
  "[Number]",
  "[-+]?[0-9]*[.]?[0-9]+([eE][-+]?[0-9]+)?"
);

number.setTokens(["0"]);

export default number;
