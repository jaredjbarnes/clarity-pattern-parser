import cssValue from "./cssPatterns/cssValue";
import { Cursor } from "../index";

describe("Css", () => {
  test("Css: unit", () => {
    const cursor = new Cursor("10% 10%");
    const result = cssValue.parse(cursor);

    expect(result?.endIndex).toBe(cursor.text.length - 1);
  });

  test("Css: All known unit values spaced", () => {
    const cursor = new Cursor(
      "10 linear-gradient(to left, #333, #333 50%, #eee 75%, #333 75%) rgba(0,0,0,1) #333 #555555 0px 0% 0deg 1em radial-gradient(at 40% 40%, rgba(187,202,218,1) 0%, rgba(187,202,218,1) 20%, rgba(187,202,218,1) 100%)"
    );
    const result = cssValue.parse(cursor);
    expect(result?.endIndex).toBe(cursor.text.length - 1);
    expect(cursor.text).toBe(result?.toString());
  });

  test("Css: radial-gradient", () => {
    const cursor = new Cursor(
      "radial-gradient(at 40% 40%, rgba(187,202,218,1) 0%, rgba(187,202,218,1) 20%, rgba(187,202,218,1) 100%)"
    );
    const result = cssValue.parse(cursor);
    expect(result?.endIndex).toBe(cursor.text.length - 1);
  });

  test("Css: rgba", () => {
    const cursor = new Cursor("rgba(0,0,0,0)");
    const result = cssValue.parse(cursor);
    expect(result?.endIndex).toBe(cursor.text.length - 1);
  });

  test("Css: method mutliple values", () => {
    const cursor = new Cursor("method-one(first 0px third, arg2)");
    const result = cssValue.parse(cursor);
    expect(result?.endIndex).toBe(cursor.text.length - 1);
  });

  test("Css: nested methods", () => {
    const cursor = new Cursor("outer-method(inner-method(0), 0)");
    const result = cssValue.parse(cursor);
    expect(result?.endIndex).toBe(cursor.text.length - 1);
  });

  test("Css: nested methods with trailing value", () => {
    const cursor = new Cursor("outer-method(inner-method(0,0), 0)");
    const result = cssValue.parse(cursor);
    expect(result?.endIndex).toBe(cursor.text.length - 1);
  });

  test("Css: spaced values in a method", () => {
    const cursor = new Cursor("method(arg1 0%, arg2, 10%) 0%");
    const result = cssValue.parse(cursor);
    expect(result?.endIndex).toBe(cursor.text.length - 1);
  });

  test("Css: spaced values within method", () => {
    const cursor = new Cursor("method(inner-method(0,0,0,0) 0%, arg2, 10%)");
    const result = cssValue.parse(cursor);
    expect(result?.endIndex).toBe(cursor.text.length - 1);
  });

  test("Css: spaced values", () => {
    const cursor = new Cursor(
      "inner-method(0,0,0,0) inner-method(0,0,0,0) 0px 10px 0%"
    );
    const result = cssValue.parse(cursor);
    expect(result?.endIndex).toBe(cursor.text.length - 1);
  });

  test("Css: complex spaced values", () => {
    const cursor = new Cursor(
      "#222 linear-gradient(to left, #333, #333 50%, #eee 75%, #333 75%) linear-gradient(to bottom, #555, #555 50%, #eee 75%, #555 75%)"
    );
    const result = cssValue.parse(cursor);
    expect(result?.endIndex).toBe(cursor.text.length - 1);
  });

  test("Css: multiple linear gradients", () => {
    const cursor = new Cursor(
      "linear-gradient(to left, #333, #333 50%, #eee 75%, #333 75%), linear-gradient(to bottom, #555, #555 50%, #eee 75%, #555 75%)"
    );
    const result = cssValue.parse(cursor);
    expect(result?.endIndex).toBe(cursor.text.length - 1);
  });

  test("Css: getPossibilities", () => {
    const result = cssValue.getPossibilities();

    const cssString = "rgba(0,0,0,0), &8sd";

    const parseResult = cssValue.parse(new Cursor(cssString));
  });
});
