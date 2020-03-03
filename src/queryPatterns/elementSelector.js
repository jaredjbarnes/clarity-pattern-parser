import elementName from "./elementName.js";
import attribute from "./attribute.js";
import { OrComposite, AndComposite } from "../index.js";

const attributeSelector = new AndComposite("attribute-selector", [
  elementName,
  attribute
]);

const elementSelector = new OrComposite("element-selector", [
  attributeSelector,
  elementName
]);

export default elementSelector;
