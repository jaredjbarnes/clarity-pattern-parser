export default class Possibilities {
  constructor(options, isComplete, hasError) {
    this.options = Array.isArray(options) ? options : [];
    this.isComplete = typeof isComplete === "boolean" ? isComplete : false;
    this.hasError = typeof hasError ? hasError : false;
  }
}
