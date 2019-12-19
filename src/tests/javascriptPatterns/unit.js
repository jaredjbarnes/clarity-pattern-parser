import {
  AndComposite,
  RegexValue
} from "../../index.js";

import number from "./number.js";

const unitType = new RegexValue("unit-type","[a-zA-Z]+|%");
const unit = new AndComposite("unit", [number, unitType]);

export default unit;
