export interface CycleFreeNode {
    type: string;
    name: string;
    firstIndex: number;
    lastIndex: number;
    startIndex: number;
    endIndex: number;
    value: string;
    children: CycleFreeNode[];
}
export declare class Node {
    private _type;
    private _name;
    private _firstIndex;
    private _lastIndex;
    private _parent;
    private _children;
    private _value;
    get type(): string;
    get name(): string;
    get firstIndex(): number;
    get lastIndex(): number;
    get startIndex(): number;
    get endIndex(): number;
    get parent(): Node | null;
    get children(): readonly Node[];
    get value(): string;
    constructor(type: string, name: string, firstIndex: number, lastIndex: number, children?: Node[], value?: string);
    removeChild(node: Node): void;
    removeAllChildren(): void;
    replaceChild(newNode: Node, referenceNode: Node): void;
    insertBefore(newNode: Node, referenceNode: Node | null): void;
    appendChild(newNode: Node): void;
    spliceChildren(index: number, deleteCount: number, ...items: Node[]): Node[];
    nextSibling(): Node | null;
    previousSibling(): Node | null;
    find(predicate: (node: Node) => boolean): Node | null;
    findAll(predicate: (node: Node) => boolean): Node[];
    walkUp(callback: (node: Node) => void): void;
    walkDown(callback: (node: Node) => void): void;
    clone(): Node;
    toString(): string;
    toCycleFreeObject(): CycleFreeNode;
    toJson(space?: number): string;
}
