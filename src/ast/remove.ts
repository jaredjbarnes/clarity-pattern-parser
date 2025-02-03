import { Node } from "./Node";

export function remove(node: Node, nodeMap: Record<string, boolean>) {
    node.walkBreadthFirst(n=>{
        if (nodeMap[n.name]){
            n.remove();
        }
    });

    return node;
}