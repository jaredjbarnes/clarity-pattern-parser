"use strict";

var _TextInspector = _interopRequireDefault(require("../TextInspector.js"));

var _sentence = _interopRequireDefault(require("./patterns/sentence.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["TextInspector: Partial Match"] = function () {
  var text = "Pat ";
  var textInspector = new _TextInspector.default();
  var inspection = textInspector.inspect(text, _sentence.default);

  _assert.default.equal(inspection.tokens.options);
};

exports["TextInspector: Partial Match, with error."] = function () {
  var text = "Pat wzoo";
  var textInspector = new _TextInspector.default();
  var inspection = textInspector.inspect(text, _sentence.default);
};

exports["TextInspector: No auto complete so fallback to search."] = function () {
  var text = "bank";
  var textInspector = new _TextInspector.default();
  var inspection = textInspector.inspect(text, _sentence.default);
};

exports["TextInspector: No auto complete so fallback to search with two token."] = function () {
  var text = "store bank";
  var textInspector = new _TextInspector.default();
  var inspection = textInspector.inspect(text, _sentence.default);
};

exports["TextInspector: Partial Half Match"] = function () {
  var text = "Pat wen";
  var textInspector = new _TextInspector.default();
  var inspection = textInspector.inspect(text, _sentence.default);
};

exports["TextInspector: Empty String"] = function () {
  var text = "";
  var textInspector = new _TextInspector.default();
  var inspection = textInspector.inspect(text, _sentence.default);
};

exports["TextInspector: No match with error."] = function () {
  var text = "Jared left ";
  var textInspector = new _TextInspector.default();
  var inspection = textInspector.inspect(text, _sentence.default);
};

exports["TextInspector: Complete Match."] = function () {
  var text = "Pat went to a big store";
  var textInspector = new _TextInspector.default();
  var inspection = textInspector.inspect(text, _sentence.default);
};

exports["TextInspector: static inspect."] = function () {
  var text = "Pat went to a big store";

  var inspection = _TextInspector.default.inspect(text, _sentence.default);
};
//# sourceMappingURL=TextInspector.js.map