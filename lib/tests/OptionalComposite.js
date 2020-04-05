"use strict";

var _OptionalComposite = _interopRequireDefault(require("../patterns/composite/OptionalComposite.js"));

var _Literal = _interopRequireDefault(require("../patterns/value/Literal.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["OptionalComposite: getPossibilities with no rootPattern supplied."] = function () {
  var literal = new _Literal.default("Jared", "Jared");
  var pattern = new _OptionalComposite.default(literal);
  var possibilities = pattern.getPossibilities();

  _assert.default.equal(possibilities.length, 1);

  _assert.default.equal(possibilities[0], "Jared");
};
//# sourceMappingURL=OptionalComposite.js.map