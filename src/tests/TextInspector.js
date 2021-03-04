import TextInspector from "../TextInspector.js";
import sentence from "./patterns/sentence.js";
import assert from "assert";
import Literal from "../patterns/value/Literal.js";
import AndValue from "../patterns/value/AndValue.js";
import OrValue from "../patterns/value/OrValue.js";
import json from "./javascriptPatterns/json.js";

exports["TextInspector: Partial Match"] = () => {
  const text = "Pat ";
  const textInspector = new TextInspector();

  const inspection = textInspector.inspect(text, sentence);
  assert.equal(inspection.tokens.options.length, 2);
  assert.equal(inspection.tokens.startIndex, 4);
  assert.equal(inspection.match.text, "Pat ");
  assert.equal(inspection.error, null);
  assert.equal(inspection.isComplete, false);
};

exports["TextInspector: Partial Match, with error."] = () => {
  const text = "Pat wzoo";
  const textInspector = new TextInspector();

  const inspection = textInspector.inspect(text, sentence);

  assert.equal(inspection.error.startIndex, 4);
  assert.equal(inspection.error.endIndex, 7);
  assert.equal(inspection.error.text, "wzoo");
  assert.equal(inspection.match.startIndex, 0);
  assert.equal(inspection.match.endIndex, 3);
  assert.equal(inspection.match.text, "Pat ");
  assert.equal(inspection.tokens, null);
  assert.equal(inspection.isComplete, false);
};

exports["TextInspector: No auto complete so fallback to search."] = () => {
  const text = "bank";
  const textInspector = new TextInspector();

  const inspection = textInspector.inspect(text, sentence);

  assert.equal(inspection.error.startIndex, 0);
  assert.equal(inspection.error.endIndex, 3);
  assert.equal(inspection.error.text, "bank");
  assert.equal(inspection.tokens, null);
  assert.equal(inspection.pattern, null);
  assert.equal(inspection.match, null);
  assert.equal(inspection.isComplete, false);
};

exports[
  "TextInspector: No auto complete so fallback to search with two token."
] = () => {
  const text = "store bank";
  const textInspector = new TextInspector();

  const inspection = textInspector.inspect(text, sentence);

  assert.equal(inspection.error.startIndex, 0);
  assert.equal(inspection.error.endIndex, 9);
  assert.equal(inspection.error.text, "store bank");
  assert.equal(inspection.tokens, null);
  assert.equal(inspection.pattern, null);
  assert.equal(inspection.match, null);
  assert.equal(inspection.isComplete, false);
};

exports["TextInspector: Partial Half Match"] = () => {
  const text = "Pat wen";
  const textInspector = new TextInspector();

  const inspection = textInspector.inspect(text, sentence);

  assert.equal(inspection.match.startIndex, 0);
  assert.equal(inspection.match.endIndex, 6);
  assert.equal(inspection.match.text, "Pat wen");
  assert.equal(inspection.tokens.options.length, 1);
  assert.equal(inspection.tokens.options[0], "t to");
  assert.equal(inspection.isComplete, false);
  assert.equal(inspection.error, null);
};

exports["TextInspector: Empty String"] = () => {
  const text = "";
  const textInspector = new TextInspector();

  const inspection = textInspector.inspect(text, sentence);

  assert.equal(inspection.error, null);
  assert.equal(inspection.tokens.options.length, 2);
  assert.equal(inspection.tokens.options[0], "Pat");
  assert.equal(inspection.tokens.options[1], "Dan");
  assert.equal(inspection.pattern, null);
  assert.equal(inspection.match, null);
  assert.equal(inspection.isComplete, false);
};

exports["TextInspector: Complete Match."] = () => {
  const text = "Pat went to a big store";
  const textInspector = new TextInspector();

  const inspection = textInspector.inspect(text, sentence);

  assert.equal(inspection.error, null);
  assert.equal(inspection.tokens, null);
  assert.equal(inspection.match.startIndex, 0);
  assert.equal(inspection.match.endIndex, 22);
  assert.equal(inspection.match.text, "Pat went to a big store");
  assert.equal(inspection.isComplete, true);
};

