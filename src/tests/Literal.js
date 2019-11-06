import Literal from "../patterns/value/Literal.js";
import Cursor from "../Cursor.js";
import assert from "assert";

exports["Literal: Empty constructor."] = () => {
  assert.throws(() => {
    new Literal();
  });
};

exports["Literal: Undefined literal."] = () => {
  assert.throws(() => {
    new Literal("literal");
  });
};

exports["Literal: Null literal."] = () => {
  assert.throws(() => {
    new Literal("literal", null);
  });
};

exports["Literal: Empty literal."] = () => {
  assert.throws(() => {
    new Literal("literal", "");
  });
};

exports["Literal: Match."] = () => {
  const variable = new Literal("variable", "var");
  const cursor = new Cursor("var foo = 'Hello World';");
  const node = variable.parse(cursor);

  assert.equal(node.type, "variable");
  assert.equal(node.value, "var");
  assert.equal(cursor.getIndex(), 3);
  assert.equal(cursor.getChar(), " ");
};

exports["Literal: Match at end."] = () => {
  const variable = new Literal("variable", "var");
  const cursor = new Cursor("var");
  const node = variable.parse(cursor);

  assert.equal(node.type, "variable");
  assert.equal(node.value, "var");
  assert.equal(cursor.getIndex(), 2);
  assert.equal(cursor.getChar(), "r");
  assert.equal(cursor.isAtEnd(), true);
};

exports["Literal: No match."] = () => {
  const variable = new Literal("variable", "var");
  const cursor = new Cursor("vax");

  assert.throws(() => {
    variable.parse(cursor);
  });

  assert.equal(cursor.getIndex(), 2);
  assert.equal(cursor.getChar(), "x");
};

exports["Literal: Bad cursor."] = () => {
  const variable = new Literal("variable", "var");

  assert.throws(() => {
    variable.parse();
  });

};

exports["Literal: Pattern methods."] = () => {
  const variable = new Literal("variable", "var");
  const clone = variable.clone();

  assert.equal(variable.getName(), clone.getName());
  assert.equal(variable.getType(), clone.getType());
  assert.equal(variable.getValue(), clone.getValue());
  assert.equal(variable.getPatterns(), clone.getPatterns());
};
