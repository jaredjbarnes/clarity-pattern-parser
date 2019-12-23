"use strict";

var _cssValue = _interopRequireDefault(require("./cssPatterns/cssValue.js"));

var _values = _interopRequireDefault(require("./cssPatterns/values.js"));

var _index = require("../index.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Css: unit"] = function () {
  var cursor = new _index.Cursor("10% 10%");

  var result = _cssValue.default.parse(cursor);
};

exports["Css: radial-gradient"] = function () {
  var cursor = new _index.Cursor("radial-gradient(at 40% 40%, rgba(187,202,218,1) 0%, rgba(187,202,218,1) 20%, rgba(187,202,218,1) 100%)");

  var result = _cssValue.default.parse(cursor);
};

exports["Css: rgba"] = function () {
  var cursor = new _index.Cursor("rgba(0,0,0,0)");

  var result = _cssValue.default.parse(cursor);
};

exports["Css: method mutliple values"] = function () {
  var cursor = new _index.Cursor("rgba(first 0px third)");

  var result = _cssValue.default.parse(cursor);
};

exports["Css: nested methods"] = function () {
  var cursor = new _index.Cursor("outer-method(inner-method(0), 0)");

  var result = _cssValue.default.parse(cursor);
};

exports["Css: nested methods with trailing value"] = function () {
  var cursor = new _index.Cursor("outer-method(inner-method(0,0), 0)");

  var result = _cssValue.default.parse(cursor);
};

exports["Css: spaced values"] = function () {
  var cursor = new _index.Cursor("method(arg1 0%, arg2, 10%) 0%");

  var result = _values.default.parse(cursor);
};

exports["Css: spaced values within method"] = function () {
  var cursor = new _index.Cursor("method(inner-method(0,0,0,0) 0%, arg2, 10%)");

  var result = _values.default.parse(cursor);
};

exports["Css: spaced values"] = function () {
  var cursor = new _index.Cursor("inner-method(0,0,0,0) inner-method(0,0,0,0) 0px 10px 0%");

  var result = _values.default.parse(cursor);
};
//# sourceMappingURL=CssPatterns.js.map