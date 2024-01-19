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

  get value() {
    return this.toString();
  }

  constructor(
    type: string,
    name: string,
    firstIndex: number,
    lastIndex: number,
    children: Node[] = [],
    value: string = ""
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

    items.forEach(i => i._parent = this);
    removedItems.forEach(i => i._parent = null);

    return removedItems;
  }

  find(isMatch: (node: Node) => boolean): Node | null {
    return this.findAll(isMatch)[0] || null
  }

  findAll(isMatch: (node: Node) => boolean): Node[] {
    const matches: Node[] = [];
    this.walkUp(n => {
      if (isMatch(n)) { matches.push(n); }
    })

    return matches;
  }

  walkUp(callback: (node: Node) => void) {
    this.children.forEach(c => c.walkUp(callback))
    callback(this);
  }

  walkDown(callback: (node: Node) => void) {
    callback(this);
    this.children.forEach(c => c.walkDown(callback))
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

  toJson(space?: number) {
    return JSON.stringify(this, (key, value) => {
      if (key === "parent" || key === "_parent") {
        return undefined;
      }
      return value;
    }, space)
  }
}
