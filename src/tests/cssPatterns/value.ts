import { OrComposite } from "../../index";
import unit from "./unit";
import hex from "./hex";
import number from "./number";
import method from "./method";
import name from "./name"

const value = new OrComposite("value", [hex, method, unit, number, name]);

export default value;
