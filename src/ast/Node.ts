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

export class Node {
  private _type: string;
  private _name: string;
  private _firstIndex: number;
  private _lastIndex: number;
  private _parent: Node | null;
  private _children: Node[];
  private _value: string;

  get type() {
    return this._type;
  }

  get name() {
    return this._name;
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

  get value() {
    return this.toString();
  }

  constructor(
    type: string,
    name: string,
    firstIndex: number,
    lastIndex: number,
    children: Node[] = [],
    value = ""
  ) {
    this._type = type;
    this._name = name;
    this._firstIndex = firstIndex;
    this._lastIndex = lastIndex;
    this._parent = null;
    this._children = children;
    this._value = value;

    this._children.forEach(c => c._parent = this)
  }

  removeChild(node: Node) {
    const index = this._children.indexOf(node);

    if (index > -1) {
      this._children.splice(index, 1);
      node._parent = null;
    }
  }

  removeAllChildren() {
    this._children.forEach(c => c._parent = null);
    this._children.length = 0;
  }

  replaceChild(newNode: Node, referenceNode: Node) {
    const index = this._children.indexOf(referenceNode);

    if (index > -1) {
      this._children.splice(index, 1, newNode);
      newNode._parent = this;
      referenceNode._parent = null;
    }
  }

  insertBefore(newNode: Node, referenceNode: Node | null) {
    newNode._parent = this;

    if (referenceNode == null) {
      this._children.push(newNode);
      return;
    }

    const index = this._children.indexOf(referenceNode);

    if (index > -1) {
      this._children.splice(index, 0, newNode);
    }
  }

  appendChild(newNode: Node) {
    newNode._parent = this;
    this._children.push(newNode);
  }

  spliceChildren(index: number, deleteCount: number, ...items: Node[]) {
    const removedItems = this._children.splice(index, deleteCount, ...items);

    removedItems.forEach(i => i._parent = null);
    items.forEach(i => i._parent = this);

    return removedItems;
  }

  nextSibling() {
    if (this._parent == null) {
      return null;
    }

    const children = this._parent._children;
    const index = children.indexOf(this);

    if (index > -1 && index < children.length - 1) {
      return children[index + 1]
    }

    return null
  }

  previousSibling() {
    if (this._parent == null) {
      return null;
    }

    const children = this._parent._children;
    const index = children.indexOf(this);

    if (index > -1 && index > 0) {
      return children[index - 1]
    }

    return null
  }

  find(predicate: (node: Node) => boolean): Node | null {
    return this.findAll(predicate)[0] || null
  }

  findAll(predicate: (node: Node) => boolean): Node[] {
    const matches: Node[] = [];
    this.walkUp(n => {
      if (predicate(n)) { matches.push(n); }
    })

    return matches;
  }

  findAncester(predicate: (node: Node) => boolean) {
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
    this.children.forEach(c => c.walkUp(callback))
    callback(this);
  }

  walkDown(callback: (node: Node) => void) {
    callback(this);
    this.children.forEach(c => c.walkDown(callback))
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

  reduce() {
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
    return new Node(
      this._type,
      this._name,
      this._firstIndex,
      this._lastIndex,
      this._children.map((c) => c.clone()),
      this._value
    );
  }

  toString(): string {
    if (this._children.length === 0) {
      return this._value;
    }

    return this._children.map(c => c.toString()).join("")
  }

  toCycleFreeObject(): CycleFreeNode {
    return {
      type: this._type,
      name: this._name,
      value: this.toString(),
      firstIndex: this._firstIndex,
      lastIndex: this._lastIndex,
      startIndex: this.startIndex,
      endIndex: this.endIndex,
      children: this._children.map(c => c.toCycleFreeObject()),
    }
  }

  toJson(space?: number): string {
    return JSON.stringify(this.toCycleFreeObject(), null, space)
  }
}
