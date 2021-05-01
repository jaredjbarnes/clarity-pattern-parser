import Node from "./Node";

export default class NodeVisitor {
  public context: Node;
  public selectedNodes: Node[];

  constructor(context: Node, selectedNodes: Node[] = []) {
    this.context = context;
    this.selectedNodes = selectedNodes;
  }

  flatten() {
    this.selectedNodes.forEach((node) => {
      if (node.isComposite) {
        const children: Node[] = [];

        this.walkUp(node, (descendant: Node) => {
          if (!descendant.isComposite) {
            children.push(descendant);
          }
        });

        node.children = children;
      }
    });

    return this;
  }

  remove() {
    this.recursiveRemove(this.context);
    return this;
  }

  private recursiveRemove(node: Node) {
    const nodesToRemove = this.selectedNodes;
    if (node.isComposite && Array.isArray(node.children)) {
      for (let x = 0; x < node.children.length; x++) {
        if (nodesToRemove.indexOf(node.children[x]) > -1) {
          node.children.splice(x, 1);
          x--;
        } else {
          this.recursiveRemove(node.children[x]);
        }
      }
    }
  }

  wrap(callback: (node: Node) => Node) {
    const visitor = new NodeVisitor(this.context);

    visitor.selectRoot().transform((node) => {
      if (this.selectedNodes.includes(node)) {
        return callback(node);
      }
      return node;
    });

    return this;
  }

  unwrap() {
    this.walkDown(this.context, (node, stack) => {
      if (this.selectedNodes.includes(node)) {
        const parent = stack[stack.length - 1];
        const grandParent = stack[stack.length - 2];

        if (parent != null && grandParent != null) {
          const index = grandParent.children.indexOf(parent);
          if (index > -1) {
            grandParent.children.splice(index, 1, ...parent.children);
          }
        }
      }
    });

    return this;
  }

  prepend(callback: (node: Node) => Node) {
    this.walkUp(this.context, (node, stack) => {
      if (this.selectedNodes.includes(node)) {
        const parent = stack[stack.length - 1];

        if (parent != null) {
          const index = parent.children.indexOf(node);
          if (index > -1) {
            parent.children.splice(index, 0, callback(node));
          }
        }
      }
    });

    return this;
  }

  append(callback: (node: Node) => Node) {
    this.walkDown(this.context, (node, stack) => {
      if (this.selectedNodes.includes(node)) {
        const parent = stack[stack.length - 1];

        if (parent != null) {
          const index = parent.children.indexOf(node);
          if (index > -1) {
            parent.children.splice(index+1, 0, callback(node));
          }
        }
      }
    });

    return this;
  }

  private transform(callback: (node: Node) => Node) {
    this.selectedNodes.forEach((node) => {
      return this.recursiveTransform(node, callback);
    });

    return this;
  }

  private recursiveTransform(node: Node, callback: (node: Node) => Node) {
    if (node.isComposite && Array.isArray(node.children)) {
      const length = node.children.length;

      for (let x = 0; x < length; x++) {
        node.children[x] = this.recursiveTransform(node.children[x], callback);
      }
    }

    return callback(node);
  }

  walkUp(
    node: Node,
    callback: (node: Node, ancestors: Node[]) => void,
    ancestors: Node[] = []
  ) {
    ancestors.push(node);

    if (node.isComposite && Array.isArray(node.children)) {
      const children = node.children.slice();
      children.forEach((c) => this.walkUp(c, callback, ancestors));
    }

    ancestors.pop();
    callback(node, ancestors);

    return this;
  }

  walkDown(
    node: Node,
    callback: (node: Node, ancestors: Node[]) => void,
    ancestors: Node[] = []
  ) {
    callback(node, ancestors);
    ancestors.push(node);

    if (node.isComposite && Array.isArray(node.children)) {
      const children = node.children.slice();
      children.forEach((c) => this.walkDown(c, callback, ancestors));
    }

    ancestors.pop();
    return this;
  }

  selectAll() {
    return this.select((n) => true);
  }

  selectNode(node: Node) {
    return new NodeVisitor(this.context, [...this.selectedNodes, node]);
  }

  deselectNode(node: Node) {
    const visitor = new NodeVisitor(this.context, this.selectedNodes.slice());
    return visitor.filter((n) => n !== node);
  }

  select(callback: (node: Node) => boolean) {
    const node = this.context;
    const selectedNodes: Node[] = [];

    if (node.isComposite) {
      this.walkDown(node, (descendant: Node) => {
        if (callback(descendant)) {
          selectedNodes.push(descendant);
        }
      });
    }

    return new NodeVisitor(this.context, selectedNodes);
  }

  forEach(callback: (node: Node) => void) {
    this.selectedNodes.forEach(callback);
    return this;
  }

  filter(callback: (node: Node) => boolean) {
    return new NodeVisitor(this.context, this.selectedNodes.filter(callback));
  }

  map(callback: (node: Node) => Node) {
    return new NodeVisitor(this.context, this.selectedNodes.map(callback));
  }

  selectRoot() {
    return new NodeVisitor(this.context, [this.context]);
  }

  first() {
    return this.get(0);
  }

  last() {
    return this.get(this.selectedNodes.length - 1);
  }

  get(index: number) {
    const node = this.selectedNodes[index];

    if (node == null) {
      throw new Error(
        `Couldn't find node at index: ${index}, out of ${this.selectedNodes.length}.`
      );
    }

    return new NodeVisitor(node, []);
  }

  clear() {
    this.selectedNodes = [];
    return this;
  }

  static select(context: Node, callback?: (node: Node) => boolean) {
    if (callback != null) {
      return new NodeVisitor(context).select(callback);
    } else {
      return new NodeVisitor(context);
    }
  }
}
