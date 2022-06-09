export default class Node {
    constructor(type, name, startIndex, endIndex, isComposite = false) {
        this.children = [];
        this.value = "";
        this.type = type;
        this.name = name;
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.isComposite = isComposite;
        if (typeof this.startIndex !== "number" ||
            typeof this.endIndex !== "number") {
            throw new Error("Invalid Arguments: startIndex and endIndex need to be number.");
        }
    }
}
//# sourceMappingURL=Node.js.map