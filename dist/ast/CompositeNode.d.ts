import Node from "./Node";
export default class CompositeNode extends Node {
    constructor(type: string, name: string, startIndex?: number, endIndex?: number);
    clone(): CompositeNode;
    toString(): string;
}
