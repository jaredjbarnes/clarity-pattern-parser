import { Pattern, Node, ParseError } from "..";
import { CursorHistory, Match } from "./CursorHistory";

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
    return this._index === this._getLastIndex();
  }

  get isRecording(): boolean {
    return this._history.isRecording;
  }

  get leafMatch(): Match {
    return this._history.leafMatch;
  }

  get rootMatch(): Match {
    return this._history.rootMatch;
  }

  get furthestError(): ParseError | null {
    return this._history.furthestError;
  }

  get error() {
    return this._history.error;
  }

  get index(): number {
    return this._index;
  }

  get length(): number {
    return this._length;
  }

  get hasError(): boolean {
    return this._history.error != null
  }

  get currentChar(): string {
    return this._text[this._index]
  }

  constructor(text: string) {
    if (text.length === 0) {
      throw new Error("Cannot have a empty string.");
    }

    this._text = text;
    this._index = 0;
    this._length = text.length;
    this._history = new CursorHistory();
  }

  hasNext(): boolean {
    return this._index + 1 < this._length;
  }

  hasPrevious(): boolean {
    return this._index - 1 >= 0;
  }

  next(): void {
    if (this.hasNext()) {
      this._index++;
    }
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

  moveToBeginning(): void {
    this._index = 0;
  }

  moveToEnd(): void {
    this._index = this._getLastIndex();
  }

  getChars(first: number, last: number): string {
    return this._text.slice(first, last + 1);
  }

  addMatch(pattern: Pattern, node: Node): void {
    this._history.addMatch(pattern, node);
  }

  throwError(index: number, onPattern: Pattern): void {
    this._history.addErrorAt(index, onPattern);
  }

  resolveError(): void {
    this._history.resolveError()
  }

  startRecording(): void {
    this._history.startRecording();
  }

  stopRecording(): void {
    this._history.stopRecording();
  }

  private _getLastIndex(): number {
    return this._length - 1;
  }
}
