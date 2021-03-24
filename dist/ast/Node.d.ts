export default abstract class Node {
    type: string;
    name: string;
    startIndex: number;
    endIndex: number;
    isComposite: boolean;
    children: Node[];
    value: string;
    constructor(type: string, name: string, startIndex: number, endIndex: number, isComposite?: boolean);
    abstract filter(shouldKeep?: (node: Node, context: Node[]) => boolean, context?: Node[]): Node[];
    abstract clone(): Node;
    abstract toString(): string;
}
