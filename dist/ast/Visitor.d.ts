import Node from "./Node";
export default class Visitor {
    root: Node | null;
    selectedNodes: Node[];
    constructor(root?: Node | null, selectedNodes?: Node[]);
    flatten(): this;
    remove(): this;
    private recursiveRemove;
    wrap(callback: (node: Node) => Node): this;
    unwrap(): this;
    prepend(callback: (node: Node) => Node): this;
    append(callback: (node: Node) => Node): this;
    transform(callback: (node: Node) => Node): this;
    private recursiveTransform;
    walkUp(node: Node, callback: (node: Node, ancestors: Node[]) => void, ancestors?: Node[]): this;
    walkDown(node: Node, callback: (node: Node, ancestors: Node[]) => void, ancestors?: Node[]): this;
    selectAll(): Visitor;
    selectNode(node: Node): Visitor;
    deselectNode(node: Node): Visitor;
    select(callback: (node: Node) => boolean): Visitor;
    forEach(callback: (node: Node) => void): this;
    filter(callback: (node: Node) => boolean): Visitor;
    map(callback: (node: Node) => Node): Visitor;
    selectRoot(): Visitor;
    first(): Visitor;
    last(): Visitor;
    get(index: number): Visitor;
    clear(): this;
    setRoot(root: Node | null): void;
    static select(root: Node, callback?: (node: Node) => boolean): Visitor;
}
