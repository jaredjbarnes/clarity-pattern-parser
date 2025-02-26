import { Node } from "../ast/Node";
import { ParseError } from "./ParseError";
import { Pattern } from "./Pattern";
import { HistoryRecord } from "./HistoryRecord";
export interface Match {
    pattern: Pattern | null;
    node: Node | null;
}
export declare class CursorHistory {
    private _isRecording;
    private _leafMatches;
    private _furthestError;
    private _currentError;
    private _rootMatch;
    private _patterns;
    private _nodes;
    private _errors;
    private _records;
    get isRecording(): boolean;
    get rootMatch(): Match;
    get leafMatch(): Match;
    get leafMatches(): Match[];
    get furthestError(): ParseError | null;
    get errors(): ParseError[];
    get error(): ParseError | null;
    get records(): HistoryRecord[];
    get nodes(): Node[];
    get patterns(): Pattern[];
    recordMatch(pattern: Pattern, node: Node): void;
    recordErrorAt(startIndex: number, lastIndex: number, pattern: Pattern): void;
    resolveError(): void;
    startRecording(): void;
    stopRecording(): void;
}
