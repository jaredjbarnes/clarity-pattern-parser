import { Node } from "../ast/Node";
import { CursorHistory, Match } from "./CursorHistory";
import { ParseError } from "./ParseError";
import { Pattern } from "./Pattern";

export class Cursor {
  private _text: string;
  private _index: number;
  private _length: number;
  private _history: CursorHistory;

  get text(): string {
    return this._text;
  }

  get isOnFirst(): boolean {
    return this._index === 0;
  }

  get isOnLast(): boolean {
    return this._index === this.getLastIndex();
  }

  get isRecording(): boolean {
    return this._history.isRecording;
  }

  get rootMatch(): Match {
    return this._history.rootMatch;
  }

  get allMatchedNodes(): Node[] {
    return this._history.nodes;
  }

  get allMatchedPatterns(): Pattern[] {
    return this._history.patterns;
  }

  get leafMatch(): Match {
    return this._history.leafMatch;
  }

  get leafMatches(): Match[] {
    return this._history.leafMatches;
  }

  get furthestError(): ParseError | null {
    return this._history.furthestError;
  }

  get error() {
    return this._history.error;
  }

  get errors() {
    return this._history.errors;
  }

  get records() {
    return this._history.records;
  }

  get index(): number {
    return this._index;
  }

  get length(): number {
    return this._length;
  }

  get hasError(): boolean {
    return this._history.error != null;
  }

  get currentChar(): string {
    return this._text[this._index];
  }

  constructor(text: string) {
    this._text = text;
    this._index = 0;
    this._length = [...text].length;
    this._history = new CursorHistory();
  }

  hasNext(): boolean {
    return this._index + 1 < this._length;
  }

  next(): void {
    if (this.hasNext()) {
      this._index++;
    }
  }

  hasPrevious(): boolean {
    return this._index - 1 >= 0;
  }

  previous(): void {
    if (this.hasPrevious()) {
      this._index--;
    }
  }

  moveTo(position: number): void {
    if (position >= 0 && position < this._length) {
      this._index = position;
    }
  }

  moveToFirstChar(): void {
    this._index = 0;
  }

  moveToLastChar(): void {
    this._index = this.getLastIndex();
  }

  getLastIndex(): number {
    return this._length - 1;
  }

  getChars(first: number, last: number): string {
    return this._text.slice(first, last + 1);
  }

  recordMatch(pattern: Pattern, node: Node): void {
    this._history.recordMatch(pattern, node);
  }

  recordErrorAt(startIndex: number, lastIndex: number, onPattern: Pattern): void {
    this._history.recordErrorAt(startIndex, lastIndex, onPattern);
  }

  resolveError(): void {
    this._history.resolveError();
  }

  startRecording(): void {
    this._history.startRecording();
  }

  stopRecording(): void {
    this._history.stopRecording();
  }

}
