"use strict";

var _RepeatComposite = _interopRequireDefault(require("../patterns/composite/RepeatComposite.js"));

var _AndComposite = _interopRequireDefault(require("../patterns/composite/AndComposite.js"));

var _OptionalComposite = _interopRequireDefault(require("../patterns/composite/OptionalComposite.js"));

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["RepeatComposite: Cannot use optional patterns."] = function () {
  var firstName = new _Literal.default("John", "John");
  var lastName = new _Literal.default("Doe", "Doe");
  var andComposite = new _AndComposite.default("full-name", [firstName, lastName]);

  _assert.default.throws(function () {
    new _RepeatComposite.default("full-names", new _OptionalComposite.default(andComposite));
  });
};

exports["RepeatComposite: clone with custom name."] = function () {
  var firstName = new _Literal.default("John", "John");
  var lastName = new _Literal.default("Doe", "Doe");
  var andComposite = new _AndComposite.default("full-name", [firstName, lastName]);
  var fullnames = new _RepeatComposite.default("full-names", andComposite);
  var clone = fullnames.clone("full-names-2");

  _assert.default.equal(clone.name, "full-names-2");
};
//# sourceMappingURL=RepeatComposite.js.map