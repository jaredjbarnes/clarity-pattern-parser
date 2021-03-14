import Pattern from "../Pattern";

export default abstract class CompositePattern extends Pattern {
  constructor(type, name, children = []) {
    super(type, name, children);
  }
}
