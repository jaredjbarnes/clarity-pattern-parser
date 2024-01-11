import { Node } from "./Node";

export class Visitor {
  public root: Node | null;
  public selectedNodes: Node[];

  constructor(root: Node | null = null, selectedNodes: Node[] = []) {
    this.root = root;
    this.selectedNodes = selectedNodes;
  }

  flatten() {
    this.selectedNodes.forEach((node) => {
      if (node.children.length > 0) {
        const children: Node[] = [];

        Visitor.walkUp(node, (descendant: Node) => {
          if (descendant.children.length === 0) {
            children.push(descendant);
          }
        });

        node.children = children;
      }
    });

    return this;
  }

  remove() {
    if (this.root == null) {
      return this;
    }

    this.recursiveRemove(this.root);
    return this;
  }

  private recursiveRemove(node: Node) {
    const nodesToRemove = this.selectedNodes;
    for (let x = 0; x < node.children.length; x++) {
      if (nodesToRemove.indexOf(node.children[x]) > -1) {
        node.children.splice(x, 1);
        x--;
      } else {
        this.recursiveRemove(node.children[x]);
      }
    }
  }

  wrap(callback: (node: Node) => Node) {
    const visitor = new Visitor(this.root);

    visitor.selectRoot().transform((node) => {
      if (this.selectedNodes.includes(node)) {
        return callback(node);
      }
      return node;
    });

    return this;
  }

  unwrap() {
    if (this.root == null) {
      return this;
    }

    Visitor.walkDown(this.root, (node, stack) => {
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
    if (this.root == null) {
      return this;
    }

    Visitor.walkUp(this.root, (node, stack) => {
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
    if (this.root == null) {
      return this;
    }

    Visitor.walkDown(this.root, (node, stack) => {
      if (this.selectedNodes.includes(node)) {
        const parent = stack[stack.length - 1];

        if (parent != null) {
          const index = parent.children.indexOf(node);
          if (index > -1) {
            parent.children.splice(index + 1, 0, callback(node));
          }
        }
      }
    });

    return this;
  }

  transform(callback: (node: Node) => Node) {
    this.selectedNodes.forEach((node) => {
      return this.recursiveTransform(node, callback);
    });

    return this;
  }

  private recursiveTransform(node: Node, callback: (node: Node) => Node) {
    const length = node.children.length;

    for (let x = 0; x < length; x++) {
      node.children[x] = this.recursiveTransform(node.children[x], callback);
    }

    return callback(node);
  }

  selectAll() {
    return this.select((n) => true);
  }

  selectNode(node: Node) {
    return new Visitor(this.root, [...this.selectedNodes, node]);
  }

  deselectNode(node: Node) {
    const visitor = new Visitor(this.root, this.selectedNodes.slice());
    return visitor.filter((n) => n !== node);
  }

  select(callback: (node: Node) => boolean) {
    if (this.root == null) {
      return this;
    }

    const node = this.root;
    const selectedNodes: Node[] = [];

    if (node.children.length > 0) {
      Visitor.walkDown(node, (descendant: Node) => {
        if (callback(descendant)) {
          selectedNodes.push(descendant);
        }
      });
    }

    return new Visitor(this.root, selectedNodes);
  }

  forEach(callback: (node: Node) => void) {
    this.selectedNodes.forEach(callback);
    return this;
  }

  filter(callback: (node: Node) => boolean) {
    return new Visitor(this.root, this.selectedNodes.filter(callback));
  }

  map(callback: (node: Node) => Node) {
    return new Visitor(this.root, this.selectedNodes.map(callback));
  }

  selectRoot() {
    if (this.root == null) {
      return this;
    }

    return new Visitor(this.root, [this.root]);
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

    return new Visitor(node, []);
  }

  clear() {
    this.selectedNodes = [];
    return this;
  }

  setRoot(root: Node | null) {
    this.root = root;
    return this;
  }

  static select(root: Node, callback?: (node: Node) => boolean) {
    if (callback != null) {
      return new Visitor(root).select(callback);
    } else {
      return new Visitor(root);
    }
  }

  static walkUp(
    node: Node,
    callback: (node: Node, ancestors: Node[]) => void,
    ancestors: Node[] = []
  ) {
    ancestors.push(node);

    if (node.children.length > 0) {
      const children = node.children.slice();
      children.forEach((c) => this.walkUp(c, callback, ancestors));
    }

    ancestors.pop();
    callback(node, ancestors);

    return this;
  }

  static walkDown(
    node: Node,
    callback: (node: Node, ancestors: Node[]) => void,
    ancestors: Node[] = []
  ) {
    callback(node, ancestors);
    ancestors.push(node);

    if (node.children.length > 0) {
      const children = node.children.slice();
      children.forEach((c) => this.walkDown(c, callback, ancestors));
    }

    ancestors.pop();
    return this;
  }
}
