import childSelector from "./childSelector.js";
import elementSelector from "./elementSelector.js";
import { OrComposite } from "../index.js";
import descendantSelector from "./descendantSelector.js";

const cssSelector = new OrComposite("css-selector", [
  childSelector,
  descendantSelector,
  elementSelector
]);

export default cssSelector;
