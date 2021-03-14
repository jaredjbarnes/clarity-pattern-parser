import assert from "assert";
import { RecursivePattern, Cursor } from "../index";
import literals from "./javascriptPatterns/json";

exports["RecursivePattern: JSON"] = () => {
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

  assert.equal(object.name, "object-literal");
  assert.equal(array.name, "array-literal");
  assert.equal(object.toString(), json);
};

exports["RecursivePattern: No pattern"] = () => {
  const node = new RecursivePattern("nothing");
  const result = node.exec("Some string.");

  assert.equal(result, null);
};

exports["RecursivePattern: clone."] = () => {
  const node = new RecursivePattern("nothing");
  const clone = node.clone();

  assert.equal(node.name, clone.name);

  const otherClone = node.clone("nothing2");

  assert.equal(otherClone.name, "nothing2");
};

exports["RecursivePattern: getNextTokens."] = () => {
  let tokens = literals.getTokens();

  tokens = literals.children[0].getNextTokens();

  tokens = literals.children[4].getTokens();
  tokens = literals.children[4].children[1].getNextTokens();
  tokens = literals.children[4].children[2].getNextTokens();

  tokens = literals.children[4].children[2].children[0].children[0].children[0].children[0].getTokens();
  tokens = literals.children[4].children[2].children[0].children[0].getNextTokens();

  tokens = literals.children[4].children[3].getNextTokens();
};

exports["RecursivePattern: getPossibilities."] = () => {
  const possibilities = literals.getPossibilities();
};
