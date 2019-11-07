import NotValue from "../patterns/value/NotValue.js";
import Literal from "../patterns/value/Literal.js";
import assert from "assert";
import Cursor from "../Cursor.js";

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

  assert.throws(() => {
    notJohn.parse(cursor);
  });
};

exports["NotValue: GetValue"] = () => {
  const john = new Literal("john", "John");
  const notJohn = new NotValue("not-john", john);

  assert.equal(notJohn.getValue(), null);
};

exports["NotValue: Success"] = () => {
  const john = new Literal("john", "John");
  const notJohn = new NotValue("not-john", john);
  const cursor = new Cursor("Jane");
  const node = notJohn.parse(cursor);

  assert.equal(node.type, "not-john");
  assert.equal(node.value, "Jane");
  assert.equal(node.startIndex, 0);
  assert.equal(node.endIndex, 3);
};

exports["NotValue: Success with a terminating match."] = () => {
  const john = new Literal("john", "John");
  const notJohn = new NotValue("not-john", john);
  const cursor = new Cursor("JaneJohn");
  const node = notJohn.parse(cursor);

  assert.equal(node.type, "not-john");
  assert.equal(node.value, "Jane");
  assert.equal(node.startIndex, 0);
  assert.equal(node.endIndex, 3);
  assert.equal(cursor.getIndex(), 4);
};

exports["NotValue: Success with an almost terminating match."] = () => {
  const john = new Literal("john", "John");
  const notJohn = new NotValue("not-john", john);
  const cursor = new Cursor("JaneJoh");
  const node = notJohn.parse(cursor);

  assert.equal(node.type, "not-john");
  assert.equal(node.value, "JaneJoh");
  assert.equal(node.startIndex, 0);
  assert.equal(node.endIndex, 6);
  assert.equal(cursor.getIndex(), 6);
};

exports["NotValue: Bad cursor."] = () => {
  const john = new Literal("john", "John");
  const notJohn = new NotValue("not-john", john);

  assert.throws(() => {
    notJohn.parse(cursor);
  });
};

exports["NotValue: Clone."] = () => {
  const john = new Literal("john", "John");
  const notJohn = new NotValue("not-john", john);
  const clone = notJohn.clone();

  assert.equal(notJohn.getType(), clone.getType());
  assert.equal(notJohn.getName(), clone.getName());
};
