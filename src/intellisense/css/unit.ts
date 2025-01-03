import { Sequence } from "../../patterns/Sequence";
import { Regex } from "../../patterns/Regex";
import number from "./number";

const unitType = new Regex("unit-type", "[a-zA-Z%]+");
unitType.setTokens(["px", "%", "em", "rem", "vh", "vw"]);

const unit = new Sequence("unit", [number, unitType]);

export default unit;
