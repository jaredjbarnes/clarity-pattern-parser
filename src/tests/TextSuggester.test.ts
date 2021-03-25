/** @jest-environment node */
import TextSuggester from "../TextSuggester";
import sentence from "./patterns/sentence";
import Literal from "../patterns/value/Literal";
import AndValue from "../patterns/value/AndValue";
import OrValue from "../patterns/value/OrValue";
import json from "./javascriptPatterns/json";

describe("TextInspector", () => {
  test("Partial Match", () => {
    const text = "Pat ";
    const textInspector = new TextSuggester();

    const inspection = textInspector.suggest(text, sentence);
    expect(inspection.options.values.length).toBe(2);
    expect(inspection.options.startIndex).toBe(4);
    expect(inspection.match?.text).toBe("Pat ");
    expect(inspection.error).toBe(null);
    expect(inspection.isComplete).toBe(false);
  });

  test("Partial Match, with error?.", () => {
    const text = "Pat wzoo";
    const textInspector = new TextSuggester();

    const inspection = textInspector.suggest(text, sentence);

    expect(inspection.error?.startIndex).toBe(4);
    expect(inspection.error?.endIndex).toBe(7);
    expect(inspection.error?.text).toBe("wzoo");
    expect(inspection.match?.startIndex).toBe(0);
    expect(inspection.match?.endIndex).toBe(3);
    expect(inspection.match?.text).toBe("Pat ");
    expect(inspection.options).toBe(null);
    expect(inspection.isComplete).toBe(false);
  });

  test("No auto complete so fallback to search.", () => {
    const text = "bank";
    const textInspector = new TextSuggester();

    const inspection = textInspector.suggest(text, sentence);

    expect(inspection.error?.startIndex).toBe(0);
    expect(inspection.error?.endIndex).toBe(3);
    expect(inspection.error?.text).toBe("bank");
    expect(inspection.options).toBe(null);
    expect(inspection.pattern).toBe(null);
    expect(inspection.match).toBe(null);
    expect(inspection.isComplete).toBe(false);
  });

  test("No auto complete so fallback to search with two token.", () => {
    const text = "store bank";
    const textInspector = new TextSuggester();

    const inspection = textInspector.suggest(text, sentence);

    expect(inspection.error?.startIndex).toBe(0);
    expect(inspection.error?.endIndex).toBe(9);
    expect(inspection.error?.text).toBe("store bank");
    expect(inspection.options).toBe(null);
    expect(inspection.pattern).toBe(null);
    expect(inspection.match).toBe(null);
    expect(inspection.isComplete).toBe(false);
  });

  test("Partial Half Match", () => {
    const text = "Pat wen";
    const textInspector = new TextSuggester();

    const inspection = textInspector.suggest(text, sentence);

    expect(inspection.match?.startIndex).toBe(0);
    expect(inspection.match?.endIndex).toBe(6);
    expect(inspection.match?.text).toBe("Pat wen");
    expect(inspection.options.values.length).toBe(1);
    expect(inspection.options.values[0]).toBe("t to");
    expect(inspection.isComplete).toBe(false);
    expect(inspection.error).toBe(null);
  });

  test("Empty String", () => {
    const text = "";
    const textInspector = new TextSuggester();

    const inspection = textInspector.suggest(text, sentence);

    expect(inspection.error).toBe(null);
    expect(inspection.options.values.length).toBe(2);
    expect(inspection.options.values[0]).toBe("Pat");
    expect(inspection.options.values[1]).toBe("Dan");
    expect(inspection.pattern).toBe(null);
    expect(inspection.match).toBe(null);
    expect(inspection.isComplete).toBe(false);
  });

  test("Complete Match.", () => {
    const text = "Pat went to a big store";
    const textInspector = new TextSuggester();

    const inspection = textInspector.suggest(text, sentence);

    expect(inspection.error).toBe(null);
    expect(inspection.options).toBe(null);
    expect(inspection.match?.startIndex).toBe(0);
    expect(inspection.match?.endIndex).toBe(22);
    expect(inspection.match?.text).toBe("Pat went to a big store");
    expect(inspection.isComplete).toBe(true);
  });

  test("static inspect.", () => {
    const text = "Pat went to a big store";
    const inspection = TextSuggester.suggest(text, sentence);

    expect(inspection.error).toBe(null);
    expect(inspection.options).toBe(null);
    expect(inspection.match?.startIndex).toBe(0);
    expect(inspection.match?.endIndex).toBe(22);
    expect(inspection.match?.text).toBe("Pat went to a big store");
    expect(inspection.isComplete).toBe(true);
  });

  test("static inspect.", () => {
    const show = new Literal("show", "Show");
    const me = new Literal("me", "me");
    const theMoney = new Literal("the-money", "the money");
    const yourLicense = new Literal("your-license", "your license");
    const space = new Literal("space", " ");
    const first = new AndValue("first", [show, space, me, space, theMoney]);
    const second = new AndValue("second", [
      show,
      space,
      me,
      space,
      yourLicense,
    ]);
    const either = new OrValue("either", [first, second]);

    const inspection = TextSuggester.suggest("Show me ", either);

    expect(inspection.error).toBe(null);
    expect(inspection.options.startIndex).toBe(8);
    expect(inspection.options.values.length).toBe(2);
    expect(inspection.options.values[0]).toBe("the money");
    expect(inspection.options.values[1]).toBe("your license");
    expect(inspection.match?.startIndex).toBe(0);
    expect(inspection.match?.endIndex).toBe(7);
    expect(inspection.match?.text).toBe("Show me ");
    expect(inspection.isComplete).toBe(false);
  });

  test("json inspect.", () => {
    let inspection = TextSuggester.suggest("{", json);

    inspection = TextSuggester.suggest(`{"blah":`, json);

    expect(inspection.error).toBe(null);
    expect(inspection.options.startIndex).toBe(8);
    expect(inspection.options.values.length).toBe(9);
    expect(inspection.options.values[0]).toBe(" ");
    expect(inspection.options.values[1]).toBe("number");
    expect(inspection.options.values[2]).toBe("'");
    expect(inspection.options.values[3]).toBe('"');
    expect(inspection.options.values[4]).toBe("true");
    expect(inspection.options.values[5]).toBe("false");
    expect(inspection.options.values[6]).toBe("null");
    expect(inspection.options.values[7]).toBe("{");
    expect(inspection.options.values[8]).toBe("[");
    expect(inspection.match?.startIndex).toBe(0);
    expect(inspection.match?.endIndex).toBe(7);
    expect(inspection.match?.text).toBe(`{"blah":`);
    expect(inspection.isComplete).toBe(false);

    inspection = TextSuggester.suggest(`{"blah":{`, json);

    expect(inspection.error).toBe(null);
    expect(inspection.options.startIndex).toBe(9);
    expect(inspection.options.values.length).toBe(4);
    expect(inspection.options.values[0]).toBe(" ");
    expect(inspection.options.values[1]).toBe("'");
    expect(inspection.options.values[2]).toBe('"');
    expect(inspection.options.values[3]).toBe("}");
    expect(inspection.match?.startIndex).toBe(0);
    expect(inspection.match?.endIndex).toBe(8);
    expect(inspection.match?.text).toBe(`{"blah":{`);
    expect(inspection.isComplete).toBe(false);

    inspection = TextSuggester.suggest(`{"blah":0.9`, json);

    expect(inspection.error).toBe(null);
    expect(inspection.options.startIndex).toBe(11);
    expect(inspection.options.values.length).toBe(3);
    expect(inspection.options.values[0]).toBe(" ");
    expect(inspection.options.values[1]).toBe(",");
    expect(inspection.options.values[2]).toBe("}");
    expect(inspection.match?.startIndex).toBe(0);
    expect(inspection.match?.endIndex).toBe(10);
    expect(inspection.match?.text).toBe(`{"blah":0.9`);
    expect(inspection.isComplete).toBe(false);
  });
});
