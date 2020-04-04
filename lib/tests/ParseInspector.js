"use strict";

var _ParseInspector = _interopRequireDefault(require("../ParseInspector.js"));

var _sentence = _interopRequireDefault(require("./patterns/sentence.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["ParseInspector: Partial Match"] = function () {
  var text = "Pat ";
  var parseInspector = new _ParseInspector.default();
  var inspection = parseInspector.inspectParse(text, _sentence.default);

  _assert.default.equal(inspection.match.text, "Pat ");

  _assert.default.equal(inspection.isComplete, false);

  _assert.default.equal(inspection.match.startIndex, 0);

  _assert.default.equal(inspection.match.endIndex, 3);

  _assert.default.equal(inspection.error, null);

  _assert.default.equal(inspection.possibilities.startIndex, 4);

  _assert.default.equal(inspection.possibilities.options.length, 16);
};

exports["ParseInspector: Partial Match, with error."] = function () {
  var text = "Pat wzoo";
  var parseInspector = new _ParseInspector.default();
  var inspection = parseInspector.inspectParse(text, _sentence.default);

  _assert.default.equal(inspection.possibilities, null);

  _assert.default.equal(inspection.match.startIndex, 0);

  _assert.default.equal(inspection.match.endIndex, 3);

  _assert.default.equal(inspection.error.startIndex, 4);

  _assert.default.equal(inspection.error.endIndex, 7);

  _assert.default.equal(inspection.astNode.name, "space");

  _assert.default.equal(inspection.pattern.name, "space");
};

exports["ParseInspector: No auto complete so fallback to search."] = function () {
  var text = "bank";
  var parseInspector = new _ParseInspector.default();
  var inspection = parseInspector.inspectParse(text, _sentence.default);

  _assert.default.equal(inspection.possibilities.options.length, 16);

  _assert.default.equal(inspection.match, null);

  _assert.default.equal(inspection.pattern, null);

  _assert.default.equal(inspection.error.startIndex, 0);

  _assert.default.equal(inspection.error.endIndex, 3);
};

exports["ParseInspector: No auto complete so fallback to search with two token."] = function () {
  var text = "store bank";
  var parseInspector = new _ParseInspector.default();
  var inspection = parseInspector.inspectParse(text, _sentence.default);

  _assert.default.equal(inspection.possibilities.options.length, 32);

  _assert.default.equal(inspection.match, null);

  _assert.default.equal(inspection.pattern, null);

  _assert.default.equal(inspection.error.startIndex, 0);

  _assert.default.equal(inspection.error.endIndex, 9);
};

exports["ParseInspector: Partial Half Match"] = function () {
  var text = "Pat wen";
  var parseInspector = new _ParseInspector.default();
  var inspection = parseInspector.inspectParse(text, _sentence.default);

  _assert.default.equal(inspection.match.text, "Pat wen");

  _assert.default.equal(inspection.isComplete, false);

  _assert.default.equal(inspection.match.startIndex, 0);

  _assert.default.equal(inspection.match.endIndex, 6);

  _assert.default.equal(inspection.error, null);

  _assert.default.equal(inspection.possibilities.startIndex, 7);

  _assert.default.equal(inspection.possibilities.options.length, 8);
};

exports["ParseInspector: Empty String"] = function () {
  var text = "";
  var parseInspector = new _ParseInspector.default();
  var inspection = parseInspector.inspectParse(text, _sentence.default);

  _assert.default.equal(inspection.match, null);

  _assert.default.equal(inspection.isComplete, false);

  _assert.default.equal(inspection.error, null);

  _assert.default.equal(inspection.possibilities.startIndex, 0);

  _assert.default.equal(inspection.possibilities.options.length, 32);
};

exports["ParseInspector: No match with error."] = function () {
  var text = "Jared left ";
  var parseInspector = new _ParseInspector.default();
  var inspection = parseInspector.inspectParse(text, _sentence.default);

  _assert.default.equal(inspection.match, null);

  _assert.default.equal(inspection.isComplete, false);

  _assert.default.equal(inspection.error.startIndex, 0);

  _assert.default.equal(inspection.error.endIndex, 10);

  _assert.default.equal(inspection.possibilities, null);
};

exports["ParseInspector: Complete Match."] = function () {
  var text = "Pat went to a big store";
  var parseInspector = new _ParseInspector.default();
  var inspection = parseInspector.inspectParse(text, _sentence.default);

  _assert.default.equal(inspection.match.text, "Pat went to a big store");

  _assert.default.equal(inspection.isComplete, true);

  _assert.default.equal(inspection.match.startIndex, 0);

  _assert.default.equal(inspection.match.endIndex, 22);

  _assert.default.equal(inspection.error, null);

  _assert.default.equal(inspection.possibilities, null);
};

exports["ParseInspector: static inspectParse."] = function () {
  var text = "Pat went to a big store";

  var inspection = _ParseInspector.default.inspectParse(text, _sentence.default);

  _assert.default.equal(inspection.match.text, "Pat went to a big store");

  _assert.default.equal(inspection.isComplete, true);

  _assert.default.equal(inspection.match.startIndex, 0);

  _assert.default.equal(inspection.match.endIndex, 22);

  _assert.default.equal(inspection.error, null);

  _assert.default.equal(inspection.possibilities, null);
};
//# sourceMappingURL=ParseInspector.js.map