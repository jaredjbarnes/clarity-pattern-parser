export default abstract class Node {
  public type: string;
  public name: string;
  public startIndex: number;
  public endIndex: number;
  public isComposite: boolean;
  public children: Node[] = [];
  public value: string = "";

  constructor(
    type: string,
    name: string,
    startIndex: number,
    endIndex: number,
    isComposite = false
  ) {
    this.type = type;
    this.name = name;
    this.startIndex = startIndex;
    this.endIndex = endIndex;
    this.isComposite = isComposite;

    if (
      typeof this.startIndex !== "number" ||
      typeof this.endIndex !== "number"
    ) {
      throw new Error(
        "Invalid Arguments: startIndex and endIndex need to be number."
      );
    }
  }

  abstract filter(
    shouldKeep?: (node: Node, context: Node[]) => boolean,
    context?: Node[]
  ): Node[];

  abstract clone(): Node;

  abstract toString(): string;
}
