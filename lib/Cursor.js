"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Mark = _interopRequireDefault(require("./Mark"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Cursor =
/*#__PURE__*/
function () {
  function Cursor(string) {
    _classCallCheck(this, Cursor);

    this.string = string;
    this.index = 0;
    this.length = string.length;
    this.assertValidity();
  }

  _createClass(Cursor, [{
    key: "assertValidity",
    value: function assertValidity() {
      if (this.isNullOrEmpty(this.string)) {
        throw new Error("Illegal Argument: Cursor needs to have a string that has a length greater than 0.");
      }
    }
  }, {
    key: "isNullOrEmpty",
    value: function isNullOrEmpty(value) {
      return value == null || typeof value === "string" && value.length === 0;
    }
  }, {
    key: "hasNext",
    value: function hasNext() {
      return this.index + 1 < this.string.length;
    }
  }, {
    key: "hasPrevious",
    value: function hasPrevious() {
      return this.index - 1 >= 0;
    }
  }, {
    key: "next",
    value: function next() {
      if (this.hasNext()) {
        this.index++;
      } else {
        throw new Error("Cursor: Out of Bounds Exception.");
      }
    }
  }, {
    key: "previous",
    value: function previous() {
      if (this.hasPrevious()) {
        this.index--;
      } else {
        throw new Error("Cursor: Out of Bounds Exception.");
      }
    }
  }, {
    key: "mark",
    value: function mark() {
      return new _Mark.default(this, this.index);
    }
  }, {
    key: "moveToMark",
    value: function moveToMark(mark) {
      if (mark instanceof _Mark.default && mark.cursor === this) {
        this.index = mark.index;
        return true;
      } else {
        throw new Error("Illegal Argument: The mark needs to be an instance of Mark and created by this cursor.");
      }
    }
  }, {
    key: "moveToBeginning",
    value: function moveToBeginning() {
      this.index = 0;
    }
  }, {
    key: "moveToLast",
    value: function moveToLast() {
      this.index = this.string.length - 1;
    }
  }, {
    key: "getChar",
    value: function getChar() {
      return this.string.charAt(this.index);
    }
  }, {
    key: "getIndex",
    value: function getIndex() {
      return this.index;
    }
  }, {
    key: "setIndex",
    value: function setIndex(index) {
      if (typeof index === "number") {
        if (index < 0 || index > this.lastIndex()) {
          throw new Error("Cursor: Out of Bounds Exception.");
        }

        this.index = index;
      }
    }
  }, {
    key: "isAtBeginning",
    value: function isAtBeginning() {
      return this.index === 0;
    }
  }, {
    key: "isAtEnd",
    value: function isAtEnd() {
      return this.index === this.string.length - 1;
    }
  }, {
    key: "lastIndex",
    value: function lastIndex() {
      return this.length - 1;
    }
  }]);

  return Cursor;
}();

exports.default = Cursor;
//# sourceMappingURL=Cursor.js.map