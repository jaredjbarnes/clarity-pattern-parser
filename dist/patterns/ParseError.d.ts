import { Pattern } from "./Pattern";
export declare class ParseError {
    startIndex: number;
    endIndex: number;
    pattern: Pattern;
    constructor(startIndex: number, endIndex: number, pattern: Pattern);
}
