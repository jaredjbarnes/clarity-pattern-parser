import TextInspector from "../TextInspector.js";
import sentence from "./patterns/sentence.js";
import assert from "assert";

exports["TextInspector: Partial Match"] = () => {
  const text = "Pat ";
  const textInspector = new TextInspector();

  const inspection = textInspector.inspect(text, sentence);
  assert.equal(inspection.tokens.options.length, 2 );
  assert.equal(inspection.tokens.startIndex, 4 );
  assert.equal(inspection.match.text, "Pat ");
  assert.equal(inspection.error, null);
  assert.equal(inspection.isComplete, false);
};

exports["TextInspector: Partial Match, with error."] = () => {
  const text = "Pat wzoo";
  const textInspector = new TextInspector();

  const inspection = textInspector.inspect(text, sentence);
};

exports["TextInspector: No auto complete so fallback to search."] = () => {
  const text = "bank";
  const textInspector = new TextInspector();

  const inspection = textInspector.inspect(text, sentence);
};

exports[
  "TextInspector: No auto complete so fallback to search with two token."
] = () => {
  const text = "store bank";
  const textInspector = new TextInspector();

  const inspection = textInspector.inspect(text, sentence);
};

exports["TextInspector: Partial Half Match"] = () => {
  const text = "Pat wen";
  const textInspector = new TextInspector();

  const inspection = textInspector.inspect(text, sentence);
};

exports["TextInspector: Empty String"] = () => {
  const text = "";
  const textInspector = new TextInspector();

  const inspection = textInspector.inspect(text, sentence);
};

exports["TextInspector: No match with error."] = () => {
  const text = "Jared left ";
  const textInspector = new TextInspector();

  const inspection = textInspector.inspect(text, sentence);
};

exports["TextInspector: Complete Match."] = () => {
  const text = "Pat went to a big store";
  const textInspector = new TextInspector();

  const inspection = textInspector.inspect(text, sentence);
};

exports["TextInspector: static inspect."] = () => {
  const text = "Pat went to a big store";
  const inspection = TextInspector.inspect(text, sentence);
};
