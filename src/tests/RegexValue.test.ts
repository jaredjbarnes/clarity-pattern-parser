import { RegexValue } from "../index";
import assert from "assert";

test("RegexValue: exec.", () => {
  const notA = new RegexValue("not-a", "[^a]+");

  const result = notA.exec("John");
  const result2 = notA.exec("a");

  const expectedValue = {
    type: "regex-value",
    name: "not-a",
    startIndex: 0,
    endIndex: 3,
    value: "John",
  };

  expect(JSON.stringify(result)).toBe(JSON.stringify(expectedValue));
  expect(result2).toBe(null);
});
