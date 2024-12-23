import { Node } from "../ast/Node";
import { CursorHistory, Match, Trace } from "./CursorHistory";
import { ParseError } from "./ParseError";
import { Pattern } from "./Pattern";

export class Cursor {
  private _text: string;
  private _index: number;
  private _length: number;
  private _history: CursorHistory;
  private _stackTrace: Trace[];

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
    this._length = text.length;
    this._history = new CursorHistory();
    this._stackTrace = [];
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

  recordErrorAt(firstIndex: number, lastIndex: number, onPattern: Pattern): void {
    this._history.recordErrorAt(firstIndex, lastIndex, onPattern);
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

  startParseWith(pattern: Pattern) {
    const patternName = pattern.name;

    const trace = {
      pattern,
      cursorIndex: this.index
    };

    if (this._stackTrace.find(t => t.pattern.id === pattern.id && this.index === t.cursorIndex)) {
      throw new Error(`Cyclical Pattern: ${this._stackTrace.map(t => `${t.pattern.name}#${t.pattern.id}{${t.cursorIndex}}`).join(" -> ")} -> ${patternName}#${pattern.id}{${this.index}}.`);
    }

    this._history.pushStackTrace(trace);
    this._stackTrace.push(trace);
  }

  endParse() {
    this._stackTrace.pop();
  }

  audit() {
    return this._history.trace.map(t => {
      const onChar = this.getChars(t.cursorIndex, t.cursorIndex);
      const restChars = this.getChars(t.cursorIndex + 1, t.cursorIndex + 5);
      const context = `{${t.cursorIndex}}[${onChar}]${restChars}`;
      return `${this._buildPatternContext(t.pattern)}-->${context}`;
    });
  }

  private _buildPatternContext(pattern: Pattern) {
    if (pattern.parent != null) {
      return `${pattern.parent.name}.${pattern.name}`;
    }
    return pattern.name;
  }

}
