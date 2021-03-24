import Pattern from "../Pattern";
export default abstract class ValuePattern extends Pattern {
    constructor(type: string, name: string, children?: ValuePattern[]);
    abstract clone(name?: string): ValuePattern;
}
