import { Pattern } from "./Pattern";
export declare class ParseError {
    readonly firstIndex: number;
    readonly startIndex: number;
    readonly endIndex: number;
    readonly lastIndex: number;
    readonly pattern: Pattern;
    constructor(startIndex: number, lastIndex: number, pattern: Pattern);
}
