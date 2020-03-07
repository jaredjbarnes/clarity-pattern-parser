import ParseInspector from "../ParseInspector.js";
import sentence from "./patterns/sentence.js";
import assert from "assert";

exports["ParseInspector: Partial Match"] = () => {
  const text = "Pat ";
  const parseInspector = new ParseInspector();

  const inspection = parseInspector.inspectParse(text, sentence);

  assert.equal(inspection.match.text, "Pat ");
  assert.equal(inspection.isComplete, false);
  assert.equal(inspection.match.startIndex, 0);
  assert.equal(inspection.match.endIndex, 3);
  assert.equal(inspection.error, null);
  assert.equal(inspection.possibilities.startIndex, 4);
  assert.equal(inspection.possibilities.options.length, 16);
};

exports["ParseInspector: Partial Match, with error."] = () => {
  const text = "Pat wzoo";
  const parseInspector = new ParseInspector();

  const inspection = parseInspector.inspectParse(text, sentence);
  assert.equal(inspection.possibilities, null);
  assert.equal(inspection.match.startIndex, 0);
  assert.equal(inspection.match.endIndex, 3);
  assert.equal(inspection.error.startIndex, 4);
  assert.equal(inspection.error.endIndex, 7);
  assert.equal(inspection.astNode.name, "space");
  assert.equal(inspection.pattern.name, "space");
};

exports["ParseInspector: No auto complete so fallback to search."] = () => {
  const text = "bank";
  const parseInspector = new ParseInspector();

  const inspection = parseInspector.inspectParse(text, sentence);

  assert.equal(inspection.possibilities.options.length, 16);
  assert.equal(inspection.match, null);
  assert.equal(inspection.pattern, null);
  assert.equal(inspection.error.startIndex, 0);
  assert.equal(inspection.error.endIndex, 3);
};

exports[
  "ParseInspector: No auto complete so fallback to search with two token."
] = () => {
  const text = "store bank";
  const parseInspector = new ParseInspector();

  const inspection = parseInspector.inspectParse(text, sentence);

  assert.equal(inspection.possibilities.options.length, 32);
  assert.equal(inspection.match, null);
  assert.equal(inspection.pattern, null);
  assert.equal(inspection.error.startIndex, 0);
  assert.equal(inspection.error.endIndex, 9);
};

exports["ParseInspector: Partial Half Match"] = () => {
  const text = "Pat wen";
  const parseInspector = new ParseInspector();

  const inspection = parseInspector.inspectParse(text, sentence);

  assert.equal(inspection.match.text, "Pat wen");
  assert.equal(inspection.isComplete, false);
  assert.equal(inspection.match.startIndex, 0);
  assert.equal(inspection.match.endIndex, 6);
  assert.equal(inspection.error, null);
  assert.equal(inspection.possibilities.startIndex, 7);
  assert.equal(inspection.possibilities.options.length, 8);
};

exports["ParseInspector: Empty String"] = () => {
  const text = "";
  const parseInspector = new ParseInspector();

  const inspection = parseInspector.inspectParse(text, sentence);

  assert.equal(inspection.match, null);
  assert.equal(inspection.isComplete, false);
  assert.equal(inspection.error, null);
  assert.equal(inspection.possibilities.startIndex, 0);
  assert.equal(inspection.possibilities.options.length, 32);
};

exports["ParseInspector: No match with error."] = () => {
  const text = "Jared left ";
  const parseInspector = new ParseInspector();

  const inspection = parseInspector.inspectParse(text, sentence);
  assert.equal(inspection.match, null);
  assert.equal(inspection.isComplete, false);
  assert.equal(inspection.error.startIndex, 0);
  assert.equal(inspection.error.endIndex, 10);
  assert.equal(inspection.possibilities, null);
};

exports["ParseInspector: Complete Match."] = () => {
  const text = "Pat went to a big store";
  const parseInspector = new ParseInspector();

  const inspection = parseInspector.inspectParse(text, sentence);

  assert.equal(inspection.match.text, "Pat went to a big store");
  assert.equal(inspection.isComplete, true);
  assert.equal(inspection.match.startIndex, 0);
  assert.equal(inspection.match.endIndex, 22);
  assert.equal(inspection.error, null);
  assert.equal(inspection.possibilities, null);
};
