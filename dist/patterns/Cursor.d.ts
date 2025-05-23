import { Node } from "../ast/Node";
import { Match } from "./CursorHistory";
import { ParseError } from "./ParseError";
import { Pattern } from "./Pattern";
export declare class Cursor {
    private _text;
    private _index;
    private _length;
    private _history;
    get text(): string;
    get isOnFirst(): boolean;
    get isOnLast(): boolean;
    get isRecording(): boolean;
    get rootMatch(): Match;
    get allMatchedNodes(): Node[];
    get allMatchedPatterns(): Pattern[];
    get leafMatch(): Match;
    get leafMatches(): Match[];
    get furthestError(): ParseError | null;
    get error(): ParseError | null;
    get errors(): ParseError[];
    get records(): import("./HistoryRecord").HistoryRecord[];
    get index(): number;
    get length(): number;
    get hasError(): boolean;
    get currentChar(): string;
    constructor(text: string);
    hasNext(): boolean;
    next(): void;
    hasPrevious(): boolean;
    previous(): void;
    moveTo(position: number): void;
    moveToFirstChar(): void;
    moveToLastChar(): void;
    getLastIndex(): number;
    getChars(first: number, last: number): string;
    recordMatch(pattern: Pattern, node: Node): void;
    recordErrorAt(startIndex: number, lastIndex: number, onPattern: Pattern): void;
    resolveError(): void;
    startRecording(): void;
    stopRecording(): void;
}
