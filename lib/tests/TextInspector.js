"use strict";

var _TextInspector = _interopRequireDefault(require("../TextInspector.js"));

var _sentence = _interopRequireDefault(require("./patterns/sentence.js"));

var _assert = _interopRequireDefault(require("assert"));

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _AndValue = _interopRequireDefault(require("../patterns/value/AndValue.js"));

var _OrValue = _interopRequireDefault(require("../patterns/value/OrValue.js"));

var _json = _interopRequireDefault(require("./javascriptPatterns/json.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["TextInspector: Partial Match"] = function () {
  var text = "Pat ";
  var textInspector = new _TextInspector.default();
  var inspection = textInspector.inspect(text, _sentence.default);

  _assert.default.equal(inspection.tokens.options.length, 2);

  _assert.default.equal(inspection.tokens.startIndex, 4);

  _assert.default.equal(inspection.match.text, "Pat ");

  _assert.default.equal(inspection.error, null);

  _assert.default.equal(inspection.isComplete, false);
};

exports["TextInspector: Partial Match, with error."] = function () {
  var text = "Pat wzoo";
  var textInspector = new _TextInspector.default();
  var inspection = textInspector.inspect(text, _sentence.default);

  _assert.default.equal(inspection.error.startIndex, 4);

  _assert.default.equal(inspection.error.endIndex, 7);

  _assert.default.equal(inspection.error.text, "wzoo");

  _assert.default.equal(inspection.match.startIndex, 0);

  _assert.default.equal(inspection.match.endIndex, 3);

  _assert.default.equal(inspection.match.text, "Pat ");

  _assert.default.equal(inspection.tokens, null);

  _assert.default.equal(inspection.isComplete, false);
};

exports["TextInspector: No auto complete so fallback to search."] = function () {
  var text = "bank";
  var textInspector = new _TextInspector.default();
  var inspection = textInspector.inspect(text, _sentence.default);

  _assert.default.equal(inspection.error.startIndex, 0);

  _assert.default.equal(inspection.error.endIndex, 3);

  _assert.default.equal(inspection.error.text, "bank");

  _assert.default.equal(inspection.tokens, null);

  _assert.default.equal(inspection.pattern, null);

  _assert.default.equal(inspection.match, null);

  _assert.default.equal(inspection.isComplete, false);
};

exports["TextInspector: No auto complete so fallback to search with two token."] = function () {
  var text = "store bank";
  var textInspector = new _TextInspector.default();
  var inspection = textInspector.inspect(text, _sentence.default);

  _assert.default.equal(inspection.error.startIndex, 0);

  _assert.default.equal(inspection.error.endIndex, 9);

  _assert.default.equal(inspection.error.text, "store bank");

  _assert.default.equal(inspection.tokens, null);

  _assert.default.equal(inspection.pattern, null);

  _assert.default.equal(inspection.match, null);

  _assert.default.equal(inspection.isComplete, false);
};

exports["TextInspector: Partial Half Match"] = function () {
  var text = "Pat wen";
  var textInspector = new _TextInspector.default();
  var inspection = textInspector.inspect(text, _sentence.default);

  _assert.default.equal(inspection.match.startIndex, 0);

  _assert.default.equal(inspection.match.endIndex, 6);

  _assert.default.equal(inspection.match.text, "Pat wen");

  _assert.default.equal(inspection.tokens.options.length, 1);

  _assert.default.equal(inspection.tokens.options[0], "t to");

  _assert.default.equal(inspection.isComplete, false);

  _assert.default.equal(inspection.error, null);
};

exports["TextInspector: Empty String"] = function () {
  var text = "";
  var textInspector = new _TextInspector.default();
  var inspection = textInspector.inspect(text, _sentence.default);

  _assert.default.equal(inspection.error, null);

  _assert.default.equal(inspection.tokens.options.length, 2);

  _assert.default.equal(inspection.tokens.options[0], "Pat");

  _assert.default.equal(inspection.tokens.options[1], "Dan");

  _assert.default.equal(inspection.pattern, null);

  _assert.default.equal(inspection.match, null);

  _assert.default.equal(inspection.isComplete, false);
};

exports["TextInspector: Complete Match."] = function () {
  var text = "Pat went to a big store";
  var textInspector = new _TextInspector.default();
  var inspection = textInspector.inspect(text, _sentence.default);

  _assert.default.equal(inspection.error, null);

  _assert.default.equal(inspection.tokens, null);

  _assert.default.equal(inspection.match.startIndex, 0);

  _assert.default.equal(inspection.match.endIndex, 22);

  _assert.default.equal(inspection.match.text, "Pat went to a big store");

  _assert.default.equal(inspection.isComplete, true);
};

exports["TextInspector: static inspect."] = function () {
  var text = "Pat went to a big store";

  var inspection = _TextInspector.default.inspect(text, _sentence.default);

  _assert.default.equal(inspection.error, null);

  _assert.default.equal(inspection.tokens, null);

  _assert.default.equal(inspection.match.startIndex, 0);

  _assert.default.equal(inspection.match.endIndex, 22);

  _assert.default.equal(inspection.match.text, "Pat went to a big store");

  _assert.default.equal(inspection.isComplete, true);
};

exports["TextInspector: static inspect."] = function () {
  var show = new _Literal.default("show", "Show");
  var me = new _Literal.default("me", "me");
  var theMoney = new _Literal.default("the-money", "the money");
  var yourLicense = new _Literal.default("your-license", "your license");
  var space = new _Literal.default("space", " ");
  var first = new _AndValue.default("first", [show, space, me, space, theMoney]);
  var second = new _AndValue.default("second", [show, space, me, space, yourLicense]);
  var either = new _OrValue.default("either", [first, second]);

  var inspection = _TextInspector.default.inspect("Show me ", either);

  _assert.default.equal(inspection.error, null);

  _assert.default.equal(inspection.tokens.startIndex, 8);

  _assert.default.equal(inspection.tokens.options.length, 2);

  _assert.default.equal(inspection.tokens.options[0], "the money");

  _assert.default.equal(inspection.tokens.options[1], "your license");

  _assert.default.equal(inspection.match.startIndex, 0);

  _assert.default.equal(inspection.match.endIndex, 7);

  _assert.default.equal(inspection.match.text, "Show me ");

  _assert.default.equal(inspection.isComplete, false);
};

exports["TextInspector: json inspect."] = function () {
  var inspection = _TextInspector.default.inspect("{", _json.default);

  inspection = _TextInspector.default.inspect("{\"blah\":", _json.default);

  _assert.default.equal(inspection.error, null);

  _assert.default.equal(inspection.tokens.startIndex, 8);

  _assert.default.equal(inspection.tokens.options.length, 9);

  _assert.default.equal(inspection.tokens.options[0], " ");

  _assert.default.equal(inspection.tokens.options[1], "number");

  _assert.default.equal(inspection.tokens.options[2], "'");

  _assert.default.equal(inspection.tokens.options[3], "\"");

  _assert.default.equal(inspection.tokens.options[4], "true");

  _assert.default.equal(inspection.tokens.options[5], "false");

  _assert.default.equal(inspection.tokens.options[6], "null");

  _assert.default.equal(inspection.tokens.options[7], "{");

  _assert.default.equal(inspection.tokens.options[8], "[");

  _assert.default.equal(inspection.match.startIndex, 0);

  _assert.default.equal(inspection.match.endIndex, 7);

  _assert.default.equal(inspection.match.text, "{\"blah\":");

  _assert.default.equal(inspection.isComplete, false);

  inspection = _TextInspector.default.inspect("{\"blah\":{", _json.default);

  _assert.default.equal(inspection.error, null);

  _assert.default.equal(inspection.tokens.startIndex, 9);

  _assert.default.equal(inspection.tokens.options.length, 4);

  _assert.default.equal(inspection.tokens.options[0], " ");

  _assert.default.equal(inspection.tokens.options[1], "'");

  _assert.default.equal(inspection.tokens.options[2], "\"");

  _assert.default.equal(inspection.tokens.options[3], "}");

  _assert.default.equal(inspection.match.startIndex, 0);

  _assert.default.equal(inspection.match.endIndex, 8);

  _assert.default.equal(inspection.match.text, "{\"blah\":{");

  _assert.default.equal(inspection.isComplete, false);

  inspection = _TextInspector.default.inspect("{\"blah\":0.9", _json.default);

  _assert.default.equal(inspection.error, null);

  _assert.default.equal(inspection.tokens.startIndex, 11);

  _assert.default.equal(inspection.tokens.options.length, 3);

  _assert.default.equal(inspection.tokens.options[0], " ");

  _assert.default.equal(inspection.tokens.options[1], ",");

  _assert.default.equal(inspection.tokens.options[2], "}");

  _assert.default.equal(inspection.match.startIndex, 0);

  _assert.default.equal(inspection.match.endIndex, 10);

  _assert.default.equal(inspection.match.text, "{\"blah\":0.9");

  _assert.default.equal(inspection.isComplete, false);
};
//# sourceMappingURL=TextInspector.js.map