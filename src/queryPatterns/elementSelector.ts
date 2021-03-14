import elementName from "./elementName";
import attribute from "./attribute";
import { OrComposite, AndComposite } from "../index";

const attributeSelector = new AndComposite("attribute-selector", [
  elementName,
  attribute
]);

const elementSelector = new OrComposite("element-selector", [
  attributeSelector,
  elementName
]);

export default elementSelector;
