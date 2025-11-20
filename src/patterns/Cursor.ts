import { Node } from "../ast/Node";
import { CursorHistory, Match } from "./CursorHistory";
import { ParseError } from "./ParseError";
import { Pattern } from "./Pattern";

const segmenter = new Intl.Segmenter("und", { granularity: "grapheme" });

export class Cursor {
  private _text: string;
  private _charSize: number[];
  private _charMap: number[];
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
    const index = this.getCharStartIndex(this._index);
    return this.text.slice(index, index + this._charSize[index]);
  }

  constructor(text: string) {
    this._text = text;
    this._length = text.length;
    this._charSize = [];
    this._charMap = [];

    this._index = 0;
    this._history = new CursorHistory();

    let index = 0;
    for (const segment of segmenter.segment(text)) {
      const size = segment.segment.length;
      for (let i = 0; i < size; i++) {
        this._charMap.push(index);
        this._charSize.push(size);
      }
      index += size;
    }
  }

  hasNext(): boolean {
    const index = this._charMap[this._index];
    const charSize = this._charSize[index];
    return index + charSize < this._length;
  }

  next(): void {
    if (this.hasNext()) {
      const index = this._charMap[this._index];
      const size = this._charSize[index];
      this.moveTo(index + size);
    }
  }

  hasPrevious(): boolean {
    const index = this._charMap[this._index];
    const previousIndex = this._charMap[index - 1] ?? -1;

    return previousIndex >= 0;
  }

  previous(): void {
    if (this.hasPrevious()) {
      const index = this._charMap[this._index];
      const previousIndex = this._charMap[index - 1] ?? -1;;
      this.moveTo(previousIndex);
    }
  }

  moveTo(position: number): void {
    if (position >= 0 && position < this._length) {
      this._index = this._charMap[position];
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

  substring(first: number, last: number): string {
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

  getCharStartIndex(index: number): number {
    return this._charMap[index];
  }

  getCharEndIndex(index: number): number {
    let startIndex = this.getCharStartIndex(index);
    return startIndex + this._charSize[startIndex] ?? 1;
  }

  getCharLastIndex(index: number): number {
    return this.getCharEndIndex(index) - 1 ?? 0;
  }

}
