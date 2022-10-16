import Pattern from "./Pattern";
export default class ParseError {
    message: string;
    name: string;
    index: number;
    pattern: Pattern;
    constructor(message: string, index: number, pattern: Pattern);
}
