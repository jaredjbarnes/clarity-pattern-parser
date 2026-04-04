import { Block } from "./Block";
import { Literal } from "./Literal";
import { Regex } from "./Regex";
import { Optional } from "./Optional";
import { Sequence } from "./Sequence";
import { Cursor } from "./Cursor";
import { Reference } from "./Reference";

describe("Block", () => {
  describe("simple blocks", () => {
    test("matches empty block", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        null,
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
        new Regex("content", "[^{}]+"),
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

    test("null content skips inner text", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        null,
        new Literal("close", "}")
      );
      const cursor = new Cursor("{stuff inside}");
      const node = block.parse(cursor);
      expect(node).not.toBeNull();
      expect(node!.firstIndex).toBe(0);
      expect(node!.lastIndex).toBe(13);
      expect(node!.children.length).toBe(3);
      expect(node!.children[0].value).toBe("{");
      expect(node!.children[1].value).toBe("stuff inside");
      expect(node!.children[1].name).toBe("braces-content");
      expect(node!.children[2].value).toBe("}");
    });

    test("null content with empty block", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        null,
        new Literal("close", "}")
      );
      const result = block.exec("{}");
      expect(result.ast).not.toBeNull();
      expect(result.ast!.children.length).toBe(2);
    });

    test("null content with nested delimiters", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        null,
        new Literal("close", "}")
      );
      const cursor = new Cursor("{ { } }");
      const node = block.parse(cursor);
      expect(node).not.toBeNull();
      expect(node!.firstIndex).toBe(0);
      expect(node!.lastIndex).toBe(6);
      expect(node!.children.length).toBe(3);
      expect(node!.children[1].value).toBe(" { } ");
    });

    test("matches block with whitespace content", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        new Regex("content", "\\s+"),
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
        new Regex("content", "[^()]+"),
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
        new Regex("content", "[^BE]+"),
        new Literal("close", "END")
      );
      const result = block.exec("BEGIN stuff END");
      expect(result.ast).not.toBeNull();
      expect(result.ast!.value).toBe("BEGIN stuff END");
    });
  });

  describe("nested blocks", () => {
    test("scan finds matching close past nested braces", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        null,
        new Literal("close", "}")
      );
      const cursor = new Cursor("{ { } }");
      const node = block.parse(cursor);
      expect(node).not.toBeNull();
      expect(node!.firstIndex).toBe(0);
      expect(node!.lastIndex).toBe(6);
    });

    test("counts nesting depth correctly", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        null,
        new Literal("close", "}")
      );
      const cursor = new Cursor("{ { { } } }");
      const node = block.parse(cursor);
      expect(node).not.toBeNull();
      expect(node!.firstIndex).toBe(0);
      expect(node!.lastIndex).toBe(10);
    });

    test("nested blocks with recursive content", () => {
      const innerBlock = new Block(
        "inner",
        new Literal("open", "{"),
        null,
        new Literal("close", "}")
      );
      const ws = new Optional("ws", new Regex("whitespace", "\\s+"));
      const block = new Block(
        "outer",
        new Literal("open", "{"),
        new Sequence("content", [ws, innerBlock, ws]),
        new Literal("close", "}")
      );
      const result = block.exec("{ {} }");
      expect(result.ast).not.toBeNull();
      expect(result.ast!.value).toBe("{ {} }");
      const children = result.ast!.children;
      expect(children[0].value).toBe("{");
      expect(children[children.length - 1].value).toBe("}");
    });

    test("graceful close when opens outnumber closes", () => {
      // With null content, the scanner finds the matching close
      // and the block captures open + close only
      const block = new Block(
        "tag",
        new Literal("open", "<task>"),
        null,
        new Literal("close", "</task>")
      );
      const cursor = new Cursor("<task>stuff <task> more stuff</task>");
      const node = block.parse(cursor);
      expect(node).not.toBeNull();
      expect(node!.firstIndex).toBe(0);
      expect(node!.children[0].value).toBe("<task>");
      expect(node!.children[node!.children.length - 1].value).toBe("</task>");
    });

    test("graceful close with multiple unmatched opens", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        null,
        new Literal("close", "}")
      );
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
        null,
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
        new Regex("content", "[^{}]+"),
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
        null,
        new Literal("close", "}")
      );
      const result = block.exec("{");
      expect(result.ast).toBeNull();
    });

    test("returns null when input doesn't start with open", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        null,
        new Literal("close", "}")
      );
      const result = block.exec("x{}");
      expect(result.ast).toBeNull();
    });

    test("returns null for empty input", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        null,
        new Literal("close", "}")
      );
      const result = block.exec("");
      expect(result.ast).toBeNull();
    });
  });

  describe("content patterns", () => {
    test("matches sequence content pattern", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        new Sequence("content", [
          new Regex("name", "[a-z]+"),
          new Literal("colon", ":"),
          new Regex("value", "[a-z]+"),
        ]),
        new Literal("close", "}")
      );
      const result = block.exec("{foo:bar}");
      expect(result.ast).not.toBeNull();
      expect(result.ast!.value).toBe("{foo:bar}");
      // open + sequence content + close
      expect(result.ast!.children.length).toBe(3);
      // The sequence node contains the individual parts
      const contentNode = result.ast!.children[1];
      expect(contentNode.children[0].value).toBe("foo");
      expect(contentNode.children[1].value).toBe(":");
      expect(contentNode.children[2].value).toBe("bar");
    });

    test("handles optional content pattern", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        new Optional("maybe", new Regex("content", "[a-z]+")),
        new Literal("close", "}")
      );
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
        null,
        new Literal("close", "}")
      );
      const cursor = new Cursor("{} rest");
      const node = block.parse(cursor);
      expect(node).not.toBeNull();
      expect(node!.value).toBe("{}");
      expect(cursor.index).toBe(1);
    });

    test("parse restores cursor on failure", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        null,
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
        new Regex("content", "[^{}]+"),
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
        null,
        new Literal("close", "}")
      );
      expect(block.type).toBe("block");
    });

    test("has correct name", () => {
      const block = new Block(
        "my-block",
        new Literal("open", "{"),
        null,
        new Literal("close", "}")
      );
      expect(block.name).toBe("my-block");
    });

    test("children includes open, content, and close patterns", () => {
      const content = new Regex("content", "[^{}]+");
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        content,
        new Literal("close", "}")
      );
      expect(block.children.length).toBe(3);
    });

    test("children without content has open and close only", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        null,
        new Literal("close", "}")
      );
      expect(block.children.length).toBe(2);
    });

    test("getTokens returns open pattern tokens", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        null,
        new Literal("close", "}")
      );
      expect(block.getTokens()).toEqual(["{"]);
    });

    test("test with other pattern", () => {
      const anyChar = new Regex("content", "[^{}]*");
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        anyChar,
        new Literal("close", "}")
      );
      const {ast} = block.exec("{text}");
      expect(ast?.value).toBe("{text}");
    });

    test("test with sequence content", () => {
      const anyChar = new Regex("content", "[^{}}]+");
      const refBlock = new Reference("braces");

      const block = new Block(
        "braces",
        new Literal("open", "{"),
        new Sequence("content", [anyChar, new Optional("ref", refBlock)]),
        new Literal("close", "}")
      );
      const {ast} = block.exec("{text{inner}}");

      expect(ast?.value).toBe("{text{inner}}");
    });
  });

  describe("unicode and emoji", () => {
    test("wildcard block with emoji content", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        null,
        new Literal("close", "}")
      );
      const result = block.exec("{🔴🟢🔵}");
      expect(result.ast).not.toBeNull();
      expect(result.ast!.value).toBe("{🔴🟢🔵}");
    });

    test("block with emoji delimiters", () => {
      const block = new Block(
        "stars",
        new Literal("open", "🌟"),
        new Regex("content", "[^🌟]+"),
        new Literal("close", "🌟")
      );
      const result = block.exec("🌟hello🌟");
      expect(result.ast).not.toBeNull();
      expect(result.ast!.value).toBe("🌟hello🌟");
    });

    test("block with multi-char emoji delimiters", () => {
      const block = new Block(
        "arrows",
        new Literal("open", "➡️"),
        null,
        new Literal("close", "⬅️")
      );
      const result = block.exec("➡️content here⬅️");
      expect(result.ast).not.toBeNull();
      expect(result.ast!.value).toBe("➡️content here⬅️");
    });

    test("nested blocks with emoji content between", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        null,
        new Literal("close", "}")
      );
      const cursor = new Cursor("{🔴{🟢}🔵}");
      const node = block.parse(cursor);
      expect(node).not.toBeNull();
      expect(node!.value).toBe("{🔴{🟢}🔵}");
    });

    test("block with combining characters in content", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        null,
        new Literal("close", "}")
      );
      // e + combining acute = é
      const result = block.exec("{cafe\u0301}");
      expect(result.ast).not.toBeNull();
      expect(result.ast!.value).toBe("{cafe\u0301}");
    });

    test("cursor position correct after emoji block", () => {
      const block = new Block(
        "braces",
        new Literal("open", "{"),
        null,
        new Literal("close", "}")
      );
      const cursor = new Cursor("{🔴} rest");
      const node = block.parse(cursor);
      expect(node).not.toBeNull();
      expect(node!.value).toBe("{🔴}");
      // Cursor should be on the close delimiter
      expect(cursor.currentChar).toBe("}");
    });
  });
});
