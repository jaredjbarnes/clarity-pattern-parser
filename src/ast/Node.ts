export default class Node {
  public type: string;
  public name: string;
  public startIndex: number;
  public endIndex: number;
  public children: Node[];
  public value: string;

  constructor(
    type: string,
    name: string,
    startIndex: number,
    endIndex: number,
    children: Node[] = [],
    value: string = ""
  ) {
    this.type = type;
    this.name = name;
    this.startIndex = startIndex;
    this.endIndex = endIndex;
    this.children = children;
    this.value = value;
  }

  clone(): Node {
    return new Node(
      this.type,
      this.name,
      this.startIndex,
      this.endIndex,
      this.children.map((c) => c.clone()),
      this.value
    );
  }

  toString() {
    return this.value;
  }
}
