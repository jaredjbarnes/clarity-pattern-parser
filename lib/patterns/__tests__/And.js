"use strict";

var _Literal = _interopRequireDefault(require("../Literal.js"));

var _Cursor = _interopRequireDefault(require("../../Cursor.js"));

var _And = _interopRequireDefault(require("../And.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe("And", () => {
  test("And Twice", () => {
    const cursor = new _Cursor.default("JohnDoe");
    const firstName = new _Literal.default("first-name", "John");
    const lastName = new _Literal.default("last-name", "Doe");
    const fullName = new _And.default("full-name", [firstName, lastName]);
    const node = fullName.parse(cursor);
    expect(node.type).toBe("full-name");
    expect(node.children[0].type).toBe("first-name");
    expect(node.children[0].value).toBe("John");
    expect(node.children[1].type).toBe("last-name");
    expect(node.children[1].value).toBe("Doe");
    expect(cursor.isAtEnd()).toBe(true);
  });
});
//# sourceMappingURL=And.js.map