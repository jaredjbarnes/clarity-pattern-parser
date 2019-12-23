"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ParseError = _interopRequireDefault(require("../ParseError.js"));

var _Cursor = _interopRequireDefault(require("../../Cursor.js"));

var _ValueNode = _interopRequireDefault(require("../../ast/ValueNode.js"));

var _ValuePattern2 = _interopRequireDefault(require("./ValuePattern.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var RegexValue =
/*#__PURE__*/
function (_ValuePattern) {
  _inherits(RegexValue, _ValuePattern);

  function RegexValue(name, regex) {
    var _this;

    _classCallCheck(this, RegexValue);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(RegexValue).call(this, name));
    _this.regexString = regex;
    _this.regex = new RegExp("^".concat(regex), "g");

    _this._assertArguments();

    return _this;
  }

  _createClass(RegexValue, [{
    key: "_assertArguments",
    value: function _assertArguments() {
      if (typeof this.regexString !== "string") {
        throw new Error("Invalid Arguments: The regex argument needs to be a string of regex.");
      }

      if (this.regexString.length < 1) {
        throw new Error("Invalid Arguments: The regex string argument needs to be at least one character long.");
      }

      if (this.regexString.charAt(0) === "^") {
        throw new Error("Invalid Arguments: The regex string cannot start with a '^' because it is expected to be in the middle of a string.");
      }

      if (this.regexString.charAt(this.regexString.length - 1) === "$") {
        throw new Error("Invalid Arguments: The regex string cannot end with a '$' because it is expected to be in the middle of a string.");
      }
    }
  }, {
    key: "parse",
    value: function parse(cursor) {
      this._reset(cursor);

      this._tryPattern();

      return this.node;
    }
  }, {
    key: "_reset",
    value: function _reset(cursor) {
      this.cursor = cursor;
      this.regex.lastIndex = 0;
      this.substring = this.cursor.string.substr(this.cursor.getIndex());
      this.node = null;
    }
  }, {
    key: "_assertCursor",
    value: function _assertCursor() {
      if (!(this.cursor instanceof _Cursor.default)) {
        throw new Error("Invalid Arguments: Expected a cursor.");
      }
    }
  }, {
    key: "_tryPattern",
    value: function _tryPattern() {
      var result = this.regex.exec(this.substring);

      if (result != null) {
        var currentIndex = this.cursor.getIndex();
        var newIndex = currentIndex + result[0].length - 1;
        this.node = new _ValueNode.default(this.name, result[0], currentIndex, newIndex);
        this.cursor.setIndex(newIndex);
      } else {
        this._processError();
      }
    }
  }, {
    key: "_processError",
    value: function _processError() {
      var message = "ParseError: Expected regex pattern of '".concat(this.regexString, "' but found '").concat(this.substring, "'.");
      var parseError = new _ParseError.default(message, this.cursor.getIndex(), this);
      this.cursor.throwError(parseError);
    }
  }, {
    key: "clone",
    value: function clone(name) {
      if (typeof name !== "string") {
        name = this.name;
      }

      return new RegexValue(name, this.regexString);
    }
  }, {
    key: "getCurrentMark",
    value: function getCurrentMark() {
      return this.cursor.getIndex();
    }
  }]);

  return RegexValue;
}(_ValuePattern2.default);

exports.default = RegexValue;
//# sourceMappingURL=RegexValue.js.map