export default class Node {
    type: string;
    name: string;
    startIndex: number;
    endIndex: number;
    children: Node[];
    value: string;
    constructor(type: string, name: string, startIndex: number, endIndex: number, children?: Node[], value?: string);
    clone(): Node;
    toString(): string;
}
