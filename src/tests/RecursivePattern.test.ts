/** @jest-environment node */
import { RecursivePattern, Cursor } from "../index";
import literals from "./javascriptPatterns/json";

describe("RecursivePattern", () => {
  test("JSON", () => {
    const json = JSON.stringify({
      string: "This is a string.",
      number: 1,
      boolean: true,
      json: {
        string: "This is a nested string.",
      },
      null: null,
      array: [1, "Blah", { prop1: true }],
    });

    const cursor = new Cursor(json);
    const cursor2 = new Cursor(JSON.stringify([{ foo: "bar" }]));

    const object = literals.parse(cursor);
    const array = literals.parse(cursor2);

    expect(object.name).toBe("object-literal");
    expect(array.name).toBe("array-literal");
    expect(object.toString()).toBe(json);
  });

  test("No pattern", () => {
    const node = new RecursivePattern("nothing");
    const result = node.exec("Some string.");

    expect(result).toBe(null);
  });

  test("clone.", () => {
    const node = new RecursivePattern("nothing");
    const clone = node.clone();

    expect(node.name).toBe(clone.name);

    const otherClone = node.clone("nothing2");

    expect(otherClone.name).toBe("nothing2");
  });

  test("getNextTokens.", () => {
    let tokens = literals.getTokens();

    tokens = literals.children[0].getNextTokens();

    tokens = literals.children[4].getTokens();
    tokens = literals.children[4].children[1].getNextTokens();
    tokens = literals.children[4].children[2].getNextTokens();

    tokens = literals.children[4].children[2].children[0].children[0].children[0].children[0].getTokens();
    tokens = literals.children[4].children[2].children[0].children[0].getNextTokens();

    tokens = literals.children[4].children[3].getNextTokens();
  });

});
