export default class ParseError extends Error {
    constructor(message, index, pattern){
        super(message);
        this.name = 'ParseError';
        this.index = index;
        this.pattern = pattern;
    }
}