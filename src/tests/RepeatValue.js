import RepeatValue from "../patterns/value/RepeatValue.js";
import Literal from "../patterns/value/Literal.js";
import OptionalValue from "../patterns/value/OptionalValue.js";
import assert from "assert";
import Cursor from "../Cursor.js";

exports["RepeatValue: Empty Constructor."] = () => {
  assert.throws(() => {
    new RepeatValue();
  });
};

exports["RepeatValue: Invalid name."] = () => {
  assert.throws(() => {
    new RepeatValue([], new Literal("blah", "Blah"));
  });
};

exports["RepeatValue: No patterns"] = () => {
  assert.throws(() => {
    new RepeatValue("and-value");
  });
};

exports["RepeatValue: Empty patterns"] = () => {
  assert.throws(() => {
    new RepeatValue("and-value", null);
  });
};

exports["RepeatValue: Invalid patterns"] = () => {
  assert.throws(() => {
    new RepeatValue("and-value", {});
  });
};

exports["RepeatValue: No Match"] = () => {
  const john = new Literal("john", "John");
  const johns = new RepeatValue("johns", john);
  const cursor = new Cursor("JaneJane");

  assert.throws(() => {
    johns.parse(cursor);
  });
};

exports["RepeatValue: GetValue"] = () => {
  const john = new Literal("john", "John");
  const johns = new RepeatValue("johns", john);

  assert.equal(johns.getValue(), null);
};

exports["RepeatValue: Success, one John"] = () => {
  const john = new Literal("john", "John");
  const johns = new RepeatValue("johns", john);
  const cursor = new Cursor("John");
  const node = johns.parse(cursor);

  assert.equal(node.type, "johns");
  assert.equal(node.value, "John");
  assert.equal(node.startIndex, 0);
  assert.equal(node.endIndex, 3);
};

exports["RepeatValue: Success with a terminating match."] = () => {
  const john = new Literal("john", "John");
  const johns = new RepeatValue("johns", john);
  const cursor = new Cursor("JohnJohnJane");
  const node = johns.parse(cursor);

  assert.equal(node.type, "johns");
  assert.equal(node.value, "JohnJohn");
  assert.equal(node.startIndex, 0);
  assert.equal(node.endIndex, 7);
  assert.equal(cursor.getIndex(), 8);
};

exports["RepeatValue: Bad cursor."] = () => {
  const john = new Literal("john", "John");
  const johns = new RepeatValue("johns", john);

  assert.throws(() => {
    johns.parse(cursor);
  });
};

exports["RepeatValue: Clone."] = () => {
  const john = new Literal("john", "John");
  const johns = new RepeatValue("johns", john);
  const clone = johns.clone();

  assert.equal(johns.getType(), clone.getType());
  assert.equal(johns.getName(), clone.getName());
};

exports["RepeatValue: Try Optional."] = () => {
  const john = new Literal("john", "John");

  assert.throws(() => {
    new RepeatValue("johns", new OptionalValue(john));
  });
};
