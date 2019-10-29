export default class ParseError extends Error {
    constructor(message, index){
        super(message);
        this.name = 'ParseError';
        this.index = index;
    }
}