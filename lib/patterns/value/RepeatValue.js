"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ValuePattern2 = _interopRequireDefault(require("./ValuePattern.js"));

var _ValueNode = _interopRequireDefault(require("../../ast/ValueNode"));

var _ParseError = _interopRequireDefault(require("../ParseError.js"));

var _OptionalValue = _interopRequireDefault(require("./OptionalValue.js"));

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

var RepeatValue =
/*#__PURE__*/
function (_ValuePattern) {
  _inherits(RepeatValue, _ValuePattern);

  function RepeatValue(name, pattern) {
    var _this;

    _classCallCheck(this, RepeatValue);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(RepeatValue).call(this));
    _this.name = name;
    _this.pattern = pattern.clone();
    _this.patterns = [pattern];

    _this.assertArguments();

    _this.reset();

    return _this;
  }

  _createClass(RepeatValue, [{
    key: "assertArguments",
    value: function assertArguments() {
      if (!(this.pattern instanceof _ValuePattern2.default)) {
        throw new Error("Invalid Arguments: Expected the pattern to be a ValuePattern.");
      }

      if (this.pattern instanceof _OptionalValue.default) {
        throw new Error("Invalid Arguments: The pattern cannot be a optional pattern.");
      }

      if (typeof this.name !== "string") {
        throw new Error("Invalid Arguments: Expected name to be a string.");
      }
    }
  }, {
    key: "reset",
    value: function reset(cursor) {
      this.cursor = null;
      this.mark = null;
      this.nodes = [];

      if (cursor != null) {
        this.cursor = cursor;
        this.mark = this.cursor.mark();
      }
    }
  }, {
    key: "parse",
    value: function parse(cursor) {
      this.reset(cursor);
      this.tryPattern();
      return this.node;
    }
  }, {
    key: "tryPattern",
    value: function tryPattern() {
      while (true) {
        var mark = this.cursor.mark();

        try {
          var node = this.pattern.parse(this.cursor);
          this.nodes.push(node);

          if (node.endIndex === this.cursor.lastIndex()) {
            this.processMatch();
            break;
          }
        } catch (error) {
          this.processMatch();
          this.cursor.moveToMark(mark);
          break;
        }
      }
    }
  }, {
    key: "processMatch",
    value: function processMatch() {
      if (this.nodes.length === 0) {
        throw new _ParseError.default("Did not find a repeating match of ".concat(this.pattern.getName(), "."), this.mark.index, this);
      } else {
        var value = this.nodes.map(function (node) {
          return node.value;
        }).join("");
        this.node = new _ValueNode.default(this.name, value, this.nodes[0].startIndex, this.nodes[this.nodes.length - 1].endIndex);
      }
    }
  }, {
    key: "getName",
    value: function getName() {
      return this.name;
    }
  }, {
    key: "getPatterns",
    value: function getPatterns() {
      return this.patterns;
    }
  }, {
    key: "getValue",
    value: function getValue() {
      return null;
    }
  }, {
    key: "clone",
    value: function clone() {
      return new RepeatValue(this.name, this.pattern);
    }
  }]);

  return RepeatValue;
}(_ValuePattern2.default);

exports.default = RepeatValue;
//# sourceMappingURL=RepeatValue.js.map