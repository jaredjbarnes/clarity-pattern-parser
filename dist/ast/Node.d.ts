export declare class Node {
    type: string;
    name: string;
    firstIndex: number;
    lastIndex: number;
    children: Node[];
    value: string;
    constructor(type: string, name: string, firstIndex: number, lastIndex: number, children?: Node[], value?: string);
    clone(): Node;
    toString(): string;
}
