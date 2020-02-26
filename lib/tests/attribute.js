"use strict";

var _attribute = _interopRequireDefault(require("../queryPatterns/attribute.js"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["attribute: valid"] = function () {
  var cursor = new _Cursor.default("[name]='value'");

  var result = _attribute.default.parse(cursor);

  _assert.default.equal(result.name, "attribute");

  _assert.default.equal(result.children[0].name, "name");

  _assert.default.equal(result.children[0].children[1].value, "name");

  _assert.default.equal(result.children[1].name, "equal");

  _assert.default.equal(result.children[2].name, "value");

  _assert.default.equal(result.children[2].children[1].value, "value");

  _assert.default.equal(cursor.didSuccessfullyParse(), true);
};

exports["attribute: invalid"] = function () {
  var cursor = new _Cursor.default("[name]]='value'");

  var result = _attribute.default.parse(cursor);

  _assert.default.equal(result, null);

  _assert.default.equal(cursor.didSuccessfullyParse(), false);
};

exports["attribute: escaped single quotes."] = function () {
  var cursor = new _Cursor.default("[name]='value''s'");

  var result = _attribute.default.parse(cursor);

  _assert.default.equal(result.name, "attribute");

  _assert.default.equal(result.children[0].name, "name");

  _assert.default.equal(result.children[0].children[1].value, "name");

  _assert.default.equal(result.children[1].name, "equal");

  _assert.default.equal(result.children[2].name, "value");

  _assert.default.equal(result.children[2].children[1].value, "value''s");

  _assert.default.equal(cursor.didSuccessfullyParse(), true);
};
//# sourceMappingURL=attribute.js.map