import { Block } from "./Block";
import { Literal } from "./Literal";
import { Regex } from "./Regex";
import { Optional } from "./Optional";
import { Options } from "./Options";
import { Sequence } from "./Sequence";
import { Repeat } from "./Repeat";
import { Cursor } from "./Cursor";

describe("Block", () => {
  describe("simple blocks", () => {
    test("matches empty block", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [],
        new Literal("close", "}")
      );
      const result = block.exec("{}");
      expect(result.ast).not.toBeNull();
      expect(result.ast!.value).toBe("{}");
      expect(result.ast!.children.length).toBe(2);
      expect(result.ast!.children[0].value).toBe("{");
      expect(result.ast!.children[1].value).toBe("}");
    });

    test("matches block with content", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [new Regex("content", "[^{}]+")],
        new Literal("close", "}")
      );
      const result = block.exec("{hello}");
      expect(result.ast).not.toBeNull();
      expect(result.ast!.value).toBe("{hello}");
      expect(result.ast!.children.length).toBe(3);
      expect(result.ast!.children[0].value).toBe("{");
      expect(result.ast!.children[1].value).toBe("hello");
      expect(result.ast!.children[2].value).toBe("}");
    });

    test("empty content array skips inner text", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [],
        new Literal("close", "}")
      );
      const cursor = new Cursor("{stuff inside}");
      const node = block.parse(cursor);
      expect(node).not.toBeNull();
      expect(node!.firstIndex).toBe(0);
      expect(node!.lastIndex).toBe(13);
      expect(node!.children.length).toBe(2);
      expect(node!.children[0].value).toBe("{");
      expect(node!.children[1].value).toBe("}");
    });

    test("empty content array with empty block", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [],
        new Literal("close", "}")
      );
      const result = block.exec("{}");
      expect(result.ast).not.toBeNull();
      expect(result.ast!.children.length).toBe(2);
    });

    test("empty content array with nested delimiters", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [],
        new Literal("close", "}")
      );
      const cursor = new Cursor("{ { } }");
      const node = block.parse(cursor);
      expect(node).not.toBeNull();
      expect(node!.firstIndex).toBe(0);
      expect(node!.lastIndex).toBe(6);
      expect(node!.children.length).toBe(2);
    });

    test("matches block with whitespace content", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [new Regex("content", "\\s+")],
        new Literal("close", "}")
      );
      const result = block.exec("{ }");
      expect(result.ast).not.toBeNull();
      expect(result.ast!.value).toBe("{ }");
    });

    test("matches parenthesized block", () => {
      const block = new Block(
        "parens",
        new Literal("open", "("),
        [new Regex("content", "[^()]+")],
        new Literal("close", ")")
      );
      const result = block.exec("(hello)");
      expect(result.ast).not.toBeNull();
      expect(result.ast!.value).toBe("(hello)");
    });

    test("matches block with multi-char delimiters", () => {
      const block = new Block(
        "begin-end",
        new Literal("open", "BEGIN"),
        [new Regex("content", "[^BE]+")],
        new Literal("close", "END")
      );
      const result = block.exec("BEGIN stuff END");
      expect(result.ast).not.toBeNull();
      expect(result.ast!.value).toBe("BEGIN stuff END");
    });
  });

  describe("nested blocks", () => {
    test("scan finds matching close past nested braces", () => {
      // Empty content patterns — just testing that the scan finds the right close
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [],
        new Literal("close", "}")
      );
      const cursor = new Cursor("{ { } }");
      const node = block.parse(cursor);
      expect(node).not.toBeNull();
      expect(node!.firstIndex).toBe(0);
      expect(node!.lastIndex).toBe(6); // last } at index 6
    });

    test("counts nesting depth correctly", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [],
        new Literal("close", "}")
      );
      const cursor = new Cursor("{ { { } } }");
      const node = block.parse(cursor);
      expect(node).not.toBeNull();
      expect(node!.firstIndex).toBe(0);
      expect(node!.lastIndex).toBe(10); // last } at index 10
    });

    test("nested blocks with recursive content", () => {
      // Inner block as content pattern — demonstrates real nested parsing
      const innerBlock = new Block(
        "inner",
        new Literal("open", "{"),
        [],
        new Literal("close", "}")
      );
      const ws = new Optional("ws", new Regex("whitespace", "\\s+"));
      const block = new Block(
        "outer",
        new Literal("open", "{"),
        [ws, innerBlock, ws],
        new Literal("close", "}")
      );
      const result = block.exec("{ {} }");
      expect(result.ast).not.toBeNull();
      expect(result.ast!.value).toBe("{ {} }");
      // open + ws + innerBlock + ws + close
      const children = result.ast!.children;
      expect(children[0].value).toBe("{");
      expect(children[children.length - 1].value).toBe("}");
    });

    test("graceful close when opens outnumber closes", () => {
      // Content has an unmatched inner open — scanner falls back to the last close found
      const block = new Block(
        "tag",
        new Literal("open", "<task>"),
        [new Regex("content", "[\\s\\S]+")],
        new Literal("close", "</task>")
      );
      // The inner <task> has no matching </task>, but the outer block
      // should gracefully close at the last </task> it finds
      const cursor = new Cursor("<task>stuff <task> more stuff</task>");
      const node = block.parse(cursor);
      expect(node).not.toBeNull();
      expect(node!.firstIndex).toBe(0);
      expect(node!.lastIndex).toBe(35);
      expect(node!.children[0].value).toBe("<task>");
      expect(node!.children[node!.children.length - 1].value).toBe("</task>");
    });

    test("graceful close with multiple unmatched opens", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [],
        new Literal("close", "}")
      );
      // Two opens, one close — falls back to the last close found
      const cursor = new Cursor("{ { { }");
      const node = block.parse(cursor);
      expect(node).not.toBeNull();
      expect(node!.firstIndex).toBe(0);
      expect(node!.lastIndex).toBe(6);
    });

    test("still fails when no close delimiter exists at all", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [],
        new Literal("close", "}")
      );
      const cursor = new Cursor("{ no close here");
      const node = block.parse(cursor);
      expect(node).toBeNull();
    });

    test("adjacent blocks after first block", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [new Regex("content", "[^{}]+")],
        new Literal("close", "}")
      );
      const cursor = new Cursor("{a}{b}");
      const first = block.parse(cursor);
      expect(first).not.toBeNull();
      expect(first!.value).toBe("{a}");
      expect(cursor.index).toBe(2);

      cursor.next();
      const second = block.parse(cursor);
      expect(second).not.toBeNull();
      expect(second!.value).toBe("{b}");
    });
  });

  describe("error cases", () => {
    test("returns null for unmatched open", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [],
        new Literal("close", "}")
      );
      const result = block.exec("{");
      expect(result.ast).toBeNull();
    });

    test("returns null when input doesn't start with open", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [],
        new Literal("close", "}")
      );
      const result = block.exec("x{}");
      expect(result.ast).toBeNull();
    });

    test("returns null for empty input", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [],
        new Literal("close", "}")
      );
      const result = block.exec("");
      expect(result.ast).toBeNull();
    });
  });

  describe("content patterns", () => {
    test("matches multiple content patterns in sequence", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [
          new Regex("name", "[a-z]+"),
          new Literal("colon", ":"),
          new Regex("value", "[a-z]+"),
        ],
        new Literal("close", "}")
      );
      const result = block.exec("{foo:bar}");
      expect(result.ast).not.toBeNull();
      expect(result.ast!.value).toBe("{foo:bar}");
      expect(result.ast!.children.length).toBe(5); // open + 3 content + close
      expect(result.ast!.children[1].value).toBe("foo");
      expect(result.ast!.children[2].value).toBe(":");
      expect(result.ast!.children[3].value).toBe("bar");
    });

    test("handles optional content patterns", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [new Optional("maybe", new Regex("content", "[a-z]+"))],
        new Literal("close", "}")
      );
      // Empty block with optional content
      const result = block.exec("{}");
      expect(result.ast).not.toBeNull();
      expect(result.ast!.value).toBe("{}");
    });
  });

  describe("used with cursor directly", () => {
    test("parse advances cursor correctly", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [],
        new Literal("close", "}")
      );
      const cursor = new Cursor("{} rest");
      const node = block.parse(cursor);
      expect(node).not.toBeNull();
      expect(node!.value).toBe("{}");
      // Cursor should be positioned on the last char of close delimiter
      expect(cursor.index).toBe(1);
    });

    test("parse restores cursor on failure", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [],
        new Literal("close", "}")
      );
      const cursor = new Cursor("hello");
      const startIndex = cursor.index;
      block.parse(cursor);
      expect(cursor.index).toBe(startIndex);
    });
  });

  describe("clone", () => {
    test("clone creates independent copy", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [new Regex("content", "[^{}]+")],
        new Literal("close", "}")
      );
      const cloned = block.clone("braces-copy") as Block;
      expect(cloned.name).toBe("braces-copy");
      expect(cloned.type).toBe("block");
      expect(cloned.id).toBe(block.id);
    });
  });

  describe("metadata", () => {
    test("has correct type", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [],
        new Literal("close", "}")
      );
      expect(block.type).toBe("block");
    });

    test("has correct name", () => {
      const block = new Block(
        "my-block",
        new Literal("open", "{"),
        [],
        new Literal("close", "}")
      );
      expect(block.name).toBe("my-block");
    });

    test("children includes open, content, and close patterns", () => {
      const content = new Regex("content", "[^{}]+");
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [content],
        new Literal("close", "}")
      );
      expect(block.children.length).toBe(3);
    });

    test("getTokens returns open pattern tokens", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        [],
        new Literal("close", "}")
      );
      expect(block.getTokens()).toEqual(["{"]);
    });
  });
});
