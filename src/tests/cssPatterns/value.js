import { OrComposite } from "../../index.js";
import unit from "./unit.js";
import hex from "./hex.js";
import number from "./number.js";
import method from "./method.js";
import name from "./name.js"

const value = new OrComposite("value", [hex, method, unit, number, name]);

export default value;
