import { AndComposite, RegexValue } from "../../index";

import number from "./number";

const unitType = new RegexValue("[unit]", "[a-zA-Z%]+");
const unit = new AndComposite("unit", [number, unitType]);

export default unit;
