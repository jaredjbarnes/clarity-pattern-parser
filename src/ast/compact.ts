import { Node } from "./Node";

export function compact(node: Node, nodeMap: Record<string, boolean>) {
    node.walkBreadthFirst(n=>{
        if (nodeMap[n.name]){
            n.compact();
        }
    });

    return node;
}