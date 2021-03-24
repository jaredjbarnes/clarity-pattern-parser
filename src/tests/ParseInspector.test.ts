import ParseInspector from "../ParseInspector";
import sentence from "./patterns/sentence";

describe("ParseInspector", () => {
  test("ParseInspector: Partial Match", () => {
    const text = "Pat ";
    const parseInspector = new ParseInspector();

    const inspection = parseInspector.inspectParse(text, sentence);

    expect(inspection.match?.text).toBe("Pat ");
    expect(inspection.isComplete).toBe(false);
    expect(inspection.match?.startIndex).toBe(0);
    expect(inspection.match?.endIndex).toBe(3);
    expect(inspection.error).toBe(null);
    expect(inspection.possibilities?.startIndex).toBe(4);
    expect(inspection.possibilities?.options.length).toBe(16);
  });

  test("ParseInspector: Partial Match, with error.", () => {
    const text = "Pat wzoo";
    const parseInspector = new ParseInspector();

    const inspection = parseInspector.inspectParse(text, sentence);
    expect(inspection.possibilities).toBe(null);
    expect(inspection.match?.startIndex).toBe(0);
    expect(inspection.match?.endIndex).toBe(3);
    expect(inspection.error?.startIndex).toBe(4);
    expect(inspection.error?.endIndex).toBe(7);
    expect(inspection.astNode?.name).toBe("space");
    expect(inspection.pattern?.name).toBe("space");
  });

  test("ParseInspector: No auto complete so fallback to search.", () => {
    const text = "bank";
    const parseInspector = new ParseInspector();

    const inspection = parseInspector.inspectParse(text, sentence);

    expect(inspection.possibilities?.options.length).toBe(16);
    expect(inspection.match).toBe(null);
    expect(inspection.pattern).toBe(null);
    expect(inspection.error?.startIndex).toBe(0);
    expect(inspection.error?.endIndex).toBe(3);
  });

  test("ParseInspector: No auto complete so fallback to search with two token.", () => {
    const text = "store bank";
    const parseInspector = new ParseInspector();

    const inspection = parseInspector.inspectParse(text, sentence);

    expect(inspection.possibilities?.options.length).toBe(32);
    expect(inspection.match).toBe(null);
    expect(inspection.pattern).toBe(null);
    expect(inspection.error?.startIndex).toBe(0);
    expect(inspection.error?.endIndex).toBe(9);
  });

  test("ParseInspector: Partial Half Match", () => {
    const text = "Pat wen";
    const parseInspector = new ParseInspector();

    const inspection = parseInspector.inspectParse(text, sentence);

    expect(inspection.match?.text).toBe("Pat wen");
    expect(inspection.isComplete).toBe(false);
    expect(inspection.match?.startIndex).toBe(0);
    expect(inspection.match?.endIndex).toBe(6);
    expect(inspection.error).toBe(null);
    expect(inspection.possibilities?.startIndex).toBe(7);
    expect(inspection.possibilities?.options.length).toBe(8);
  });

  test("ParseInspector: Empty String", () => {
    const text = "";
    const parseInspector = new ParseInspector();

    const inspection = parseInspector.inspectParse(text, sentence);

    expect(inspection.match).toBe(null);
    expect(inspection.isComplete).toBe(false);
    expect(inspection.error).toBe(null);
    expect(inspection.possibilities?.startIndex).toBe(0);
    expect(inspection.possibilities?.options.length).toBe(32);
  });

  test("ParseInspector: No match with error.", () => {
    const text = "Jared left ";
    const parseInspector = new ParseInspector();

    const inspection = parseInspector.inspectParse(text, sentence);
    expect(inspection.match).toBe(null);
    expect(inspection.isComplete).toBe(false);
    expect(inspection.error?.startIndex).toBe(0);
    expect(inspection.error?.endIndex).toBe(10);
    expect(inspection.possibilities).toBe(null);
  });

  test("ParseInspector: Complete Match.", () => {
    const text = "Pat went to a big store";
    const parseInspector = new ParseInspector();

    const inspection = parseInspector.inspectParse(text, sentence);

    expect(inspection.match?.text).toBe("Pat went to a big store");
    expect(inspection.isComplete).toBe(true);
    expect(inspection.match?.startIndex).toBe(0);
    expect(inspection.match?.endIndex).toBe(22);
    expect(inspection.error).toBe(null);
    expect(inspection.possibilities).toBe(null);
  });

  test("ParseInspector: static inspectParse.", () => {
    const text = "Pat went to a big store";
    const inspection = ParseInspector.inspectParse(text, sentence);

    expect(inspection.match?.text).toBe("Pat went to a big store");
    expect(inspection.isComplete).toBe(true);
    expect(inspection.match?.startIndex).toBe(0);
    expect(inspection.match?.endIndex).toBe(22);
    expect(inspection.error).toBe(null);
    expect(inspection.possibilities).toBe(null);
  });
});
