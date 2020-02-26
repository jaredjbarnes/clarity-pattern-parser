import Cursor from "./Cursor.js";
import Possibilities from "./Possibilities";

const typeToMethodName = {
  "and-value": "buildAndValuePossibilites",
  "any-of-these": "buildAnyOfThesePossibilities",
  literal: "buildLiteralPossibilities",
  "not-value": "buildNotValuePossibilities",
  "optional-value": "buildOptionalValuePossibilities",
  "or-value": "buildOrValuePossibilities",
  "regex-value": "buildRegexValuePossibilities",
  "repeat-value": "buildRepeatValuePossibilities",
  "and-composite": "buildAndComposite",
  "or-composite": "buildOrComposite",
  "repeat-composite": "buildRepeatComposite",
  recursive: "buildRecursive"
};

export default class PossibilitiesFinder {
  constructor() {
    this.pattern = null;
    this.string = null;
    this.cursor = null;
    this.astResult = null;
    this.lastSuccessfulAst = null;
    this.lastSuccessfulPattern = null;
    this.options = [];
  }

  findPossibilities(string, pattern) {
    this.cursor = new Cursor(string);
    this.astResult = pattern.parse(cursor);
    this.lastSuccessfulAst = this.cursor.lastSuccessfulAst;
    this.lastSuccessfulPattern = this.cursor.lastSuccessfulPatternMatch;
    this.options = [];

    this.buildPossibilities();
  }

  getBuildMethod(type) {
    const method = this[typeToMethodName[type]];

    if (typeof method !== "function") {
      throw new Error(`Couldn't find builder type '${type}'.`);
    }

    return method;
  }

  buildPossibilities() {}
}
