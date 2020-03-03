"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.attribute = void 0;

var _index = require("../../index");

var attributeName = new _index.RegexValue("attribute-name", "[a-zA-Z_:]+[a-zA-Z0-9_]*");
var doubleQuote = new _index.Literal("double-quote", '"');
var greaterThan = new _index.Literal("greater-than", ">");
var lessThan = new _index.Literal("less-than", "<");
var forwardSlash = new _index.Literal("forward-slash", "/");
var equal = new _index.Literal("equal", "=");
var spaces = new _index.RegexValue(" ", "\\s+");
var optionalSpaces = new _index.OptionalValue(spaces);
var value = new _index.RegexValue("value", '[^"]+');
var attribute = new _index.AndComposite("attribute", [attributeName, equal, doubleQuote, value, doubleQuote]);
exports.attribute = attribute;
var attributes = new _index.RepeatComposite("attributes", attribute, spaces);
var optionalAttributes = new _index.OptionalComposite(attributes);
var elementName = new _index.RegexValue("element-name", "[a-zA-Z]+[a-zA-Z-]*");
var text = new _index.RegexValue("text", "[^<>]+");
var recursiveElement = new _index.RecursivePattern("element");
var elementContent = new _index.RepeatComposite("children", new _index.OrComposite("content", [text, recursiveElement]));
var element = new _index.AndComposite("element", [lessThan, elementName.clone("open-element-name"), optionalSpaces, optionalAttributes, optionalSpaces, greaterThan, new _index.OptionalComposite(elementContent), lessThan, forwardSlash, elementName.clone("close-element-name"), optionalSpaces, greaterThan]);
var _default = element;
exports.default = _default;
//# sourceMappingURL=element.js.map