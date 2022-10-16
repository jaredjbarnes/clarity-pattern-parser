import Pattern from "./patterns/Pattern";
import Node from "./ast/Node";
import ParseError from "./patterns/ParseError";
export interface Match {
    pattern: Pattern | null;
    astNode: Node | null;
}
export default class CursorHistory {
    isRecording: boolean;
    furthestMatch: Match;
    furthestError: ParseError | null;
    patterns: Pattern[];
    astNodes: Node[];
    errors: ParseError[];
    constructor();
    addMatch(pattern: Pattern, astNode: Node): void;
    addError(error: ParseError): void;
    startRecording(): void;
    stopRecording(): void;
    clear(): void;
    getFurthestError(): ParseError | null;
    getFurthestMatch(): Match;
    getLastMatch(): Match;
    getLastError(): ParseError;
    getAllParseStacks(): Node[][];
    getLastParseStack(): Node[];
}