exports["TextInspector: static inspect."] = () => {
  const text = "Pat went to a big store";
  const inspection = TextInspector.inspect(text, sentence);

  assert.equal(inspection.error, null);
  assert.equal(inspection.tokens, null);
  assert.equal(inspection.match.startIndex, 0);
  assert.equal(inspection.match.endIndex, 22);
  assert.equal(inspection.match.text, "Pat went to a big store");
  assert.equal(inspection.isComplete, true);
};

exports["TextInspector: static inspect."] = () => {
  const show = new Literal("show", "Show");
  const me = new Literal("me", "me");
  const theMoney = new Literal("the-money", "the money");
  const yourLicense = new Literal("your-license", "your license");
  const space = new Literal("space", " ");
  const first = new AndValue("first", [show, space, me, space, theMoney]);
  const second = new AndValue("second", [show, space, me, space, yourLicense]);
  const either = new OrValue("either", [first, second]);

  const inspection = TextInspector.inspect("Show me ", either);

  assert.equal(inspection.error, null);
  assert.equal(inspection.tokens.startIndex, 8);
  assert.equal(inspection.tokens.options.length, 2);
  assert.equal(inspection.tokens.options[0], "the money");
  assert.equal(inspection.tokens.options[1], "your license");
  assert.equal(inspection.match.startIndex, 0);
  assert.equal(inspection.match.endIndex, 7);
  assert.equal(inspection.match.text, "Show me ");
  assert.equal(inspection.isComplete, false);
};

exports["TextInspector: json inspect."] = () => {
  let inspection = TextInspector.inspect("{", json);

  inspection = TextInspector.inspect(`{"blah":`, json);

  assert.equal(inspection.error, null);
  assert.equal(inspection.tokens.startIndex, 8);
  assert.equal(inspection.tokens.options.length, 9);
  assert.equal(inspection.tokens.options[0], " ");
  assert.equal(inspection.tokens.options[1], "number");
  assert.equal(inspection.tokens.options[2], "'");
  assert.equal(inspection.tokens.options[3], "\"");
  assert.equal(inspection.tokens.options[4], "true");
  assert.equal(inspection.tokens.options[5], "false");
  assert.equal(inspection.tokens.options[6], "null");
  assert.equal(inspection.tokens.options[7], "{");
  assert.equal(inspection.tokens.options[8], "[");
  assert.equal(inspection.match.startIndex, 0);
  assert.equal(inspection.match.endIndex, 7);
  assert.equal(inspection.match.text, `{"blah":`);
  assert.equal(inspection.isComplete, false);

  inspection = TextInspector.inspect(`{"blah":{`, json);

  assert.equal(inspection.error, null);
  assert.equal(inspection.tokens.startIndex, 9);
  assert.equal(inspection.tokens.options.length, 4);
  assert.equal(inspection.tokens.options[0], " ");
  assert.equal(inspection.tokens.options[1], "'");
  assert.equal(inspection.tokens.options[2], "\"");
  assert.equal(inspection.tokens.options[3], "}");
  assert.equal(inspection.match.startIndex, 0);
  assert.equal(inspection.match.endIndex, 8);
  assert.equal(inspection.match.text, `{"blah":{`);
  assert.equal(inspection.isComplete, false);


  inspection = TextInspector.inspect(`{"blah":0.9`, json);

  assert.equal(inspection.error, null);
  assert.equal(inspection.tokens.startIndex, 11);
  assert.equal(inspection.tokens.options.length, 3);
  assert.equal(inspection.tokens.options[0], " ");
  assert.equal(inspection.tokens.options[1], ",");
  assert.equal(inspection.tokens.options[2], "}");
  assert.equal(inspection.match.startIndex, 0);
  assert.equal(inspection.match.endIndex, 10);
  assert.equal(inspection.match.text, `{"blah":0.9`);
  assert.equal(inspection.isComplete, false);
};