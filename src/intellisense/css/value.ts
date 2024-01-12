import unit from "./unit";
import hex from "./hex";
import number from "./number";
import method from "./method";
import name from "./name"
import { Or } from "../../patterns/Or";

const value = new Or("value", [hex, method, unit, number, name]);

export default value;
