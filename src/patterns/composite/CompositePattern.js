import Pattern from "../Pattern.js";

export default class CompositePattern extends Pattern {
  constructor(name, patterns) {
    super();
    this.name = name;
    this.patterns = patterns;
    this.assertArguments();
    this.clonePatterns();
  }

  assertArguments() {
    if (!Array.isArray(this.patterns)) {
      throw new Error(
        "Invalid Arguments: The patterns argument need to be an array of Patterns."
      );
    }

    const areAllPatterns = this.patterns.every(
      pattern => pattern instanceof Pattern
    );

    if (!areAllPatterns) {
      throw new Error(
        "Invalid Argument: All patterns need to be an instance of Pattern."
      );
    }

    if (this.patterns.length < 2) {
      throw new Error(
        "Invalid Argument: OrValue needs to have more than one value pattern."
      );
    }

    if (typeof this.name !== "string") {
      throw new Error(
        "Invalid Argument: OrValue needs to have a name that's a string."
      );
    }
  }

  clonePatterns() {
    // We need to clone the patterns so nested patterns can be parsed.
    this.patterns = this.patterns.map(pattern => pattern.clone());
  }

  clonePatterns() {
    // We need to clone the patterns so nested patterns can be parsed.
    this.patterns = this.patterns.map(pattern => pattern.clone());
  }

  getType() {
    return "composite";
  }

  getName() {
    return this.name;
  }

  getValue() {
    return null;
  }

  getPatterns() {
    return this.patterns;
  }

  clone() {
    throw new Error("Not Yet Implemented");
  }
}
