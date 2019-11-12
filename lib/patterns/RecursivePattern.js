"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Pattern2 = _interopRequireDefault(require("./Pattern.js"));

var _ParseError = _interopRequireDefault(require("./ParseError.js"));

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

var RecursivePattern =
/*#__PURE__*/
function (_Pattern) {
  _inherits(RecursivePattern, _Pattern);

  function RecursivePattern(name) {
    _classCallCheck(this, RecursivePattern);

    return _possibleConstructorReturn(this, _getPrototypeOf(RecursivePattern).call(this, name));
  }

  _createClass(RecursivePattern, [{
    key: "getPattern",
    value: function getPattern() {
      var _this = this;

      return this._climb(this.parent, function (pattern) {
        return pattern.name === _this.name;
      });
    }
  }, {
    key: "_climb",
    value: function _climb(pattern, isMatch) {
      if (isMatch(pattern)) {
        return pattern;
      } else {
        if (pattern.parent != null) {
          return this._climb(pattern.parent, isMatch);
        }

        return null;
      }
    }
  }, {
    key: "parse",
    value: function parse(cursor) {
      var pattern = this.getPattern();

      if (pattern == null) {
        throw new _ParseError.default("Couldn't find parent pattern to recursively parse, with the name ".concat(this.name, "."));
      }

      var clonedPattern = pattern.clone();
      clonedPattern.parent = this;
      return clonedPattern.parse(cursor);
    }
  }, {
    key: "clone",
    value: function clone() {
      return new RecursivePattern(this.name);
    }
  }]);

  return RecursivePattern;
}(_Pattern2.default);

exports.default = RecursivePattern;
//# sourceMappingURL=RecursivePattern.js.map