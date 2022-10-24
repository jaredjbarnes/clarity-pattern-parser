import { And, Regex } from "../../index";

import number from "./number";

const unitType = new Regex("unit-type", "[a-zA-Z]+|%");
const unit = new And("unit", [number, unitType]);

export default unit;
