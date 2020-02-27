"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _CompositePattern2 = _interopRequireDefault(require("./CompositePattern.js"));

var _OptionalValue = _interopRequireDefault(require("../value/OptionalValue.js"));

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

var OrComposite =
/*#__PURE__*/
function (_CompositePattern) {
  _inherits(OrComposite, _CompositePattern);

  function OrComposite(name, patterns) {
    var _this;

    _classCallCheck(this, OrComposite);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(OrComposite).call(this, "or-composite", name, patterns));

    _this._assertArguments();

    return _this;
  }

  _createClass(OrComposite, [{
    key: "_assertArguments",
    value: function _assertArguments() {
      if (this._children.length < 2) {
        throw new Error("Invalid Argument: OrValue needs to have more than one value pattern.");
      }

      var hasOptionalChildren = this._children.some(function (pattern) {
        return pattern instanceof _OptionalValue.default || pattern instanceof _OptionalComposite.default;
      });

      if (hasOptionalChildren) {
        throw new Error("OrComposite cannot have optional values.");
      }
    }
  }, {
    key: "_reset",
    value: function _reset(cursor) {
      this.cursor = null;
      this.mark = null;
      this.index = 0;
      this.node = null;

      if (cursor != null) {
        this.cursor = cursor;
        this.mark = cursor.mark();
      }
    }
  }, {
    key: "parse",
    value: function parse(cursor) {
      this._reset(cursor);

      this._tryPattern();

      if (this.node != null) {
        this.cursor.addMatch(this, this.node);
      }

      return this.node;
    }
  }, {
    key: "_tryPattern",
    value: function _tryPattern() {
      while (true) {
        var pattern = this._children[this.index];
        this.node = pattern.parse(this.cursor);

        if (this.cursor.hasUnresolvedError()) {
          if (this.index + 1 < this._children.length) {
            this.cursor.resolveError();
            this.index++;
            this.cursor.moveToMark(this.mark);
          } else {
            this.node = null;
            break;
          }
        } else {
          this.cursor.index = this.node.endIndex;
          break;
        }
      }
    }
  }, {
    key: "clone",
    value: function clone(name) {
      if (typeof name !== "string") {
        name = this.name;
      }

      return new OrComposite(name, this._children);
    }
  }, {
    key: "getCurrentMark",
    value: function getCurrentMark() {
      return this.mark;
    }
  }, {
    key: "getPossibilities",
    value: function getPossibilities() {
      return this.children.map(function (child) {
        return child.getPossibilities();
      }).reduce(function (acc, value) {
        return acc.concat(value);
      }, []);
    }
  }]);

  return OrComposite;
}(_CompositePattern2.default);

exports.default = OrComposite;
//# sourceMappingURL=OrComposite.js.map