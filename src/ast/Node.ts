function defaultVisitor(node: Node) {
  return node;
}

let idIndex = 0;

export interface CycleFreeNode {
  id: string;
  type: string;
  name: string;
  startIndex: number;
  endIndex: number;
  value: string;
  children: CycleFreeNode[];
}

export class Node {
  private _id: string;
  private _type: string;
  private _name: string;
  private _firstIndex: number;
  private _lastIndex: number;
  private _parent: Node | null;
  private _children: Node[];
  private _value: string;

  get id() {
    return this._id;
  }

  get type() {
    return this._type;
  }

  get name() {
    return this._name;
  }

  get value() {
    return this.toString();
  }

  get firstIndex() {
    return this._firstIndex;
  }

  get lastIndex() {
    return this._lastIndex;
  }

  get startIndex() {
    return this._firstIndex;
  }

  get endIndex() {
    return this._lastIndex + 1;
  }

  get parent() {
    return this._parent;
  }

  get children(): readonly Node[] {
    return this._children;
  }

  get hasChildren(): boolean {
    return this._children.length > 0;
  }

  get isLeaf(): boolean {
    return !this.hasChildren;
  }

  constructor(
    type: string,
    name: string,
    firstIndex: number,
    lastIndex: number,
    children: Node[] = [],
    value = ""
  ) {
    this._id = String(idIndex++);
    this._type = type;
    this._name = name;
    this._firstIndex = firstIndex;
    this._lastIndex = lastIndex;
    this._parent = null;
    this._children = children;
    this._value = value;

    this._children.forEach(c => c._parent = this);
  }

  removeChild(node: Node) {
    const index = this._children.indexOf(node);

    if (index > -1) {
      this._children.splice(index, 1);
      node._parent = null;
    }
  }

  findChildIndex(node: Node) {
    return this._children.indexOf(node);
  }

  spliceChildren(index: number, deleteCount: number, ...items: Node[]) {
    const removedItems = this._children.splice(index, deleteCount, ...items);

    removedItems.forEach(i => i._parent = null);
    items.forEach(i => i._parent = this);

    return removedItems;
  }

  removeAllChildren() {
    this.spliceChildren(0, this._children.length);
  }

  replaceChild(newNode: Node, referenceNode: Node) {
    const index = this.findChildIndex(referenceNode);

    if (index > -1) {
      this.spliceChildren(index, 1, newNode);
      newNode._parent = this;
      referenceNode._parent = null;
    }
  }

  replaceWith(newNode: Node) {
    if (this._parent != null) {
      this._parent.replaceChild(newNode, this);
    }
  }

  insertBefore(newNode: Node, referenceNode: Node | null) {
    newNode._parent = this;

    if (referenceNode == null) {
      this._children.push(newNode);
      return;
    }

    const index = this.findChildIndex(referenceNode);

    if (index > -1) {
      this._children.splice(index, 0, newNode);
    }
  }

  appendChild(newNode: Node) {
    this.append(newNode);
  }

  append(...nodes: Node[]) {
    nodes.forEach((newNode: Node) => {
      newNode._parent = this;
      this._children.push(newNode);
    });
  }

  nextSibling() {
    if (this._parent == null) {
      return null;
    }

    const children = this._parent._children;
    const index = children.indexOf(this);

    if (index > -1 && index < children.length - 1) {
      return children[index + 1];
    }

    return null;
  }

  previousSibling() {
    if (this._parent == null) {
      return null;
    }

    const children = this._parent._children;
    const index = children.indexOf(this);

    if (index > -1 && index > 0) {
      return children[index - 1];
    }

    return null;
  }

  find(predicate: (node: Node) => boolean): Node | null {
    return this.findAll(predicate)[0] || null;
  }

  findAll(predicate: (node: Node) => boolean): Node[] {
    const matches: Node[] = [];

    this.walkUp(n => {
      if (predicate(n)) { matches.push(n); }
    });

    return matches;
  }

  findRoot() {
    let pattern: Node | null = this;

    while (true) {
      if (pattern.parent == null) {
        return pattern;
      }
      pattern = pattern.parent;
    }
  }

  findAncestor(predicate: (node: Node) => boolean) {
    let parent = this._parent;

    while (parent != null) {
      if (predicate(parent)) {
        return parent;
      }

      parent = parent._parent;
    }

    return null;
  }

  walkUp(callback: (node: Node) => void) {
    const childrenCopy = this._children.slice();

    childrenCopy.forEach(c => c.walkUp(callback));
    callback(this);
  }

  walkDown(callback: (node: Node) => void) {
    const childrenCopy = this._children.slice();

    callback(this);
    childrenCopy.forEach(c => c.walkDown(callback));
  }

  walkBreadthFirst(callback: (node: Node) => void): void {
    const queue: Node[] = [this];

    while (queue.length > 0) {
      const current = queue.shift() as Node;
      callback(current);
      queue.push(...current.children);
    }
  }

  transform(visitors: Record<string, (node: Node) => Node>) {
    const childrenCopy = this._children.slice();
    const visitor = visitors[this.name] == null ? defaultVisitor : visitors[this.name];

    const children = childrenCopy.map(c => c.transform(visitors));
    this.removeAllChildren();
    this.append(...children);

    return visitor(this);
  }

  flatten() {
    const nodes: Node[] = [];

    this.walkDown((node: Node) => {
      if (!node.hasChildren) {
        nodes.push(node);
      }
    });

    return nodes;
  }

  compact() {
    const value = this.toString();
    this.removeAllChildren();
    this._value = value;
  }

  remove() {
    if (this._parent != null) {
      this._parent.removeChild(this);
    }
  }

  clone(): Node {
    const node = new Node(
      this._type,
      this._name,
      this._firstIndex,
      this._lastIndex,
      this._children.map((c) => c.clone()),
      this._value
    );

    return node;
  }

  normalize(startIndex = this._firstIndex): number {
    let length = 0;
    let runningOffset = startIndex;

    if (this.children.length === 0) {
      length = this._value.length;
    } else {
      for (let x = 0; x < this.children.length; x++) {
        const child = this.children[x];
        const childLength = child.normalize(runningOffset);
        runningOffset += childLength;
        length += childLength;
      }
    }

    this._firstIndex = startIndex;
    this._lastIndex = Math.max(startIndex + length - 1, 0);
    return length;
  }

  toString(): string {
    if (this._children.length === 0) {
      return this._value;
    }

    return this._children.map(c => c.toString()).join("");
  }

  toCycleFreeObject(): CycleFreeNode {
    return {
      id: this._id,
      type: this._type,
      name: this._name,
      value: this.toString(),
      startIndex: this.startIndex,
      endIndex: this.endIndex,
      children: this._children.map(c => c.toCycleFreeObject()),
    };
  }

  toJson(space?: number): string {
    return JSON.stringify(this.toCycleFreeObject(), null, space);
  }

  isEqual(node: Node): boolean {
    return node._type === this._type &&
      node._name === this._name &&
      node._firstIndex === this._firstIndex &&
      node._lastIndex === this._lastIndex &&
      node._value === this._value &&
      this._children.every((child, index) => child.isEqual(node._children[index]));
  }

  static createValueNode(type: string, name: string, value = "") {
    return new Node(type, name, 0, 0, [], value);
  }

  static createNode(type: string, name: string, children: Node[] = []) {
    const value = children.map(c => c.toString()).join("");
    return new Node(type, name, 0, 0, children, value);
  }
}
