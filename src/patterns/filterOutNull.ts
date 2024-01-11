import { Node } from "../ast/Node"

export function filterOutNull(nodes: (Node | null)[]): Node[] {
    const filteredNodes: Node[] = [];

    for (const node of nodes) {
        if (node !== null) {
            filteredNodes.push(node);
        }
    }

    return filteredNodes;
}