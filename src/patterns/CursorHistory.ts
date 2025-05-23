import { Node } from "../ast/Node";
import { ParseError } from "./ParseError";
import { Pattern } from "./Pattern";
import { HistoryRecord } from "./HistoryRecord";

export interface Match {
  pattern: Pattern | null;
  node: Node | null;
}

export class CursorHistory {
  private _isRecording = false;
  private _leafMatches: Match[] = [{ pattern: null, node: null }];
  private _furthestError: ParseError | null = null;
  private _currentError: ParseError | null = null;
  private _rootMatch: Match = { pattern: null, node: null };
  private _patterns: Pattern[] = [];
  private _nodes: Node[] = [];
  private _errors: ParseError[] = [];
  private _records: HistoryRecord[] = [];

  get isRecording(): boolean {
    return this._isRecording;
  }

  get rootMatch(): Match {
    return this._rootMatch;
  }

  get leafMatch(): Match {
    return this._leafMatches[this._leafMatches.length - 1];
  }

  get leafMatches() {
    return this._leafMatches;
  }

  get furthestError(): ParseError | null {
    return this._furthestError;
  }

  get errors(): ParseError[] {
    return this._errors;
  }

  get error(): ParseError | null {
    return this._currentError;
  }

  get records(): HistoryRecord[] {
    return this._records;
  }

  get nodes(): Node[] {
    return this._nodes;
  }

  get patterns(): Pattern[] {
    return this._patterns;
  }

  recordMatch(pattern: Pattern, node: Node): void {
    const record: HistoryRecord = {
      pattern,
      ast: node,
      error: null
    };

    if (this._isRecording) {
      this._patterns.push(pattern);
      this._nodes.push(node);
      this._records.push(record);
    }

    this._rootMatch.pattern = pattern;
    this._rootMatch.node = node;
    const leafMatch = this._leafMatches[this._leafMatches.length - 1];

    const isFurthestMatch =
      leafMatch.node === null || node.lastIndex > leafMatch.node.lastIndex;

    const isSameIndexMatch =
      leafMatch.node === null || node.lastIndex === leafMatch.node.lastIndex;

    if (isFurthestMatch) {
      // This is to save on GC churn.
      const match = this._leafMatches.pop() as Match;
      match.pattern = pattern;
      match.node = node;

      this._leafMatches.length = 0;
      this._leafMatches.push(match);
    } else if (isSameIndexMatch) {
      const isAncestor = this._leafMatches.some((m) => {
        let parent = m.pattern?.parent;

        while (parent != null) {
          if (parent === pattern.parent) {
            return true;
          }
          parent = parent.parent;
        }
        return false;
      });

      if (!isAncestor) {
        this._leafMatches.unshift({ pattern, node });
      }
    }
  }

  recordErrorAt(startIndex: number, lastIndex: number, pattern: Pattern): void {
    const error = new ParseError(startIndex, lastIndex, pattern);
    const record: HistoryRecord = {
      pattern,
      ast: null,
      error
    };

    this._currentError = error;

    if (this._furthestError === null || lastIndex > this._furthestError.lastIndex) {
      this._furthestError = error;
    }

    if (this._isRecording) {
      this._errors.push(error);
      this.records.push(record);
    }
  }

  resolveError() {
    this._currentError = null;
  }

  startRecording(): void {
    this._isRecording = true;
  }

  stopRecording(): void {
    this._isRecording = false;
  }

}
