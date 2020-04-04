"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _index = require("./index.js");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ParseInspector =
/*#__PURE__*/
function () {
  function ParseInspector() {
    _classCallCheck(this, ParseInspector);

    this.cursor = null;
    this.result = null;
    this.text = null;
    this.match = null;
    this.error = null;
    this.patternMatch = null;
    this.matchedText = "";
    this.rootPattern = null;
    this.possibilities = null;
  }

  _createClass(ParseInspector, [{
    key: "inspectParse",
    value: function inspectParse(text, pattern) {
      this.reset();
      this.text = text;
      this.rootPattern = pattern; // If no text all options are available.

      if (text.length === 0) {
        return {
          pattern: null,
          astNode: null,
          match: null,
          error: null,
          possibilities: {
            startIndex: 0,
            options: pattern.getPossibilities()
          },
          isComplete: false
        };
      }

      this.parse();
      this.saveMatchedText();
      this.saveMatch();
      this.saveError();
      this.savePossibilities();
      return {
        pattern: this.patternMatch.pattern,
        astNode: this.patternMatch.astNode,
        match: this.match,
        error: this.error,
        possibilities: this.possibilities,
        isComplete: this.cursor.didSuccessfullyParse()
      };
    }
  }, {
    key: "reset",
    value: function reset() {
      this.cursor = null;
      this.result = null;
      this.text = null;
      this.match = null;
      this.error = null;
      this.patternMatch = null;
      this.matchedText = "";
      this.rootPattern = null;
      this.possibilities = null;
    }
  }, {
    key: "parse",
    value: function parse() {
      this.rootPattern = this.rootPattern;
      this.cursor = new _index.Cursor(this.text);
      this.result = this.rootPattern.parse(this.cursor);
      this.patternMatch = this.cursor.lastMatch;
    }
  }, {
    key: "saveMatchedText",
    value: function saveMatchedText() {
      if (this.patternMatch.astNode != null) {
        this.matchedText = this.text.substring(0, this.patternMatch.astNode.endIndex + 1);
      }
    }
  }, {
    key: "saveMatch",
    value: function saveMatch() {
      var node = this.patternMatch.astNode;

      if (node == null) {
        this.match = null;
        return;
      }

      var endIndex = this.matchedText.length - 1;
      this.match = {
        text: this.matchedText,
        startIndex: 0,
        endIndex: endIndex
      };
    }
  }, {
    key: "saveError",
    value: function saveError() {
      if (this.patternMatch.astNode == null) {
        this.error = {
          startIndex: 0,
          endIndex: this.text.length - 1,
          text: this.text
        };
        return this;
      }

      if (this.text.length > this.matchedText.length) {
        var difference = this.text.length - this.matchedText.length;
        var startIndex = this.patternMatch.astNode.endIndex + 1;
        var endIndex = startIndex + difference - 1;
        this.error = {
          startIndex: startIndex,
          endIndex: endIndex,
          text: this.text.substring(startIndex, endIndex + 1)
        };
        return;
      } else {
        this.error = null;
        return;
      }
    }
  }, {
    key: "savePossibilities",
    value: function savePossibilities() {
      if (this.patternMatch.pattern === this.rootPattern && this.cursor.didSuccessfullyParse()) {
        this.possibilities = null;
        return;
      }

      if (this.patternMatch.astNode == null) {
        var _options = this.rootPattern.getPossibilities();

        var parts = this.text.split(" ").filter(function (part) {
          return part.length > 0;
        });
        _options = _options.filter(function (option) {
          return parts.some(function (part) {
            return option.indexOf(part) > -1;
          });
        });

        if (_options.length === 0) {
          this.possibilities = null;
          return;
        }

        this.possibilities = {
          startIndex: 0,
          options: _options
        };
        return;
      }

      var pattern = this.patternMatch.pattern;
      var parentPattern = pattern.parent;
      var index = parentPattern.children.indexOf(pattern);
      var parentClone = parentPattern.clone();
      parentClone.children = parentClone.children.slice(index + 1);
      var options = parentClone.getPossibilities();
      var startIndex = this.matchedText.length;

      if (this.matchedText.length < this.text.length) {
        var leftOver = this.text.substring(this.matchedText.length);
        var partialMatchOptions = options.filter(function (option) {
          return option.indexOf(leftOver) === 0;
        }).map(function (option) {
          return option.substring(leftOver.length);
        });

        if (partialMatchOptions.length === 0) {
          this.possibilities = null;
          return;
        } else {
          this.match = _objectSpread({}, this.match, {
            text: this.match.text + leftOver,
            endIndex: this.match.endIndex + leftOver.length
          });
          this.error = null;
          this.possibilities = {
            startIndex: this.match.endIndex + 1,
            options: partialMatchOptions
          };
          return;
        }
      }

      this.possibilities = {
        startIndex: startIndex,
        options: options
      };
    }
  }], [{
    key: "inspectParse",
    value: function inspectParse(text, pattern) {
      return new ParseInspector().inspectParse(text, pattern);
    }
  }]);

  return ParseInspector;
}();

exports.default = ParseInspector;
//# sourceMappingURL=ParseInspector.js.map