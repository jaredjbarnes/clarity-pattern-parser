import unit from "./unit";
import hex from "./hex";
import number from "./number";
import method from "./method";
import name from "./name"
import { Options } from "../../patterns/Options";

const value = new Or("value", [hex, method, unit, number, name]);

export default value;
