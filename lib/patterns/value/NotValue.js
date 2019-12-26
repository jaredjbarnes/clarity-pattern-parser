"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ValuePattern2 = _interopRequireDefault(require("./ValuePattern.js"));

var _ValueNode = _interopRequireDefault(require("../../ast/ValueNode.js"));

var _ParseError = _interopRequireDefault(require("../ParseError.js"));

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

var NotValue =
/*#__PURE__*/
function (_ValuePattern) {
  _inherits(NotValue, _ValuePattern);

  function NotValue(name, pattern) {
    var _this;

    _classCallCheck(this, NotValue);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(NotValue).call(this, name, [pattern]));

    _this._assertArguments();

    return _this;
  }

  _createClass(NotValue, [{
    key: "_assertArguments",
    value: function _assertArguments() {
      if (!(this.children[0] instanceof _ValuePattern2.default)) {
        throw new Error("Invalid Arguments: Expected the pattern to be a ValuePattern.");
      }

      if (typeof this.name !== "string") {
        throw new Error("Invalid Arguments: Expected name to be a string.");
      }
    }
  }, {
    key: "_reset",
    value: function _reset(cursor) {
      this.match = "";
      this.node = null;
      this.cursor = cursor;
      this.mark = this.cursor.mark();
    }
  }, {
    key: "parse",
    value: function parse(cursor) {
      this._reset(cursor);

      this._tryPattern();

      return this.node;
    }
  }, {
    key: "_tryPattern",
    value: function _tryPattern() {
      while (true) {
        var mark = this.cursor.mark();
        this.children[0].parse(this.cursor);

        if (this.cursor.hasUnresolvedError()) {
          this.cursor.resolveError();
          this.cursor.moveToMark(mark);
          this.match += this.cursor.getChar();
          break;
        } else {
          this.cursor.moveToMark(mark);
          break;
        }
      }

      this._processMatch();
    }
  }, {
    key: "_processMatch",
    value: function _processMatch() {
      if (this.match.length === 0) {
        var parseError = new _ParseError.default("Didn't find any characters that didn't match the ".concat(this.children[0].name, " pattern."), this.mark, this);
        this.cursor.throwError(parseError);
      } else {
        this.node = new _ValueNode.default(this.name, this.match, this.mark, this.mark);
        this.cursor.setIndex(this.node.endIndex);
      }
    }
  }, {
    key: "clone",
    value: function clone(name) {
      if (typeof name !== "string") {
        name = this.name;
      }

      return new NotValue(name, this.children[0]);
    }
  }, {
    key: "getCurrentMark",
    value: function getCurrentMark() {
      return this.mark;
    }
  }]);

  return NotValue;
}(_ValuePattern2.default);

exports.default = NotValue;
//# sourceMappingURL=NotValue.js.map