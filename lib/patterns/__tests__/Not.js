"use strict";

var _Not = _interopRequireDefault(require("../Not.js"));

var _Cursor = _interopRequireDefault(require("../../Cursor.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe("Not", () => {
  test("Zero characters, should throw.", () => {
    expect(() => {
      const cursor = new _Cursor.default("");
    }).toThrow();
  });
  test("Parse twice with same parser.", () => {
    const cursor = new _Cursor.default("1");
    const not = new _Not.default("not-two", "2");
    const node = not.parse(cursor);
    cursor.moveToBeginning();
    const node2 = not.parse(cursor);
    expect(node.value).toBe("1");
    expect(node.type).toBe("not-two");
    expect(node2.value).toBe("1");
    expect(node2.type).toBe("not-two");
  });
  test("One character, Exact.", () => {
    const cursor = new _Cursor.default("1");
    const not = new _Not.default("not-two", "2");
    const node = not.parse(cursor);
    expect(node.value).toBe("1");
    expect(node.type).toBe("not-two");
  });
  test("Two characters, Exact.", () => {
    const cursor = new _Cursor.default("10");
    const not = new _Not.default("not-twenty", "20");
    const node = not.parse(cursor);
    expect(node.value).toBe("10");
    expect(node.type).toBe("not-twenty");
  });
  test("One character, Within.", () => {
    const cursor = new _Cursor.default("12");
    const not = new _Not.default("not-two", "2");
    const node = not.parse(cursor);
    expect(node.value).toBe("1");
    expect(node.type).toBe("not-two");
    expect(cursor.getChar()).toBe("2");
  });
  test("Two characters, Within.", () => {
    const cursor = new _Cursor.default("1020");
    const not = new _Not.default("not-twenty", "20");
    const node = not.parse(cursor);
    expect(node.value).toBe("10");
    expect(node.type).toBe("not-twenty");
    expect(cursor.getChar()).toBe("2");
  });
});
//# sourceMappingURL=Not.js.map