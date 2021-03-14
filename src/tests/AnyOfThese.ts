import AnyOfThese from "../patterns/value/AnyOfThese";
import Cursor from "../Cursor";
import assert from "assert";

exports["AnyOfThese: Empty constructor."] = () => {
  assert.throws(() => {
    new AnyOfThese();
  });
};

exports["AnyOfThese: No characters provided."] = () => {
  assert.throws(() => {
    new AnyOfThese("no-characters");
  });
};

exports["AnyOfThese: Empty string provided as characters."] = () => {
  assert.throws(() => {
    new AnyOfThese("no-characters", "");
  });
};

exports["AnyOfThese: Single character."] = () => {
  const lowerCaseA = new AnyOfThese("lower-case-a", "a");
  const cursor = new Cursor("a");
  const node = lowerCaseA.parse(cursor);

  assert.equal(node.name, "lower-case-a");
  assert.equal(node.value, "a");
  assert.equal(node.startIndex, 0);
  assert.equal(node.endIndex, 0);
  assert.equal(cursor.isAtEnd(), true);
  assert.equal(cursor.getChar(), "a");
};

exports["AnyOfThese: Uppercase A and lowercase A."] = () => {
  const letterA = new AnyOfThese("letter-a", "Aa");
  const lowerCaseCursor = new Cursor("a");
  const upperCaseCursor = new Cursor("A");
  const lowerCaseNode = letterA.parse(lowerCaseCursor);
  const upperCaseNode = letterA.parse(upperCaseCursor);

  assert.equal(lowerCaseNode.name, "letter-a");
  assert.equal(lowerCaseNode.value, "a");
  assert.equal(lowerCaseNode.startIndex, 0);
  assert.equal(lowerCaseNode.endIndex, 0);

  assert.equal(upperCaseNode.name, "letter-a");
  assert.equal(upperCaseNode.value, "A");
  assert.equal(upperCaseNode.startIndex, 0);
  assert.equal(upperCaseNode.endIndex, 0);

  assert.equal(upperCaseCursor.getChar(), "A");
  assert.equal(upperCaseCursor.isAtEnd(), true);

  assert.equal(lowerCaseCursor.getChar(), "a");
  assert.equal(lowerCaseCursor.isAtEnd(), true);
};

exports["AnyOfThese: Match with long cursor."] = () => {
  const letterA = new AnyOfThese("letter-a", "Aa");
  const cursor = new Cursor("a12345");
  const node = letterA.parse(cursor);

  assert.equal(node.name, "letter-a");
  assert.equal(node.value, "a");
  assert.equal(cursor.getChar(), "a");
  assert.equal(cursor.getIndex(), 0);
};

exports["AnyOfThese: No match."] = () => {
  const letterA = new AnyOfThese("letter-a", "Aa");
  const cursor = new Cursor("12345");
  const node = letterA.parse(cursor);

  assert.equal(node, null);
};

exports["AnyOfThese: Bad cursor."] = () => {
  const letterA = new AnyOfThese("letter-a", "Aa");

  assert.throws(() => {
    const node = letterA.parse();
  });
};

exports["AnyOfThese: Pattern Methods."] = () => {
  const letterA = new AnyOfThese("letter-a", "Aa");

  assert.equal(letterA.name, "letter-a");
  assert.equal(letterA.children.length, 0);
};
