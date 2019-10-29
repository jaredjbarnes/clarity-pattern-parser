"use strict";

var _Literal = _interopRequireDefault(require("../Literal.js"));

var _Cursor = _interopRequireDefault(require("../../Cursor.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe("Literal", () => {
  test("Zero characters, should throw.", () => {
    expect(() => {
      const cursor = new _Cursor.default("");
    }).toThrow();
  });
  test("One character, Exact.", () => {
    const cursor = new _Cursor.default("2");
    const literal = new _Literal.default("two", "2");
    const node = literal.parse(cursor);
    expect(node.value).toBe("2");
    expect(node.type).toBe("two");
  });
  test("Two characters, Exact.", () => {
    const cursor = new _Cursor.default("20");
    const literal = new _Literal.default("twenty", "20");
    const node = literal.parse(cursor);
    expect(node.value).toBe("20");
    expect(node.type).toBe("twenty");
  });
  test("One character, Within.", () => {
    const cursor = new _Cursor.default("200");
    const literal = new _Literal.default("two", "2");
    const node = literal.parse(cursor);
    expect(node.value).toBe("2");
    expect(node.type).toBe("two");
    expect(cursor.getIndex()).toBe(1);
    expect(cursor.getChar()).toBe("0");
  });
  test("Two characters, Within.", () => {
    const cursor = new _Cursor.default("200");
    const literal = new _Literal.default("twenty", "20");
    const node = literal.parse(cursor);
    expect(node.value).toBe("20");
    expect(node.type).toBe("twenty");
    expect(cursor.getIndex()).toBe(2);
    expect(cursor.getChar()).toBe("0");
  });
});
//# sourceMappingURL=Literal.js.map