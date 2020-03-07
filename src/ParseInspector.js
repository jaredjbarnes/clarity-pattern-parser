import { Cursor } from "./index.js";

export default class ParseInspector {
  constructor() {
    this.cursor = null;
    this.result = null;
    this.text = null;
    this.match = null;
    this.error = null;
    this.patternMatch = null;
    this.matchedText = "";
    this.rootPattern = null;
    this.possibilities = null;
  }

  inspectParse(text, pattern) {
    this.reset();

    this.text = text;
    this.rootPattern = pattern;

    // If no text all options are available.
    if (text.length === 0) {
      return {
        pattern: null,
        astNode: null,
        match: null,
        error: null,
        possibilities: {
          startIndex: 0,
          options: pattern.getPossibilities()
        },
        isComplete: false
      };
    }

    this.parse();
    this.saveMatchedText();
    this.saveMatch();
    this.saveError();
    this.savePossibilities();

    return {
      pattern: this.patternMatch.pattern,
      astNode: this.patternMatch.astNode,
      match: this.match,
      error: this.error,
      possibilities: this.possibilities,
      isComplete: this.cursor.didSuccessfullyParse()
    };
  }

  reset() {
    this.cursor = null;
    this.result = null;
    this.text = null;
    this.match = null;
    this.error = null;
    this.patternMatch = null;
    this.matchedText = "";
    this.rootPattern = null;
    this.possibilities = null;
  }

  parse() {
    this.rootPattern = this.rootPattern;
    this.cursor = new Cursor(this.text);
    this.result = this.rootPattern.parse(this.cursor);
    this.patternMatch = this.cursor.lastMatch;
  }

  saveMatchedText() {
    if (this.patternMatch.astNode != null) {
      this.matchedText = this.text.substring(
        0,
        this.patternMatch.astNode.endIndex + 1
      );
    }
  }

  saveMatch() {
    const node = this.patternMatch.astNode;

    if (node == null) {
      this.match = null;
      return;
    }

    let endIndex = this.matchedText.length - 1;

    this.match = {
      text: this.matchedText,
      startIndex: 0,
      endIndex: endIndex
    };
  }

  saveError() {
    if (this.patternMatch.astNode == null) {
      this.error = {
        startIndex: 0,
        endIndex: this.text.length - 1,
        text: this.text
      };
      return this;
    }

    if (this.text.length > this.matchedText.length) {
      const difference = this.text.length - this.matchedText.length;
      const startIndex = this.patternMatch.astNode.endIndex + 1;
      const endIndex = startIndex + difference - 1;

      this.error = {
        startIndex: startIndex,
        endIndex: endIndex,
        text: this.text.substring(startIndex, endIndex + 1)
      };

      return;
    } else {
      this.error = null;
      return;
    }
  }

  savePossibilities() {
    if (
      this.patternMatch.pattern === this.rootPattern &&
      this.cursor.didSuccessfullyParse()
    ) {
      this.possibilities = null;
      return;
    }

    if (this.patternMatch.astNode == null) {
      let options = this.rootPattern.getPossibilities();
      const parts = this.text.split(" ").filter(part => {
        return part.length > 0;
      });

      options = options.filter(option => {
        return parts.some(part => {
          return option.indexOf(part) > -1;
        });
      });

      if (options.length === 0) {
        this.possibilities = null;
        return;
      }

      this.possibilities = {
        startIndex: 0,
        options
      };

      return;
    }

    const pattern = this.patternMatch.pattern || this.rootPattern;
    const parentPattern = pattern.parent || pattern;
    const index = parentPattern.children.indexOf(pattern);
    const parentClone = parentPattern.clone();

    parentClone.children = parentClone.children.slice(index + 1);

    const options = parentClone.getPossibilities();
    let startIndex = this.matchedText.length;
    startIndex = startIndex >= 0 ? startIndex : 0;

    if (this.matchedText.length < this.text.length) {
      const leftOver = this.text.substring(this.matchedText.length);
      const partialMatchOptions = options
        .filter(option => {
          return option.indexOf(leftOver) === 0;
        })
        .map(option => {
          return option.substring(leftOver.length);
        });

      if (partialMatchOptions.length === 0) {
        this.possibilities = null;
        return;
      } else {
        this.match = {
          ...this.match,
          text: this.match.text + leftOver,
          endIndex: this.match.endIndex + leftOver.length
        };

        this.error = null;

        this.possibilities = {
          startIndex: this.match.endIndex + 1,
          options: partialMatchOptions
        };

        return;
      }
    }

    this.possibilities = {
      startIndex,
      options
    };
  }

  static inspectParse(text, pattern) {
    return new ResultGenerator().inspectParse(text, pattern);
  }
}
