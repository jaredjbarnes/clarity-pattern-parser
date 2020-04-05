import Pattern from "../Pattern.js";

export default class CompositePattern extends Pattern {
  constructor(type, name, children = []) {
    super(type, name, children);
  }

  clone() {
    throw new Error("Not Yet Implemented");
  }
}
