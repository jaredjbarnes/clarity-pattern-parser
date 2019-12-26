"use strict";

var _cssValue = _interopRequireDefault(require("./cssPatterns/cssValue.js"));

var _index = require("../index.js");

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Css: unit"] = function () {
  var cursor = new _index.Cursor("10% 10%");

  var result = _cssValue.default.parse(cursor);

  _assert.default.equal(result.endIndex, cursor.string.length - 1);
};

exports["Css: All known unit values spaced"] = function () {
  var cursor = new _index.Cursor("10 linear-gradient(to left, #333, #333 50%, #eee 75%, #333 75%) rgba(0,0,0,1) #333 #555555 0px 0% 0deg 1em radial-gradient(at 40% 40%, rgba(187,202,218,1) 0%, rgba(187,202,218,1) 20%, rgba(187,202,218,1) 100%)");

  var result = _cssValue.default.parse(cursor);

  _assert.default.equal(result.endIndex, cursor.string.length - 1);
};

exports["Css: radial-gradient"] = function () {
  var cursor = new _index.Cursor("radial-gradient(at 40% 40%, rgba(187,202,218,1) 0%, rgba(187,202,218,1) 20%, rgba(187,202,218,1) 100%)");

  var result = _cssValue.default.parse(cursor);

  _assert.default.equal(result.endIndex, cursor.string.length - 1);
};

exports["Css: rgba"] = function () {
  var cursor = new _index.Cursor("rgba(0,0,0,0)");

  var result = _cssValue.default.parse(cursor);

  _assert.default.equal(result.endIndex, cursor.string.length - 1);
};

exports["Css: method mutliple values"] = function () {
  var cursor = new _index.Cursor("method-one(first 0px third, arg2)");

  var result = _cssValue.default.parse(cursor);

  _assert.default.equal(result.endIndex, cursor.string.length - 1);
};

exports["Css: nested methods"] = function () {
  var cursor = new _index.Cursor("outer-method(inner-method(0), 0)");

  var result = _cssValue.default.parse(cursor);

  _assert.default.equal(result.endIndex, cursor.string.length - 1);
};

exports["Css: nested methods with trailing value"] = function () {
  var cursor = new _index.Cursor("outer-method(inner-method(0,0), 0)");

  var result = _cssValue.default.parse(cursor);

  _assert.default.equal(result.endIndex, cursor.string.length - 1);
};

exports["Css: spaced values"] = function () {
  var cursor = new _index.Cursor("method(arg1 0%, arg2, 10%) 0%");

  var result = _cssValue.default.parse(cursor);

  _assert.default.equal(result.endIndex, cursor.string.length - 1);
};

exports["Css: spaced values within method"] = function () {
  var cursor = new _index.Cursor("method(inner-method(0,0,0,0) 0%, arg2, 10%)");

  var result = _cssValue.default.parse(cursor);

  _assert.default.equal(result.endIndex, cursor.string.length - 1);
};

exports["Css: spaced values"] = function () {
  var cursor = new _index.Cursor("inner-method(0,0,0,0) inner-method(0,0,0,0) 0px 10px 0%");

  var result = _cssValue.default.parse(cursor);

  _assert.default.equal(result.endIndex, cursor.string.length - 1);
};

exports["Css: complex spaced values"] = function () {
  var cursor = new _index.Cursor("#222 linear-gradient(to left, #333, #333 50%, #eee 75%, #333 75%) linear-gradient(to bottom, #555, #555 50%, #eee 75%, #555 75%)");

  var result = _cssValue.default.parse(cursor);

  _assert.default.equal(result.endIndex, cursor.string.length - 1);
};

exports["Css: multiple linear gradients"] = function () {
  var cursor = new _index.Cursor("linear-gradient(to left, #333, #333 50%, #eee 75%, #333 75%), linear-gradient(to bottom, #555, #555 50%, #eee 75%, #555 75%)");

  var result = _cssValue.default.parse(cursor);

  _assert.default.equal(result.endIndex, cursor.string.length - 1);
};
//# sourceMappingURL=CssPatterns.js.map