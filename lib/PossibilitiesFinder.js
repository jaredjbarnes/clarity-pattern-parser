"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Cursor = _interopRequireDefault(require("./Cursor.js"));

var _Possibilities = _interopRequireDefault(require("./Possibilities"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var typeToMethodName = {
  "and-value": "buildAndValuePossibilites",
  "any-of-these": "buildAnyOfThesePossibilities",
  literal: "buildLiteralPossibilities",
  "not-value": "buildNotValuePossibilities",
  "optional-value": "buildOptionalValuePossibilities",
  "or-value": "buildOrValuePossibilities",
  "regex-value": "buildRegexValuePossibilities",
  "repeat-value": "buildRepeatValuePossibilities",
  "and-composite": "buildAndComposite",
  "or-composite": "buildOrComposite",
  "repeat-composite": "buildRepeatComposite",
  recursive: "buildRecursive"
};

var PossibilitiesFinder =
/*#__PURE__*/
function () {
  function PossibilitiesFinder() {
    _classCallCheck(this, PossibilitiesFinder);

    this.pattern = null;
    this.string = null;
    this.cursor = null;
    this.astResult = null;
    this.lastSuccessfulAst = null;
    this.lastSuccessfulPattern = null;
    this.options = [];
  }

  _createClass(PossibilitiesFinder, [{
    key: "findPossibilities",
    value: function findPossibilities(string, pattern) {
      this.cursor = new _Cursor.default(string);
      this.astResult = pattern.parse(cursor);
      this.lastSuccessfulAst = this.cursor.lastSuccessfulAst;
      this.lastSuccessfulPattern = this.cursor.lastSuccessfulPatternMatch;
      this.options = [];
      this.buildPossibilities();
    }
  }, {
    key: "getBuildMethod",
    value: function getBuildMethod(type) {
      var method = this[typeToMethodName[type]];

      if (typeof method !== "function") {
        throw new Error("Couldn't find builder type '".concat(type, "'."));
      }

      return method;
    }
  }, {
    key: "buildPossibilities",
    value: function buildPossibilities() {}
  }]);

  return PossibilitiesFinder;
}();

exports.default = PossibilitiesFinder;
//# sourceMappingURL=PossibilitiesFinder.js.map