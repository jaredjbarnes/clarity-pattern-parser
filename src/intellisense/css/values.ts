import { Repeat } from "../../patterns/Repeat";
import value from "./value";
import spaces from "./spaces";

const values = new Repeat("values", value, { divider: spaces });

export default values;
