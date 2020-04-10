"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ValuePattern2 = _interopRequireDefault(require("./ValuePattern.js"));

var _ValueNode = _interopRequireDefault(require("../../ast/ValueNode.js"));

var _ParseError = _interopRequireDefault(require("../../patterns/ParseError.js"));

var _OptionalValue = _interopRequireDefault(require("./OptionalValue.js"));

var _Permutor = _interopRequireDefault(require("../../Permutor.js"));

var _Pattern = _interopRequireDefault(require("../Pattern.js"));

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

var permutor = new _Permutor.default();

var AndValue =
/*#__PURE__*/
function (_ValuePattern) {
  _inherits(AndValue, _ValuePattern);

  function AndValue(name, patterns) {
    var _this;

    _classCallCheck(this, AndValue);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(AndValue).call(this, "and-value", name, patterns));

    _this._assertArguments();

    return _this;
  }

  _createClass(AndValue, [{
    key: "_assertArguments",
    value: function _assertArguments() {
      if (this._children.length < 2) {
        throw new Error("Invalid Argument: AndValue needs to have more than one value pattern.");
      }
    }
  }, {
    key: "_reset",
    value: function _reset(cursor) {
      this.index = 0;
      this.nodes = [];
      this.node = null;
      this.cursor = cursor;
      this.mark = this.cursor.mark();
    }
  }, {
    key: "parse",
    value: function parse(cursor) {
      this._reset(cursor);

      this._tryPatterns();

      return this.node;
    }
  }, {
    key: "_tryPatterns",
    value: function _tryPatterns() {
      while (true) {
        var pattern = this._children[this.index];
        var node = pattern.parse(this.cursor);

        if (this.cursor.hasUnresolvedError()) {
          break;
        } else {
          this.nodes.push(node);
        }

        if (!this._next()) {
          this._processValue();

          break;
        }
      }
    }
  }, {
    key: "_next",
    value: function _next() {
      if (this._hasMorePatterns()) {
        if (this.cursor.hasNext()) {
          // If the last result was a failed optional, then don't increment the cursor.
          if (this.nodes[this.nodes.length - 1] != null) {
            this.cursor.next();
          }

          this.index++;
          return true;
        } else if (this.nodes[this.nodes.length - 1] == null) {
          this.index++;
          return true;
        }

        this._assertRestOfPatternsAreOptional();

        return false;
      } else {
        return false;
      }
    }
  }, {
    key: "_hasMorePatterns",
    value: function _hasMorePatterns() {
      return this.index + 1 < this._children.length;
    }
  }, {
    key: "_assertRestOfPatternsAreOptional",
    value: function _assertRestOfPatternsAreOptional() {
      var _this2 = this;

      var areTheRestOptional = this.children.every(function (pattern, index) {
        return index <= _this2.index || pattern instanceof _OptionalValue.default;
      });

      if (!areTheRestOptional) {
        var parseError = new _ParseError.default("Could not match ".concat(this.name, " before string ran out."), this.index, this);
        this.cursor.throwError(parseError);
      }
    }
  }, {
    key: "_processValue",
    value: function _processValue() {
      if (this.cursor.hasUnresolvedError()) {
        this.node = null;
      } else {
        this.nodes = this.nodes.filter(function (node) {
          return node != null;
        });
        var lastNode = this.nodes[this.nodes.length - 1];
        var startIndex = this.mark;
        var endIndex = lastNode.endIndex;
        var value = this.nodes.map(function (node) {
          return node.value;
        }).join("");
        this.node = new _ValueNode.default("and-value", this.name, value, startIndex, endIndex);
        this.cursor.index = this.node.endIndex;
        this.cursor.addMatch(this, this.node);
      }
    }
  }, {
    key: "clone",
    value: function clone(name) {
      if (typeof name !== "string") {
        name = this.name;
      }

      return new AndValue(name, this._children);
    }
  }, {
    key: "getPossibilities",
    value: function getPossibilities(rootPattern) {
      if (rootPattern == null || !(rootPattern instanceof _Pattern.default)) {
        rootPattern = this;
      }

      var possibilities = this.children.map(function (child) {
        return child.getPossibilities(rootPattern);
      });
      return permutor.permute(possibilities);
    }
  }, {
    key: "getTokens",
    value: function getTokens() {
      return this._children[0].getTokens();
    }
  }]);

  return AndValue;
}(_ValuePattern2.default);

exports.default = AndValue;
//# sourceMappingURL=AndValue.js.map