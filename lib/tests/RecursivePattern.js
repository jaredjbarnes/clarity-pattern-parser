"use strict";

var _assert = _interopRequireDefault(require("assert"));

var _index = require("../index.js");

var _json = _interopRequireDefault(require("./javascriptPatterns/json.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["RecursivePattern: JSON"] = function () {
  var json = JSON.stringify({
    string: "This is a string.",
    number: 1,
    boolean: true,
    json: {
      string: "This is a nested string."
    },
    null: null,
    array: [1, "Blah", {
      prop1: true
    }]
  });
  var cursor = new _index.Cursor(json);
  var cursor2 = new _index.Cursor(JSON.stringify([{
    foo: "bar"
  }]));

  var object = _json.default.parse(cursor);

  var array = _json.default.parse(cursor2);

  _assert.default.equal(object.name, "object-literal");

  _assert.default.equal(array.name, "array-literal");

  _assert.default.equal(object.toString(), json);
};

exports["RecursivePattern: No pattern"] = function () {
  var node = new _index.RecursivePattern("nothing");
  var result = node.exec("Some string.");

  _assert.default.equal(result, null);
};

exports["RecursivePattern: clone."] = function () {
  var node = new _index.RecursivePattern("nothing");
  var clone = node.clone();

  _assert.default.equal(node.name, clone.name);

  var otherClone = node.clone("nothing2");

  _assert.default.equal(otherClone.name, "nothing2");
};

exports["RecursivePattern: getNextTokens."] = function () {
  var tokens = _json.default.getTokens();

  tokens = _json.default.children[0].getNextTokens();
  tokens = _json.default.children[4].getTokens();
  tokens = _json.default.children[4].children[1].getNextTokens();
  tokens = _json.default.children[4].children[2].getNextTokens();
  tokens = _json.default.children[4].children[2].children[0].children[0].children[0].children[0].getTokens();
  tokens = _json.default.children[4].children[2].children[0].children[0].getNextTokens();
  tokens = _json.default.children[4].children[3].getNextTokens();
};

exports["RecursivePattern: getPossibilities."] = function () {
  var possibilities = _json.default.getPossibilities();
};
//# sourceMappingURL=RecursivePattern.js.map