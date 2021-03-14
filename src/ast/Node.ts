export default abstract class Node {
  public type: string;
  public name: string;
  public startIndex: number;
  public endIndex: number;

  constructor(
    type: string,
    name: string,
    startIndex: number,
    endIndex: number
  ) {
    this.type = type;
    this.name = name;
    this.startIndex = startIndex;
    this.endIndex = endIndex;

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
