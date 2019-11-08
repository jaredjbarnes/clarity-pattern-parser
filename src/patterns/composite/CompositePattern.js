import Pattern from "../Pattern.js";

export default class CompositePattern extends Pattern {
  getType() {
    return "composite";
  }

  getValue() {
    return null;
  }

  getPatterns() {
    return null;
  }

  clone() {
    throw new Error("Not Yet Implemented");
  }
}
