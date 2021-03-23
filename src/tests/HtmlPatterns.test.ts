import element, { attribute } from "./htmlPatterns/element";
import { Cursor } from "../index";

describe("HTML", () => {
  test("Html: element", () => {
    const cursor = new Cursor("<div></div>");
    const result = element.parse(cursor);
  });

  test("Html: element nested", () => {
    const cursor = new Cursor("<div><p><span></span></p></div>");
    const result = element.parse(cursor);
  });

  test("Html: element with attributes", () => {
    const cursor = new Cursor('<div prop="value"></div>');
    const result = element.parse(cursor);
  });

  test("Html: multiple children", () => {
    const cursor = new Cursor(`<div prop="value">
          Text
          <span>Hello</span>
          <span>World!</span>
      </div>`);
    const result = element.parse(cursor);
    const possibilities = element.getPossibilities();
  });

  test("Attributes: ", () => {
    const cursor = new Cursor('prop="boo"');
    const result = attribute.parse(cursor);
  });
});
