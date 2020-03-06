"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Pattern =
/*#__PURE__*/
function () {
  function Pattern() {
    var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    _classCallCheck(this, Pattern);

    this._type = type;
    this._name = name;
    this._parent = null;

    this._assertName();

    this.children = children;
  }

  _createClass(Pattern, [{
    key: "_assertName",
    value: function _assertName() {
      if (typeof this.name !== "string") {
        throw new Error("Invalid Argument: Patterns needs to have a name that's a string.");
      }
    }
  }, {
    key: "parse",
    value: function parse() {
      throw new Error("Method Not Implemented");
    }
  }, {
    key: "exec",
    value: function exec(string) {
      var cursor = new _Cursor.default(string);
      var node = this.parse(cursor);

      if (cursor.didSuccessfullyParse()) {
        return node;
      } else {
        return null;
      }
    }
  }, {
    key: "test",
    value: function test(string) {
      return this.exec(string) != null;
    }
  }, {
    key: "_assertChildren",
    value: function _assertChildren() {// Empty, meant to be overridden by subclasses.
    }
  }, {
    key: "_cloneChildren",
    value: function _cloneChildren() {
      var _this = this;

      // We need to clone the patterns so nested patterns can be parsed.
      this._children = this._children.map(function (pattern) {
        if (!(pattern instanceof Pattern)) {
          throw new Error("The ".concat(_this.name, " pattern has an invalid child pattern."));
        }

        return pattern.clone();
      }); // We need to freeze the childen so they aren't modified.

      Object.freeze(this._children);
    }
  }, {
    key: "_assignAsParent",
    value: function _assignAsParent() {
      var _this2 = this;

      this._children.forEach(function (child) {
        return child.parent = _this2;
      });
    }
  }, {
    key: "clone",
    value: function clone() {
      throw new Error("Method Not Implemented");
    }
  }, {
    key: "getPossibilities",
    value: function getPossibilities() {
      throw new Error("Method Not Implemented");
    }
  }, {
    key: "name",
    get: function get() {
      return this._name;
    }
  }, {
    key: "type",
    get: function get() {
      return this._type;
    }
  }, {
    key: "parent",
    get: function get() {
      return this._parent;
    },
    set: function set(value) {
      if (value instanceof Pattern) {
        this._parent = value;
      }
    }
  }, {
    key: "children",
    get: function get() {
      return this._children;
    },
    set: function set(value) {
      this._children = value;

      this._cloneChildren();

      this._assertChildren();

      this._assignAsParent();
    }
  }]);

  return Pattern;
}();

exports.default = Pattern;
//# sourceMappingURL=Pattern.js.map