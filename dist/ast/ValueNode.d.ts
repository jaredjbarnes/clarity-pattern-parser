import Node from "./Node";
export default class ValueNode extends Node {
    value: string;
    constructor(type: string, name: string, value: string, startIndex?: number, endIndex?: number);
    clone(): ValueNode;
    filter(shouldKeep: (node: Node, context: Node[]) => boolean, context?: Node[]): this[];
    toString(): string;
}
