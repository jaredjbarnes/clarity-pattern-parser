export default class Node {
  public type: string;
  public name: string;
  public firstIndex: number;
  public lastIndex: number;
  public children: Node[];
  public value: string;

  constructor(
    type: string,
    name: string,
    firstIndex: number,
    lastIndex: number,
    children: Node[] = [],
    value: string = ""
  ) {
    this.type = type;
    this.name = name;
    this.firstIndex = firstIndex;
    this.lastIndex = lastIndex;
    this.children = children;
    this.value = value;
  }

  clone(): Node {
    return new Node(
      this.type,
      this.name,
      this.firstIndex,
      this.lastIndex,
      this.children.map((c) => c.clone()),
      this.value
    );
  }

  toString() {
    return this.value;
  }
}
