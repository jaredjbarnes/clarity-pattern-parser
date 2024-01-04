import Pattern from "./Pattern";
import Node from "../ast/Node";
import ParseError from "./ParseError";

export interface Match {
  pattern: Pattern | null;
  node: Node | null;
}

export default class CursorHistory {
  public isRecording: boolean;
  public rootMatch: Match;
  public leafMatch: Match;
  public error: ParseError | null;
  public patterns: Pattern[];
  public nodes: Node[];
  public errors: ParseError[];

  constructor() {
    this.isRecording = false;

    this.leafMatch = {
      pattern: null,
      node: null,
    };

    this.rootMatch = {
      pattern: null,
      node: null,
    };

    this.error = null;

    this.patterns = [];
    this.nodes = [];
    this.errors = [];
  }

  addMatch(pattern: Pattern, node: Node) {
    if (this.isRecording) {
      this.patterns.push(pattern);
      this.nodes.push(node);
    }

    this.rootMatch.pattern = pattern;
    this.rootMatch.node = node;

    const isFurthestMatch =
      this.leafMatch.node == null ||
      node.lastIndex > this.leafMatch.node.lastIndex;

    if (isFurthestMatch) {
      this.leafMatch.pattern = pattern;
      this.leafMatch.node = node;
    }
  }

  addError(error: ParseError) {
    if (this.isRecording) {
      this.errors.push(error);
    }

    if (this.error == null || error.index >= this.error.index) {
      this.error = error;
    }
  }

  startRecording() {
    this.isRecording = true;
  }

  stopRecording() {
    this.isRecording = false;
    this.clear();
  }

  clear() {
    this.patterns.length = 0;
    this.nodes.length = 0;
    this.errors.length = 0;
  }

  getFurthestError() {
    return this.error;
  }

  getFurthestMatch() {
    return this.leafMatch;
  }

  getLastMatch() {
    if (this.isRecording) {
      return {
        pattern: this.patterns[this.patterns.length - 1] || null,
        node: this.nodes[this.nodes.length - 1] || null,
      } as Match;
    } else {
      return this.leafMatch as Match;
    }
  }

  getLastError() {
    return this.errors[this.errors.length - 1] || null;
  }

  getAllParseStacks() {
    const stacks = this.nodes.reduce((acc: Node[][], node) => {
      let container: Node[] = acc[acc.length - 1];

      if (node.firstIndex === 0) {
        container = [];
        acc.push(container);
      }

      container.push(node);

      return acc;
    }, []);

    // There are times when the matching will fail and hit again on the same node.
    // This filters them out.
    // We simply check to see if there is any overlap with the previous one,
    // and if there is we don't add it. This is why we move backwards.
    const cleanedStack = stacks.map((stack: Node[]) => {
      const cleanedStack = [];

      for (let x = stack.length - 1; x >= 0; x--) {
        const currentNode = stack[x];
        const previousNode = stack[x + 1];

        if (previousNode == null) {
          cleanedStack.unshift(currentNode);
        } else {
          const left = Math.max(
            currentNode.firstIndex,
            previousNode.firstIndex
          );
          const right = Math.min(currentNode.lastIndex, previousNode.lastIndex);
          const isOverlapping = left <= right;

          if (!isOverlapping) {
            cleanedStack.unshift(currentNode);
          }
        }
      }
      return cleanedStack;
    });

    return cleanedStack;
  }

  getLastParseStack(): Node[] {
    const stacks = this.getAllParseStacks();
    return stacks[stacks.length - 1] || [];
  }
}
