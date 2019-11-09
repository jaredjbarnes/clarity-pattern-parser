"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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

var ValuePatterns =
/*#__PURE__*/
function (_ValuePattern) {
  _inherits(ValuePatterns, _ValuePattern);

  function ValuePatterns(name, patterns) {
    var _this;

    _classCallCheck(this, ValuePatterns);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ValuePatterns).call(this));
    _this.name = name;
    _this.patterns = patterns;

    _this.assertArguments();

    _this.clonePatterns();

    return _this;
  }

  _createClass(ValuePatterns, [{
    key: "assertArguments",
    value: function assertArguments() {
      if (!Array.isArray(this.patterns)) {
        throw new Error("Invalid Arguments: The patterns argument need to be an array of ValuePatterns.");
      }

      var areAllPatterns = this.patterns.every(function (pattern) {
        return pattern instanceof _ValuePattern2.default;
      });

      if (!areAllPatterns) {
        throw new Error("Invalid Argument: All patterns need to be an instance of ValuePattern.");
      }

      if (this.patterns.length < 2) {
        throw new Error("Invalid Argument: OrValue needs to have more than one value pattern.");
      }

      if (typeof this.name !== "string") {
        throw new Error("Invalid Argument: OrValue needs to have a name that's a string.");
      }
    }
  }, {
    key: "clonePatterns",
    value: function clonePatterns() {
      // We need to clone the patterns so nested patterns can be parsed.
      this.patterns = this.patterns.map(function (pattern) {
        return pattern.clone();
      });
    }
  }, {
    key: "getType",
    value: function getType() {
      return "value";
    }
  }, {
    key: "getName",
    value: function getName() {
      return this.name;
    }
  }, {
    key: "getValue",
    value: function getValue() {
      return null;
    }
  }, {
    key: "getPatterns",
    value: function getPatterns() {
      return this.patterns;
    }
  }, {
    key: "clone",
    value: function clone() {
      throw new Error("Not Yet Implemented");
    }
  }]);

  return ValuePatterns;
}(_ValuePattern2.default);

exports.default = ValuePatterns;
//# sourceMappingURL=ValuePatterns.js.map