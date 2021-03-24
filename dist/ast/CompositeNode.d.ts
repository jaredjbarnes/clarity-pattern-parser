import Node from "./Node";
export default class CompositeNode extends Node {
    constructor(type: string, name: string, startIndex?: number, endIndex?: number);
    clone(): CompositeNode;
    filter(shouldKeep: (node: Node, context: Node[]) => boolean, context?: Node[]): Node[];
    toString(): string;
}
