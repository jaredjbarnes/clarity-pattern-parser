import Pattern from "./patterns/Pattern";
import Node from "./ast/Node";
import ParseError from "./patterns/ParseError";

export interface Match {
  pattern: Pattern | null;
  astNode: Node | null;
}

export default class CursorHistory {
  public isRecording: boolean;
  public furthestMatch: Match;
  public furthestError: ParseError | null;
  public patterns: Pattern[];
  public astNodes: Node[];
  public errors: ParseError[];

  constructor() {
    this.isRecording = false;

    this.furthestMatch = {
      pattern: null,
      astNode: null,
    };

    this.furthestError = null;

    this.patterns = [];
    this.astNodes = [];
    this.errors = [];
  }

  addMatch(pattern: Pattern, astNode: Node) {
    if (this.isRecording) {
      this.patterns.push(pattern);
      this.astNodes.push(astNode);
    }

    if (
      this.furthestMatch.astNode == null ||
      astNode.endIndex >= this.furthestMatch.astNode.endIndex
    ) {
      this.furthestMatch.pattern = pattern;
      this.furthestMatch.astNode = astNode;
    }
  }

  addError(error: ParseError) {
    if (this.isRecording) {
      this.errors.push(error);
    }

    if (this.furthestError == null || error.index >= this.furthestError.index) {
      this.furthestError = error;
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
    this.astNodes.length = 0;
    this.errors.length = 0;
  }

  getFurthestError() {
    return this.furthestError;
  }

  getFurthestMatch() {
    return this.furthestMatch;
  }

  getLastMatch() {
    if (this.isRecording) {
      return {
        pattern: this.patterns[this.patterns.length - 1] || null,
        astNode: this.astNodes[this.astNodes.length - 1] || null,
      } as Match;
    } else {
      return this.furthestMatch as Match;
    }
  }

  getLastError() {
    return this.errors[this.errors.length - 1] || null;
  }

  getAllParseStacks() {
    const stacks = this.astNodes.reduce((acc: Node[][], node) => {
      let container: Node[] = acc[acc.length - 1];

      if (node.startIndex === 0) {
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
            currentNode.startIndex,
            previousNode.startIndex
          );
          const right = Math.min(currentNode.endIndex, previousNode.endIndex);
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
