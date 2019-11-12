export default class Node {
  constructor(name, startIndex, endIndex) {
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

  clone() {
    throw new Error(
      "Not Implemented Exception: expected subclass to override this method."
    );
  }
}
