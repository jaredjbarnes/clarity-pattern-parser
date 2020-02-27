import { RegexValue } from "../../index.js";

const number = new RegexValue(
  "[Number]",
  "[-+]?[0-9]*[.]?[0-9]+([eE][-+]?[0-9]+)?"
);

export default number;
