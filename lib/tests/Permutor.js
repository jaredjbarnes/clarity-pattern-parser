"use strict";

var _Permutor = _interopRequireDefault(require("../Permutor.js"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports["Permutor: simple."] = function () {
  var permutor = new _Permutor.default();
  var array = [[0, 1], [0, 1], [0, 1]];
  var result = permutor.permute(array);

  _assert.default.equal(result.join(","), "000,001,010,011,100,101,110,111");
};

exports["Permutor: larger."] = function () {
  var permutor = new _Permutor.default();
  var array = [[0, 1, 2], [0, 1], [0, 1, 2, 3]];
  var result = permutor.permute(array);

  _assert.default.equal(result.join(","), "000,001,002,003,010,011,012,013,100,101,102,103,110,111,112,113,200,201,202,203,210,211,212,213");
};
//# sourceMappingURL=Permutor.js.map