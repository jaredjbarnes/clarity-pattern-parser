import { Node } from "../ast/Node";
import { ParseError } from "./ParseError";
import { Pattern } from "./Pattern";
export interface Match {
    pattern: Pattern | null;
    node: Node | null;
}
export declare class CursorHistory {
    private _isRecording;
    private _leafMatch;
    private _furthestError;
    private _currentError;
    private _rootMatch;
    private _patterns;
    private _nodes;
    private _errors;
    get leafMatch(): Match;
    get furthestError(): ParseError | null;
    get isRecording(): boolean;
    get errors(): ParseError[];
    get error(): ParseError | null;
    get nodes(): Node[];
    get patterns(): Pattern[];
    get rootMatch(): Match;
    recordMatch(pattern: Pattern, node: Node): void;
    recordErrorAt(index: number, pattern: Pattern): void;
    startRecording(): void;
    stopRecording(): void;
    resolveError(): void;
}
