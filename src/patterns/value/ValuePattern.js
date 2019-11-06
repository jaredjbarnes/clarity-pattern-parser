import Pattern from "../Pattern.js";

export default class ValuePattern extends Pattern {
  getType() {
    return "value";
  }

  getPatterns(){
    return null;
  }

  getValue(){
    throw new Error("Method Not Impelemented");
  }
  
}
