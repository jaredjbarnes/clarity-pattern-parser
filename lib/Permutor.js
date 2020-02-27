"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Permutor =
/*#__PURE__*/
function () {
  function Permutor() {
    _classCallCheck(this, Permutor);

    this.array = [];
    this.positionToOptions = null;
  }

  _createClass(Permutor, [{
    key: "permute",
    value: function permute(array) {
      this.array = array;
      this.createPositionMap();
      return this.getPermutations();
    }
  }, {
    key: "getPermutations",
    value: function getPermutations() {
      var _this = this;

      return this.array[0].reduce(function (acc, value, index) {
        return acc.concat(_this.getOptions(0, index));
      }, []);
    }
  }, {
    key: "getKey",
    value: function getKey(x, y) {
      return "".concat(x, "|").concat(y);
    }
  }, {
    key: "createPositionMap",
    value: function createPositionMap() {
      var _this2 = this;

      this.positionToOptions = {};

      for (var x = this.array.length - 1; x >= 0; x--) {
        var _loop = function _loop(y) {
          var yValue = _this2.array[x][y];
          var nextX = x + 1;

          if (_this2.array[nextX] != null) {
            var options = _this2.array[nextX];
            var value = options.map(function (option, index) {
              var permutations = _this2.getOptions(nextX, index);

              return permutations.map(function (option) {
                return "".concat(yValue).concat(option);
              });
            }).reduce(function (acc, value) {
              return acc.concat(value);
            }, []);

            _this2.setOptions(x, y, value);
          } else {
            _this2.setOptions(x, y, [yValue]);
          }
        };

        for (var y = 0; y < this.array[x].length; y++) {
          _loop(y);
        }
      }
    }
  }, {
    key: "getOptions",
    value: function getOptions(x, y) {
      return this.positionToOptions[this.getKey(x, y)];
    }
  }, {
    key: "setOptions",
    value: function setOptions(x, y, value) {
      this.positionToOptions[this.getKey(x, y)] = value;
    }
  }]);

  return Permutor;
}();

exports.default = Permutor;
//# sourceMappingURL=Permutor.js.map