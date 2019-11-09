"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ValuePatterns2 = _interopRequireDefault(require("./ValuePatterns"));

var _ValueNode = _interopRequireDefault(require("../../ast/ValueNode"));

var _Cursor = _interopRequireDefault(require("../../Cursor.js"));

var _StackInformation = _interopRequireDefault(require("../StackInformation"));

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

var AndValue =
/*#__PURE__*/
function (_ValuePatterns) {
  _inherits(AndValue, _ValuePatterns);

  function AndValue(name, patterns) {
    var _this;

    _classCallCheck(this, AndValue);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(AndValue).call(this, name, patterns));

    _this.reset();

    return _this;
  }

  _createClass(AndValue, [{
    key: "reset",
    value: function reset(cursor) {
      this.cursor = null;
      this.index = 0;
      this.nodes = [];
      this.node = null;

      if (cursor != null) {
        this.cursor = cursor;
        this.mark = this.cursor.mark();
      }
    }
  }, {
    key: "parse",
    value: function parse(cursor) {
      this.reset(cursor);
      this.assertCursor();
      this.tryPattern();
      return this.node;
    }
  }, {
    key: "assertCursor",
    value: function assertCursor() {
      if (!(this.cursor instanceof _Cursor.default)) {
        throw new Error("Invalid Arguments: Expected a cursor.");
      }
    }
  }, {
    key: "tryPattern",
    value: function tryPattern() {
      while (true) {
        var pattern = this.patterns[this.index];

        try {
          this.nodes.push(pattern.parse(this.cursor));
        } catch (error) {
          error.stack.push(new _StackInformation.default(this.mark, this));
          throw error;
        }

        if (this.index + 1 < this.patterns.length) {
          var lastNode = this.nodes[this.nodes.length - 1];
          this.cursor.setIndex(lastNode.endIndex + 1);
          this.index++;
        } else {
          this.processValue();
          break;
        }
      }
    }
  }, {
    key: "processValue",
    value: function processValue() {
      var lastNode = this.nodes[this.nodes.length - 1];
      var startIndex = this.mark.index;
      var endIndex = lastNode.endIndex;
      var value = this.nodes.filter(function (node) {
        return node != null;
      }).map(function (node) {
        return node.value;
      }).join("");
      this.node = new _ValueNode.default(this.name, value, startIndex, endIndex);
    }
  }, {
    key: "clone",
    value: function clone() {
      return new AndValue(this.name, this.patterns);
    }
  }]);

  return AndValue;
}(_ValuePatterns2.default);

exports.default = AndValue;
//# sourceMappingURL=AndValue.js.map