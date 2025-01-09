import { Node } from "../ast/Node";
import { ParseError } from "./ParseError";
import { Pattern } from "./Pattern";
export interface Trace {
    pattern: Pattern;
    cursorIndex: number;
}
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
    private _trace;
    get isRecording(): boolean;
    get rootMatch(): Match;
    get leafMatch(): Match;
    get leafMatches(): Match[];
    get furthestError(): ParseError | null;
    get errors(): ParseError[];
    get error(): ParseError | null;
    get nodes(): Node[];
    get patterns(): Pattern[];
    get trace(): Trace[];
    recordMatch(pattern: Pattern, node: Node): void;
    recordErrorAt(startIndex: number, endIndex: number, pattern: Pattern): void;
    startRecording(): void;
    stopRecording(): void;
    resolveError(): void;
    pushStackTrace(trace: Trace): void;
}
