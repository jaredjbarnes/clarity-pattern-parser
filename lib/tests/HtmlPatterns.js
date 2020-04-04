"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _element = _interopRequireWildcard(require("./htmlPatterns/element"));

var _index = require("../index.js");

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

exports["Html: element"] = function () {
  var cursor = new _index.Cursor("<div></div>");

  var result = _element.default.parse(cursor);
};

exports["Html: element nested"] = function () {
  var cursor = new _index.Cursor("<div><p><span></span></p></div>");

  var result = _element.default.parse(cursor);
};

exports["Html: element with attributes"] = function () {
  var cursor = new _index.Cursor('<div prop="value"></div>');

  var result = _element.default.parse(cursor);
};

exports["Html: multiple children"] = function () {
  var cursor = new _index.Cursor("<div prop=\"value\">\n        Text\n        <span>Hello</span>\n        <span>World!</span>\n    </div>");

  var result = _element.default.parse(cursor);

  var possibilities = _element.default.getPossibilities();
};

exports["Attributes: "] = function () {
  var cursor = new _index.Cursor('prop="boo"');

  var result = _element.attribute.parse(cursor);
};
//# sourceMappingURL=HtmlPatterns.js.map