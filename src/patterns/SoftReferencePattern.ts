import Pattern from "./Pattern";
import Cursor from "../Cursor";

export default class SoftReferencePattern extends Pattern {
  private isRecursing: boolean;

  constructor(name: string) {
    super("soft-reference", name);
    this.isRecursing = false;
  }

  private getRoot() {
    let node = this.parent;
    while (node != null) {
      if (node.parent == null) {
        return node;
      }
      node = node.parent;
    }
    return node;
  }

  private findPattern(): Pattern | null {
    const root = this.getRoot();
    let result: Pattern | null = null;

    if (root == null) {
      return null;
    }

    this.walkTheTree(root, (pattern) => {
      if (
        pattern.name === this.name &&
        pattern != this &&
        pattern.type != "reference"
      ) {
        result = pattern;
        return false;
      }
      return true;
    });

    return result;
  }

  private walkTheTree(
    pattern: Pattern,
    callback: (pattern: Pattern) => boolean
  ) {
    for (let x = 0; x < pattern.children.length; x++) {
      const p = pattern.children[x];
      const continueWalking = this.walkTheTree(p, callback);

      if (!continueWalking) {
        return false;
      }
    }

    return callback(pattern);
  }

  parse(cursor: Cursor) {
    const pattern = this.safelyGetPattern();

    if (pattern == null) {
      return null;
    }

    const node = pattern.parse(cursor);

    if (!cursor.hasUnresolvedError() && node != null) {
      cursor.addMatch(this, node);
    }

    return node;
  }

  clone(name?: string): Pattern {
    if (typeof name !== "string") {
      name = this.name;
    }
    return new SoftReferencePattern(name);
  }

  getTokenValue() {
    const pattern = this.safelyGetPattern();
    if (pattern == null) {
      return null;
    }
    return pattern.getTokenValue();
  }

  private safelyGetPattern() {
    let pattern = this.children[0];
    const hasNoPattern = pattern == null;

    if (hasNoPattern) {
      const reference = this.findPattern();
      if (reference == null) {
        return null;
      }
      pattern = reference;
      this.children = [pattern];
    }


    return pattern;
  }

  getTokens() {
    if (!this.isRecursing) {
      this.isRecursing = true;
      let pattern = this.safelyGetPattern();

      if (pattern == null) {
        return [];
      }

      const tokens = pattern.getTokens();
      this.isRecursing = false;
      return tokens;
    }
    return [];
  }
}
