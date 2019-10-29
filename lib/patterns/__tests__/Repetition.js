"use strict";

var _Literal = _interopRequireDefault(require("../Literal.js"));

var _Cursor = _interopRequireDefault(require("../../Cursor.js"));

var _Repetition = _interopRequireDefault(require("../Repetition.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe("Repetition", () => {
  test("Repeat Literal twice.", () => {
    const cursor = new _Cursor.default("JohnJohn");
    const literal = new _Literal.default("name", "John");
    const repeatition = new _Repetition.default("stutter", literal);
    const node = repeatition.parse(cursor);
    expect(node.type).toBe("stutter");
    expect(node.children[0].type).toBe("name");
    expect(node.children[0].value).toBe("John");
    expect(node.children[1].type).toBe("name");
    expect(node.children[1].value).toBe("John");
  });
});
//# sourceMappingURL=Repetition.js.map