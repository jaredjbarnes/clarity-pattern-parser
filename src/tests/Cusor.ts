import assert from "assert";
import Cursor from "../Cursor";
import ValueNode from "../ast/ValueNode";
import ValuePattern from "../patterns/value/ValuePattern";

exports["Cursor: addMatch."] = () => {
  const cursor = new Cursor("Text");
  const node = new ValueNode("text-node", "Text", "Text", 0, 3);
  const pattern = new ValuePattern("text", "Text");

  cursor.setIndex(3);
  cursor.addMatch(pattern, node);

  assert.equal(cursor.history.furthestMatch.astNode, node);
  assert.equal(cursor.history.furthestMatch.pattern, pattern);
};

exports["Cursor: addMatch that isn't as far."] = () => {
  const cursor = new Cursor("Text");
  const node = new ValueNode("text-node", "Text", "Text", 0, 3);
  const pattern = new ValuePattern("text", "Text Node");

  const shorterNode = new ValueNode("tex-node", "Tex", "Tex", 0, 2);
  const shorterPattern = new ValuePattern("tex", "Tex");

  cursor.setIndex(3);
  cursor.addMatch(pattern, node);

  assert.equal(cursor.history.furthestMatch.astNode, node);
  assert.equal(cursor.history.furthestMatch.pattern, pattern);

  cursor.setIndex(2);
  cursor.addMatch(shorterPattern, shorterNode);

  assert.equal(cursor.history.furthestMatch.astNode, node);
  assert.equal(cursor.history.furthestMatch.pattern, pattern);
};

exports["Cursor: didSuccessfullyParse."] = () => {
  const cursor = new Cursor("Text");
  cursor.setIndex(3);
  assert.equal(cursor.didSuccessfullyParse(), true);

  cursor.throwError(new Error("Failed To Parse."));

  assert.equal(cursor.didSuccessfullyParse(), false);
};

exports["Cursor: getChar."] = () => {
  const cursor = new Cursor("Text");
  assert.equal(cursor.getChar(), "T");
  cursor.setIndex(3);
  assert.equal(cursor.getChar(), "t");
};

exports["Cursor: getIndex."] = () => {
  const cursor = new Cursor("Text");
  assert.equal(cursor.getIndex(), 0);
  cursor.setIndex(3);
  assert.equal(cursor.getIndex(), 3);
};

exports["Cursor: hasNext."] = () => {
  const cursor = new Cursor("Text");
  assert.equal(cursor.hasNext(), true);
  cursor.setIndex(3);
  assert.equal(cursor.hasNext(), false);
};

exports["Cursor: hasPrevious."] = () => {
  const cursor = new Cursor("Text");
  assert.equal(cursor.hasPrevious(), false);
  cursor.setIndex(3);
  assert.equal(cursor.hasPrevious(), true);
};

exports["Cursor: recording history."] = () => {
  const cursor = new Cursor("Text");
  const tNode = new ValueNode("T", "T", "T", 0, 0);
  const tPattern = new ValuePattern("T", "T");

  const eNode = new ValueNode("e", "e", "e", 1, 1);
  const ePattern = new ValuePattern("e", "e");

  const xNode = new ValueNode("x", "x", "x", 2, 2);
  const xPattern = new ValuePattern("x", "x");

  cursor.startRecording();

  cursor.addMatch(tPattern, tNode);
  cursor.addMatch(ePattern, eNode);

  assert.equal(cursor.history.patterns.length, 2);
  assert.equal(cursor.history.astNodes.length, 2);
  assert.equal(cursor.history.getFurthestMatch().astNode, eNode);
  assert.equal(cursor.history.getFurthestMatch().pattern, ePattern);
  assert.equal(cursor.history.getLastMatch().astNode, eNode);
  assert.equal(cursor.history.getLastMatch().pattern, ePattern);

  cursor.stopRecording();

  cursor.addMatch(xPattern, xNode);

  assert.equal(cursor.history.patterns.length, 0);
  assert.equal(cursor.history.astNodes.length, 0);
  assert.equal(cursor.history.getFurthestMatch().astNode, xNode);
  assert.equal(cursor.history.getFurthestMatch().pattern, xPattern);
  assert.equal(cursor.history.getLastMatch().astNode, xNode);
  assert.equal(cursor.history.getLastMatch().pattern, xPattern);
};

exports["Cursor: moveToBeginning."] = () => {
  const cursor = new Cursor("Text");
  cursor.setIndex(3);
  cursor.moveToBeginning();

  assert.equal(cursor.getIndex(), 0);
};

exports["Cursor: moveToEnd."] = () => {
  const cursor = new Cursor("Text");
  cursor.moveToEnd();

  assert.equal(cursor.getIndex(), 3);
};

exports["Cursor: setIndex outside of bounds."] = () => {
  const cursor = new Cursor("Text");
  assert.throws(() => {
    cursor.setIndex(4);
  });
};

exports["Cursor: empty constructor."] = () => {
  assert.throws(() => {
    new Cursor();
  });
};

exports["Cursor: next out of bounds."] = () => {
  const cursor = new Cursor("Text");
  cursor.setIndex(3);

  assert.throws(() => {
    cursor.next();
  });
};

exports["Cursor: previous out of bounds."] = () => {
  const cursor = new Cursor("Text");

  assert.throws(() => {
    cursor.previous();
  });
};

exports["Cursor: previous."] = () => {
  const cursor = new Cursor("Text");
  cursor.setIndex(1);
  cursor.previous();

  assert.equal(cursor.getIndex(), 0);
};

exports["Cursor: isAtBeginning."] = () => {
  const cursor = new Cursor("Text");
  cursor.isAtBeginning();

  assert.equal(cursor.getIndex(), 0);
  assert.equal(cursor.isAtBeginning(), true);
};

exports["Cursor: setIndex invalid number."] = () => {
  const cursor = new Cursor("Text");
  assert.throws(() => {
    cursor.setIndex(-1);
  });
};

exports["Cursor: setIndex invalid with string."] = () => {
  const cursor = new Cursor("Text");
  cursor.setIndex("");
};
