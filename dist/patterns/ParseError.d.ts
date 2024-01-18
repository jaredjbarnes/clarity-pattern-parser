import { Pattern } from "./Pattern";
export declare class ParseError {
    index: number;
    pattern: Pattern;
    constructor(index: number, pattern: Pattern);
}
