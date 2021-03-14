import NotValue from "../patterns/value/NotValue";
import OrValue from "../patterns/value/OrValue";
import Literal from "../patterns/value/Literal";
import assert from "assert";
import Cursor from "../Cursor";

exports["NotValue: Empty Constructor."] = () => {
  assert.throws(() => {
    new NotValue();
  });
};

exports["NotValue: Invalid name."] = () => {
  assert.throws(() => {
    new NotValue([], new Literal("blah", "Blah"));
  });
};

exports["NotValue: No patterns"] = () => {
  assert.throws(() => {
    new NotValue("and-value");
  });
};

exports["NotValue: Empty patterns"] = () => {
  assert.throws(() => {
    new NotValue("and-value", null);
  });
};

exports["NotValue: Invalid patterns"] = () => {
  assert.throws(() => {
    new NotValue("and-value", {});
  });
};

exports["NotValue: No Match"] = () => {
  const john = new Literal("john", "John");
  const notJohn = new NotValue("not-john", john);
  const cursor = new Cursor("John");

  notJohn.parse(cursor);
  assert.equal(cursor.hasUnresolvedError(), true);
  assert.equal(cursor.parseError.message, "Didn't find any characters that didn't match the john pattern.");
};

exports["NotValue: Success"] = () => {
  const john = new Literal("john", "John");
  const notJohn = new NotValue("not-john", john);
  const cursor = new Cursor("Jane");
  const node = notJohn.parse(cursor);

  assert.equal(node.name, "not-john");
  assert.equal(node.value, "J");
  assert.equal(node.startIndex, 0);
  assert.equal(node.endIndex, 0);
  assert.equal(cursor.getIndex(), 0);
};

exports["NotValue: Clone."] = () => {
  const john = new Literal("john", "John");
  const notJohn = new NotValue("not-john", john);
  const clone = notJohn.clone();

  assert.equal(notJohn.name, clone.name);
};
