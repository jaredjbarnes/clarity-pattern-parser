import childSelector from "./childSelector";
import elementSelector from "./elementSelector";
import { OrComposite } from "../index";
import descendantSelector from "./descendantSelector";

const cssSelector = new OrComposite("css-selector", [
  childSelector,
  descendantSelector,
  elementSelector
]);

export default cssSelector;
