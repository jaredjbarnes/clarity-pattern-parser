import Pattern from "./Pattern.js";

export default class CompositePattern extends Pattern {
  getType() {
    return "composite";
  }

  getPatterns(){
     throw new Error("Not Yet Implemented");
  }
}
