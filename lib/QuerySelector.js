"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Query =
/*#__PURE__*/
function () {
  function Query(node) {
    _classCallCheck(this, Query);

    this.node = node;
    this.context = [];
    this.selector = null;
  }

  _createClass(Query, [{
    key: "setRootNode",
    value: function setRootNode(node) {
      this.node = node;
    }
  }, {
    key: "walkDown",
    value: function walkDown() {}
  }, {
    key: "walkUp",
    value: function walkUp() {}
  }, {
    key: "select",
    value: function select(selector) {
      this.selector;
    }
  }, {
    key: "selectAll",
    value: function selectAll(selector) {}
  }]);

  return Query;
}();

exports.default = Query;
//# sourceMappingURL=QuerySelector.js.map