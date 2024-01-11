import { Pattern, Node, ParseError } from "..";
import { CursorHistory, Match } from "./CursorHistory";

export class Cursor {
  private _text: string;
  private _index: number;
  private _length: number;
  private _isInErrorState: boolean;
  private _history: CursorHistory;

  get text(): string {
    return this._text;
  }

  get isAtBeginning(): boolean {
    return this._index === 0;
  }

  get isAtEnd(): boolean {
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

  get error(): ParseError | null {
    return this._history.error;
  }

  get index(): number {
    return this._index;
  }

  get length(): number {
    return this._length;
  }

  get hasUnresolvedError(): boolean {
    return this._isInErrorState;
  }

  get currentChar(): string {
    return this._text[this._index]
  }
  
  constructor(text: string) {
    this._text = text;
    this._index = 0;
    this._length = text.length;
    this._isInErrorState = false;
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

  safelyGetChars(first: number, last: number): string {
    const safeStart = Math.max(0, first);
    const safeEnd = Math.min(this._getLastIndex(), last);

    return this.getChars(safeStart, safeEnd);
  }

  throwError(index: number, onPattern: Pattern): void {
    this._isInErrorState = true;
    this._history.addErrorAt(index, onPattern);
  }

  addMatch(pattern: Pattern, node: Node): void {
    this._history.addMatch(pattern, node);
  }

  resolveError(): void {
    this._isInErrorState = false;
  }

  startRecording(): void {
    this._history.startRecording();
  }

  stopRecording(): void {
    this._history.stopRecording();
  }

  didSuccessfullyParse(): boolean {
    return !this.hasUnresolvedError && this.isAtEnd;
  }

  private _getLastIndex(): number {
    return this._length - 1;
  }
}
