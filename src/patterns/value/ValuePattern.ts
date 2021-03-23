import Pattern from "../Pattern";

export default abstract class ValuePattern extends Pattern {
  constructor(type: string, name: string, children: ValuePattern[] = []) {
    super(type, name, children);
  }
  abstract clone(name?: string): ValuePattern;
}
