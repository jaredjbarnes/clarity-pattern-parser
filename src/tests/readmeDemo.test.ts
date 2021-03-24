import {
  Cursor,
  Literal,
  AndValue,
  OrValue,
  RepeatValue,
  NotValue,
  AndComposite,
} from "../index";

describe("Readme.md", () => {
  test("value", () => {
    const forwardSlashes = new Literal("forward-slashes", "//");
    const newLine = new Literal("new-line", "\n");
    const returnCarriage = new Literal("return-carriage", "\r");
    const windowsNewLine = new AndValue("windows-new-line", [
      returnCarriage,
      newLine,
    ]);
    const lineEnd = new OrValue("line-end", [newLine, windowsNewLine]);
    const character = new NotValue("character", lineEnd);
    const comment = new RepeatValue("comment", character);

    const lineEndingComment = new AndValue("line-ending-comment", [
      forwardSlashes,
      comment,
      lineEnd,
    ]);

    const string = "// This is a comment\n";
    const cursor = new Cursor(string);
    const node = lineEndingComment.parse(cursor);

    expect(node?.name).toBe("line-ending-comment"); // --> true
    expect(node?.value).toBe(string); // --> true

    const expectedValue = {
      children: [],
      value: "// This is a comment\n",
      type: "and-value",
      name: "line-ending-comment",
      startIndex: 0,
      endIndex: 20,
      isComposite: false,
    };

    expect(JSON.stringify(node)).toBe(JSON.stringify(expectedValue)); // --> true
  });

  test("composite", () => {
    const forwardSlashes = new Literal("forward-slashes", "//");
    const newLine = new Literal("new-line", "\n");
    const returnCarriage = new Literal("return-carriage", "\r");
    const windowsNewLine = new AndValue("windows-new-line", [
      returnCarriage,
      newLine,
    ]);
    const lineEnd = new OrValue("line-end", [newLine, windowsNewLine]);
    const character = new NotValue("character", lineEnd);
    const comment = new RepeatValue("comment", character);

    const lineEndingComment = new AndComposite("line-ending-comment", [
      forwardSlashes,
      comment,
      lineEnd,
    ]);

    const string = "// This is a comment\n";
    const cursor = new Cursor(string);
    const node = lineEndingComment.parse(cursor);

    expect(node?.name).toBe("line-ending-comment");

    expect(node?.children[0].name).toBe("forward-slashes");
    expect(node?.children[0].value).toBe("//");

    expect(node?.children[1].name).toBe("comment");
    expect(node?.children[1].value).toBe(" This is a comment");

    expect(node?.children[2].name).toBe("line-end");
    expect(node?.children[2].value).toBe("\n");

    const expectedValue = {
      children: [
        {
          children: [],
          value: "//",
          type: "literal",
          name: "forward-slashes",
          startIndex: 0,
          endIndex: 1,
          isComposite: false,
        },
        {
          children: [],
          value: " This is a comment",
          type: "repeat-value",
          name: "comment",
          startIndex: 2,
          endIndex: 19,
          isComposite: false,
        },
        {
          children: [],
          value: "\n",
          type: "or-value",
          name: "line-end",
          startIndex: 20,
          endIndex: 20,
          isComposite: false,
        },
      ],
      value: "",
      type: "and-composite",
      name: "line-ending-comment",
      startIndex: 0,
      endIndex: 20,
      isComposite: true,
    };

    expect(JSON.stringify(node)).toBe(JSON.stringify(expectedValue)); // --> true
  });
});
