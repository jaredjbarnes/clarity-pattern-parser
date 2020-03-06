export default class Node {
  constructor(type, name, startIndex, endIndex) {
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

  filter(){
    throw new Error("Not Implemented Exception: expected subclass to override this method.");
  }

  clone() {
    throw new Error(
      "Not Implemented Exception: expected subclass to override this method."
    );
  }

  toString() {
    throw new Error(
      "Not Implemented Exception: expected subclass to override this method."
    );
  }
}
