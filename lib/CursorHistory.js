"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var CursorHistory =
/*#__PURE__*/
function () {
  function CursorHistory() {
    _classCallCheck(this, CursorHistory);

    this.isRecording = false;
    this.furthestMatch = {
      pattern: null,
      astNode: null
    };
    this.furthestError = null;
    this.patterns = [];
    this.astNodes = [];
    this.errors = [];
  }

  _createClass(CursorHistory, [{
    key: "addMatch",
    value: function addMatch(pattern, astNode) {
      if (this.isRecording) {
        this.patterns.push(pattern);
        this.astNodes.push(astNode);
      }

      if (this.furthestMatch.astNode == null || astNode.endIndex >= this.furthestMatch.astNode.endIndex) {
        this.furthestMatch.pattern = pattern;
        this.furthestMatch.astNode = astNode;
      }
    }
  }, {
    key: "addError",
    value: function addError(error) {
      if (this.isRecording) {
        this.errors.push(error);
      }

      if (this.furthestError == null || error.index >= this.furthestError.index) {
        this.furthestError = error;
      }
    }
  }, {
    key: "startRecording",
    value: function startRecording() {
      this.isRecording = true;
    }
  }, {
    key: "stopRecording",
    value: function stopRecording() {
      this.isRecording = false;
      this.clear();
    }
  }, {
    key: "clear",
    value: function clear() {
      this.patterns.length = 0;
      this.astNodes.length = 0;
      this.errors.length = 0;
    }
  }, {
    key: "getFurthestError",
    value: function getFurthestError() {
      return this.furthestError;
    }
  }, {
    key: "getFurthestMatch",
    value: function getFurthestMatch() {
      return this.furthestMatch;
    }
  }, {
    key: "getLastMatch",
    value: function getLastMatch() {
      if (this.isRecording) {
        return {
          pattern: this.patterns[this.patterns.length - 1] || null,
          astNode: this.astNodes[this.astNodes.length - 1] || null
        };
      } else {
        return this.furthestMatch;
      }
    }
  }, {
    key: "getLastError",
    value: function getLastError() {
      return this.errors[this.errors.length - 1] || null;
    }
  }, {
    key: "getAllParseStacks",
    value: function getAllParseStacks() {
      var stacks = this.astNodes.reduce(function (acc, node) {
        var container = acc[acc.length - 1];

        if (node.startIndex === 0) {
          container = [];
          acc.push(container);
        }

        container.push(node);
        return acc;
      }, []); // There are times when the matching will fail and hit again on the same node.
      // This filters them out. 
      // We simply check to see if there is any overlap with the previous one,
      // and if there is we don't add it. This is why we move backwards.

      var cleanedStack = stacks.map(function (stack) {
        var cleanedStack = [];

        for (var x = stack.length - 1; x >= 0; x--) {
          var currentNode = stack[x];
          var previousNode = stack[x + 1];

          if (previousNode == null) {
            cleanedStack.unshift(currentNode);
          } else {
            var left = Math.max(currentNode.startIndex, previousNode.startIndex);
            var right = Math.min(currentNode.endIndex, previousNode.endIndex);
            var isOverlapping = left <= right;

            if (!isOverlapping) {
              cleanedStack.unshift(currentNode);
            }
          }
        }

        return cleanedStack;
      });
      return cleanedStack;
    }
  }, {
    key: "getLastParseStack",
    value: function getLastParseStack() {
      var stacks = this.getAllParseStacks();
      return stacks[stacks.length - 1] || [];
    }
  }]);

  return CursorHistory;
}();

exports.default = CursorHistory;
//# sourceMappingURL=CursorHistory.js.map