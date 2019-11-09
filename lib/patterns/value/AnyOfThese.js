"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ValuePattern2 = _interopRequireDefault(require("./ValuePattern.js"));

var _ParseError = _interopRequireDefault(require("../ParseError.js"));

var _ValueNode = _interopRequireDefault(require("../../ast/ValueNode.js"));

var _Cursor = _interopRequireDefault(require("../../Cursor.js"));

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

var AnyOfThese =
/*#__PURE__*/
function (_ValuePattern) {
  _inherits(AnyOfThese, _ValuePattern);

  function AnyOfThese(name, characters) {
    var _this;

    _classCallCheck(this, AnyOfThese);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(AnyOfThese).call(this));
    _this.name = name;
    _this.characters = characters;

    _this.reset();

    _this.assertArguments();

    return _this;
  }

  _createClass(AnyOfThese, [{
    key: "assertArguments",
    value: function assertArguments() {
      if (typeof this.name !== "string") {
        throw new Error("Invalid Arguments: The name needs to be a string.");
      }

      if (typeof this.characters !== "string") {
        throw new Error("Invalid Arguments: The characters argument needs to be a string of characters.");
      }

      if (this.characters.length < 1) {
        throw new Error("Invalid Arguments: The characters argument needs to be at least one character long.");
      }
    }
  }, {
    key: "getName",
    value: function getName() {
      return this.name;
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
    key: "reset",
    value: function reset(cursor) {
      if (cursor == null) {
        this.cursor = null;
        this.mark = null;
      } else {
        this.cursor = cursor;
        this.mark = this.cursor.mark();
      }

      this.node = null;
    }
  }, {
    key: "tryPattern",
    value: function tryPattern() {
      if (this.isMatch()) {
        var value = this.cursor.getChar();
        var index = this.cursor.getIndex();
        this.node = new _ValueNode.default(this.name, value, index, index);
        this.incrementCursor();
      } else {
        this.processError();
      }
    }
  }, {
    key: "isMatch",
    value: function isMatch() {
      return this.characters.indexOf(this.cursor.getChar()) > -1;
    }
  }, {
    key: "processError",
    value: function processError() {
      var message = "ParseError: Expected one of these characters, '".concat(this.characters, "' but found '").concat(this.cursor.getChar(), "' while parsing for '").concat(this.name, "'.");
      throw new _ParseError.default(message, this.cursor.getIndex(), this);
    }
  }, {
    key: "incrementCursor",
    value: function incrementCursor() {
      if (this.cursor.hasNext()) {
        this.cursor.next();
      }
    }
  }, {
    key: "clone",
    value: function clone() {
      return new AnyOfThese(this.name, this.characters);
    }
  }, {
    key: "getValue",
    value: function getValue() {
      return this.characters;
    }
  }]);

  return AnyOfThese;
}(_ValuePattern2.default);

exports.default = AnyOfThese;
//# sourceMappingURL=AnyOfThese.js.map