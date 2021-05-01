import Node from "./Node";
export default class ValueNode extends Node {
    constructor(type: string, name: string, value: string, startIndex?: number, endIndex?: number);
    clone(): ValueNode;
    toString(): string;
}
