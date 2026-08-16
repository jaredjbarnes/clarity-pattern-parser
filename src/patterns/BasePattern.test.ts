import { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import { Cursor } from "./Cursor";
import { Literal } from "./Literal";
import { Pattern } from "./Pattern";
import { Sequence } from "./Sequence";

/**
 * Mirrors the "Custom Patterns" example in the README. If this stops compiling
 * or passing, the documented extension story is broken.
 */
class CustomPattern extends BasePattern {
  constructor(name: string) {
    super("custom", name);
  }

  parse(cursor: Cursor): Node | null {
    this._firstIndex = cursor.index;
    const node = Node.createValueNode("custom", this._name, "");
    cursor.recordMatch(this, node);
    return node;
  }

  clone(name = this.name): Pattern {
    const clone = new CustomPattern(name);
    clone._cloneIdFrom(this);
    return clone;
  }

  getTokens(): string[] {
    return [];
  }

  getTokensAfter(_child: Pattern): string[] {
    return [];
  }

  getPatterns(): Pattern[] {
    return [this];
  }

  getPatternsAfter(_child: Pattern): Pattern[] {
    return [];
  }
}

describe("BasePattern", () => {
  test("a subclass satisfies the Pattern interface", () => {
    const pattern: Pattern = new CustomPattern("custom");

    expect(pattern.type).toBe("custom");
    expect(pattern.name).toBe("custom");
    expect(pattern.parent).toBeNull();
    expect(pattern.children).toEqual([]);
  });

  test("derives its id from the type", () => {
    expect(new CustomPattern("a").id).toMatch(/^custom-\d+$/);
  });

  test("mints a unique id per instance", () => {
    expect(new CustomPattern("a").id).not.toBe(new CustomPattern("a").id);
  });

  test("clone carries the id across, which recursion detection depends on", () => {
    const original = new CustomPattern("a");
    const clone = original.clone("b");

    expect(clone.id).toBe(original.id);
    expect(clone.name).toBe("b");
  });

  test("exec and test are provided by the base", () => {
    const literal = new Literal("a", "A");

    expect(literal.test("A")).toBe(true);
    expect(literal.test("B")).toBe(false);
    expect(literal.exec("A").ast?.value).toBe("A");
  });

  test("getNextTokens returns empty without a parent", () => {
    expect(new CustomPattern("a").getNextTokens()).toEqual([]);
  });

  test("getNextPatterns returns empty without a parent", () => {
    expect(new CustomPattern("a").getNextPatterns()).toEqual([]);
  });

  test("getNextTokens delegates to the parent when there is one", () => {
    const sequence = new Sequence("sequence", [
      new Literal("a", "A"),
      new Literal("b", "B"),
    ]);
    const first = sequence.children[0];

    expect(first.getNextTokens()).toEqual(["B"]);
  });

  test("a custom pattern composes with the built-ins", () => {
    const sequence = new Sequence("sequence", [
      new Literal("a", "A"),
      new CustomPattern("custom"),
    ]);

    // Composites clone their children, so the instance in the tree is a copy.
    expect(sequence.children).toHaveLength(2);
    expect(sequence.children[1].type).toBe("custom");
    expect(sequence.children[1].parent).toBe(sequence);
  });
});
