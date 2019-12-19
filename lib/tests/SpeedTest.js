"use strict";

var _unit = _interopRequireDefault(require("./javascriptPatterns/unit.js"));

var _Cursor = _interopRequireDefault(require("../Cursor.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var unitRegex = /(\\d*\\.?\\d+)\\s?(px|em|ex|%|in|cn|mm|pt|pc+)/gim;

exports["SpeedTest: unit"] = function () {
  var simpleUnit = "12px";
  var cursor = new _Cursor.default(simpleUnit);
  var regexBeginTime = Date.now();

  for (var x = 0; x < 100000; x++) {
    unitRegex.lastIndex = 0;
    var result = unitRegex.exec(simpleUnit);
  }

  var RegexEndTime = Date.now();
  var regexDuration = RegexEndTime - regexBeginTime;
  var cpBeginTime = Date.now();

  for (var _x = 0; _x < 100000; _x++) {
    cursor.index = 0;

    var _result = _unit.default.parse(cursor);
  }

  var cpEndTime = Date.now();
  var cpDuration = cpEndTime - cpBeginTime;
  console.log(regexDuration, cpDuration);
};
//# sourceMappingURL=SpeedTest.js.map