import { Node } from "../ast/Node";
import { ParseError } from "./ParseError";
import { Pattern } from "./Pattern";
export interface Match {
    pattern: Pattern | null;
    node: Node | null;
}
export interface HistoryRecord {
    pattern: Pattern;
    error: ParseError | null;
    ast: Node | null;
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
    private _cache;
    private _isCacheEnabled;
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
    recordMatch(pattern: Pattern, node: Node, cache?: boolean): void;
    getRecord(pattern: Pattern, startIndex: number): HistoryRecord | null;
    private _buildKeyFromRecord;
    recordErrorAt(startIndex: number, lastIndex: number, pattern: Pattern, cache?: boolean): void;
    resolveError(): void;
    startRecording(): void;
    stopRecording(): void;
    disableCache(): void;
    enableCache(): void;
}
