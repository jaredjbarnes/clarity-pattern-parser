"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var QueryMatcher =
/*#__PURE__*/
function () {
  function QueryMatcher() {
    _classCallCheck(this, QueryMatcher);

    this.selectorNode = null;
    this.rootNode = null;
    this.matchingNodes = [];
  }

  _createClass(QueryMatcher, [{
    key: "getMatches",
    value: function getMatches(selectorNode, rootNode) {
      this.selectorNode = selectorNode;
      this.rootNode = rootNode;
    }
  }, {
    key: "getAttributeMatches",
    value: function getAttributeMatches() {
      if (this.selectorNode.name === "attribute") {
        var name = this.selectorNode.children[0];
      }
    }
  }, {
    key: "getDescendantMatches",
    value: function getDescendantMatches() {}
  }, {
    key: "getDirectDescendantMatches",
    value: function getDirectDescendantMatches() {}
  }]);

  return QueryMatcher;
}();

exports.default = QueryMatcher;
//# sourceMappingURL=QueryMatcher.js.map