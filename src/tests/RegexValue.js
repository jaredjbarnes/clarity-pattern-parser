import { RegexValue } from "../index.js";
import assert from "assert";

exports["RegexValue: exec."] = () => {
  const notA = new RegexValue("not-a", "[^a]+");

  const result = notA.exec("John");
  const result2 = notA.exec("a");

  const expectedValue = {
    type: "regex-value",
    name: "not-a",
    startIndex: 0,
    endIndex: 3,
    value: "John"
  };

  assert.equal(JSON.stringify(result), JSON.stringify(expectedValue));
  assert.equal(result2, null);
};
