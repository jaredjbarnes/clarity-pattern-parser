import OrValue from "../patterns/value/OrValue.js";
import AnyOfThese from "../patterns/value/AnyOfThese.js";
import Literal from "../patterns/value/Literal.js";
import Cursor from "../Cursor.js";
import assert from "assert";

exports["OrValue: Empty constructor."] = () => {
  assert.throws(() => {
    new OrValue();
  });
};

exports["OrValue: Undefined parser."] = () => {
  assert.throws(() => {
    new OrValue("name");
  });
};

exports["OrValue: Null patterns."] = () => {
  assert.throws(() => {
    new OrValue("name", null);
  });
};

exports["OrValue: Empty array parser."] = () => {
  assert.throws(() => {
    new OrValue("name", []);
  });
};

exports["OrValue: One parser."] = () => {
  assert.throws(() => {
    new OrValue("name", [new Literal("some-value")]);
  });
};

exports["OrValue: Name and patterns."] = () => {
  const letter = new AnyOfThese(
    "letter",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  );
  const number = new AnyOfThese("number", "0987654321");
  const alphaNumeric = new OrValue("alpha-numeric", [letter, number]);

  const letterCursor = new Cursor("a");
  const numberCursor = new Cursor("1");

  const letterNode = alphaNumeric.parse(letterCursor);
  const numberNode = alphaNumeric.parse(numberCursor);

  assert.equal(letterNode.name, "alpha-numeric");
  assert.equal(letterNode.value, "a");

  assert.equal(numberNode.name, "alpha-numeric");
  assert.equal(numberNode.value, "1");
};

exports["OrValue: Optional Pattern as one of the patterns."] = () => {
  const letter = new AnyOfThese(
    "letter",
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  );
  const number = new AnyOfThese("number", "0987654321");
  const alphaNumeric = new OrValue("alpha-numeric", [letter, number]);

  const letterCursor = new Cursor("a");
  const numberCursor = new Cursor("1");

  const letterNode = alphaNumeric.parse(letterCursor);
  const numberNode = alphaNumeric.parse(numberCursor);

  assert.equal(letterNode.name, "alpha-numeric");
  assert.equal(letterNode.value, "a");

  assert.equal(numberNode.name, "alpha-numeric");
  assert.equal(numberNode.value, "1");
};

exports["OrValue: Fail."] = () => {
  const letter = new AnyOfThese("some-letter", "abc");
  const number = new AnyOfThese("some-number", "123");
  const alphaNumeric = new OrValue("some-alpha-numeric", [letter, number]);

  const letterCursor = new Cursor("d");
  const numberCursor = new Cursor("4");

  const letterNode = alphaNumeric.parse(letterCursor);
  const numberNode = alphaNumeric.parse(numberCursor);

  assert.equal(letterCursor.getIndex(), 0);
  assert.equal(letterCursor.hasUnresolvedError(), true);

  assert.equal(numberCursor.getIndex(), 0);
  assert.equal(numberCursor.hasUnresolvedError(), true);
};

exports["OrValue: Clone."] = () => {
  const letter = new AnyOfThese("some-letter", "abc");
  const number = new AnyOfThese("some-number", "123");
  const alphaNumeric = new OrValue("some-alpha-numeric", [letter, number]);

  const clone = alphaNumeric.clone();

  assert.equal(alphaNumeric.children.length, clone.children.length);
  assert.equal(alphaNumeric.name, clone.name);
};

exports["OrValue: Invalid patterns."] = () => {
  assert.throws(() => {
    new OrValue("some-alpha-numeric", [{}, null]);
  });
};

exports["OrValue: Not enough patterns."] = () => {
  assert.throws(() => {
    new OrValue("some-alpha-numeric", [{}]);
  });
};

exports["OrValue: Bad name."] = () => {
  assert.throws(() => {
    new OrValue({}, [new Literal("a", "a"), new Literal("a", "a")]);
  });
};

exports["OrValue: Bad cursor."] = () => {
  assert.throws(() => {
    new OrValue("A", [new Literal("a", "a"), new Literal("a", "a")]).parse();
  });
};

exports["OrValue: Furthest Parse Error."] = () => {
  const longer = new Literal("longer", "Longer");
  const bang = new Literal("bang", "Bang");
  const orValue = new OrValue("test", [longer, bang]);
  const cursor = new Cursor("Longed");

  orValue.parse(cursor);

  assert.equal(cursor.getIndex(), 0);
  assert.equal(cursor.hasUnresolvedError(), true);
};

exports["OrValue: Last pattern matches."] = () => {
  const longer = new Literal("longer", "Longer");
  const bang = new Literal("bang", "Bang");
  const orValue = new OrValue("test", [longer, bang]);
  const cursor = new Cursor("Bang");

  const node = orValue.parse(cursor);

  assert.equal(node.name, "test");
  assert.equal(node.value, "Bang");
};
