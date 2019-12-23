import { RepeatComposite } from "../../index.js";
import divider from "./divider.js";
import values from "./values.js";

const cssValue = new RepeatComposite("css-value", values, divider);

export default cssValue;
