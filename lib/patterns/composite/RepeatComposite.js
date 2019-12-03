"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _CompositePattern2 = _interopRequireDefault(require("./CompositePattern.js"));

var _CompositeNode = _interopRequireDefault(require("../../ast/CompositeNode.js"));

var _ParseError = _interopRequireDefault(require("../ParseError.js"));

var _OptionalComposite = _interopRequireDefault(require("./OptionalComposite.js"));

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

var RepeatComposite =
/*#__PURE__*/
function (_CompositePattern) {
  _inherits(RepeatComposite, _CompositePattern);

  function RepeatComposite(name, pattern, divider) {
    var _this;

    _classCallCheck(this, RepeatComposite);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(RepeatComposite).call(this, name, divider != null ? [pattern, divider] : [pattern]));
    _this._pattern = _this.children[0];
    _this._divider = _this.children[1];

    _this._assertArguments();

    return _this;
  }

  _createClass(RepeatComposite, [{
    key: "_assertArguments",
    value: function _assertArguments() {
      if (this._pattern instanceof _OptionalComposite.default) {
        throw new Error("Invalid Arguments: The pattern cannot be a optional pattern.");
      }
    }
  }, {
    key: "_reset",
    value: function _reset(cursor) {
      this.nodes = [];
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
        var node = this._pattern.parse(this.cursor);

        if (this.cursor.hasUnresolvedError()) {
          this._processMatch();

          break;
        } else {
          this.nodes.push(node);
          this.cursor.next();

          if (this._divider != null) {
            var mark = this.cursor.mark();

            var _node = this._divider.parse(this.cursor);

            if (this.cursor.hasUnresolvedError()) {
              this.cursor.moveToMark(mark);

              this._processMatch();

              break;
            } else {
              this.nodes.push(_node);
              this.cursor.next();
            }
          }
        }
      }
    }
  }, {
    key: "_processMatch",
    value: function _processMatch() {
      this.cursor.resolveError();

      if (this.nodes.length === 0) {
        this.cursor.throwError(new _ParseError.default("Did not find a repeating match of ".concat(this.name, "."), this.mark.index, this));
        this.node = null;
      } else {
        this.node = new _CompositeNode.default(this.name, this.nodes[0].startIndex, this.nodes[this.nodes.length - 1].endIndex);
        this.node.children = this.nodes;
        this.cursor.setIndex(this.node.endIndex);
      }
    }
  }, {
    key: "clone",
    value: function clone(name) {
      if (typeof name !== "string") {
        name = this.name;
      }

      return new RepeatComposite(name, this._pattern, this._divider);
    }
  }, {
    key: "getCurrentMark",
    value: function getCurrentMark() {
      return this.mark;
    }
  }]);

  return RepeatComposite;
}(_CompositePattern2.default);

exports.default = RepeatComposite;
//# sourceMappingURL=RepeatComposite.js.map