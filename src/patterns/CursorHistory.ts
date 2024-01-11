import { Node } from "../ast/Node";
import { ParseError } from "./ParseError";
import { Pattern } from "./Pattern";

export interface Match {
  pattern: Pattern | null;
  node: Node | null;
}

export class CursorHistory {
  private _isRecording: boolean = false;
  private _leafMatch: Match = { pattern: null, node: null };
  private _err: ParseError | null = null;
  private _rootMatch: Match = { pattern: null, node: null };
  private _patterns: Pattern[] = [];
  private _nodes: Node[] = [];
  private _errors: ParseError[] = [];

  addMatch(pattern: Pattern, node: Node): void {
    if (this._isRecording) {
      this._patterns.push(pattern);
      this._nodes.push(node);
    }

    this._rootMatch.pattern = pattern;
    this._rootMatch.node = node;

    const isFurthestMatch =
      this._leafMatch.node === null || node.lastIndex > this._leafMatch.node.lastIndex;

    if (isFurthestMatch) {
      this._leafMatch.pattern = pattern;
      this._leafMatch.node = node;
    }
  }

  addErrorAt(index: number, pattern: Pattern): void {
    const error = new ParseError(index, pattern);

    if (this._err === null || index > this._err.index) {
      this._err = error;
    }

    if (this._isRecording) {
      this._errors.push(error);
    }
  }

  startRecording(): void {
    this._isRecording = true;
  }

  stopRecording(): void {
    this._isRecording = false;
  }

  get leafMatch(): Match {
    return this._leafMatch;
  }

  get error(): ParseError | null {
    return this._err;
  }

  get isRecording(): boolean {
    return this._isRecording;
  }

  get errors(): ParseError[] {
    return this._errors;
  }

  get nodes(): Node[] {
    return this._nodes;
  }

  get patterns(): Pattern[] {
    return this._patterns;
  }

  get rootMatch(): Match {
    return this._rootMatch;
  }
}
