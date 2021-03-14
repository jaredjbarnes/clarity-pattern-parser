import Node from "./Node";

export default class CompositeNode extends Node {
  public children: Node[];

  constructor(type: string, name: string, startIndex = 0, endIndex = 0) {
    super(type, name, startIndex, endIndex);
    this.children = [];
  }

  clone() {
    const node = new CompositeNode(
      this.type,
      this.name,
      this.startIndex,
      this.endIndex
    );

    node.children = this.children.map((child) => {
      return child.clone();
    });

    return node;
  }

  filter(
    shouldKeep?: (node: Node, context: Node[]) => boolean,
    context: Node[] = []
  ) {
    const childrenContext = context.slice();
    childrenContext.push(this);

    Object.freeze(childrenContext);

    const matches = this.children.reduce((acc, child) => {
      return acc.concat(child.filter(shouldKeep, childrenContext));
    }, []);

    const match = shouldKeep(this, context);

    if (match) {
      matches.push(this);
    }

    return matches;
  }

  toString() {
    return this.children.map((child) => child.toString()).join("");
  }
}
