import { And } from "../../patterns/And";
import { Regex } from "../../patterns/Regex";
import number from "./number";

const unitType = new Regex("[unit]", "[a-zA-Z%]+");
unitType.setTokens(["px", "%", "em", "rem", "vh", "vw"]);

const unit = new And("unit", [number, unitType]);

export default unit;
