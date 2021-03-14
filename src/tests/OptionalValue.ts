import Literal from "../patterns/value/Literal";
import OptionalValue from "../patterns/value/OptionalValue";
import assert from "assert";
import Cursor from "../Cursor";

exports["OptionalValue: Empty constructor."] = () => {
  assert.throws(() => {
    new OptionalValue();
  });
};

exports["OptionalValue: Empty pattern."] = () => {
  assert.throws(() => {
    new OptionalValue();
  });
};

exports["OptionalValue: Invalid pattern."] = () => {
  assert.throws(() => {
    new OptionalValue({});
  });
};

exports["OptionalValue: Match pattern."] = () => {
  const john = new Literal("john", "John");
  const optionalValue = new OptionalValue(john);
  const cursor = new Cursor("John");
  const node = optionalValue.parse(cursor);

  assert.equal(node.name, "john");
  assert.equal(node.value, "John");
};

exports["OptionalValue: No Match pattern."] = () => {
  const john = new Literal("john", "John");
  const optionalValue = new OptionalValue(john);
  const cursor = new Cursor("Jane");
  const node = optionalValue.parse(cursor);

  assert.equal(node, null);
};

exports["OptionalValue: Name"] = () => {
  const john = new Literal("john", "John");
  const optionalValue = new OptionalValue(john);

  assert.equal(optionalValue.name, "optional-value");
};
