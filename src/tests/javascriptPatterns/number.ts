import {
  Regex
} from "../../index";

const number = new Regex(
  "number",
  "[-+]?[0-9]*[.]?[0-9]+([eE][-+]?[0-9]+)?"
);

export default number;
