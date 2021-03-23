import Cursor from "./Cursor";
import { Match } from "./CursorHistory";
import Pattern from "./patterns/Pattern";
import Node from "./ast/Node";

export interface ParseMatch {
  text: string;
  startIndex: number;
  endIndex: number;
}

export interface ParseError {
  text: string;
  startIndex: number;
  endIndex: number;
}

export interface Possibilities {
  startIndex: number;
  options: string[];
}

export interface ParseResult {}

export default class ParseInspector {
  public cursor: Cursor | null = null;
  public result: Node | null = null;
  public text: string = "";
  public match: ParseMatch | null = null;
  public error: ParseError | null = null;
  public patternMatch: Match | null = null;
  public matchedText: string = "";
  public rootPattern: Pattern | null = null;
  public possibilities: Possibilities | null = null;

  inspectParse(text: string, pattern: Pattern) {
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
          options: pattern.getPossibilities(),
        },
        isComplete: false,
      };
    }

    this.parse();
    this.saveMatchedText();
    this.saveMatch();
    this.saveError();
    this.savePossibilities();

    return {
      pattern: this.patternMatch?.pattern,
      astNode: this.patternMatch?.astNode,
      match: this.match,
      error: this.error,
      possibilities: this.possibilities,
      isComplete: this.cursor?.didSuccessfullyParse(),
    };
  }

  private reset() {
    this.cursor = null;
    this.result = null;
    this.text = "";
    this.match = null;
    this.error = null;
    this.patternMatch = null;
    this.matchedText = "";
    this.rootPattern = null;
    this.possibilities = null;
  }

  private parse() {
    this.cursor = new Cursor(this.text);
    this.result = this.rootPattern?.parse(this.cursor) || null;
    this.patternMatch = this.cursor.lastMatch;
  }

  private saveMatchedText() {
    if (this.patternMatch?.astNode != null) {
      this.matchedText = this.text.substring(
        0,
        this.patternMatch.astNode.endIndex + 1
      );
    }
  }

  private saveMatch() {
    const node = this.patternMatch?.astNode;

    if (node == null) {
      this.match = null;
      return;
    }

    let endIndex = this.matchedText.length - 1;

    this.match = {
      text: this.matchedText,
      startIndex: 0,
      endIndex: endIndex,
    };
  }

  private saveError() {
    if (this.patternMatch?.astNode == null) {
      this.error = {
        startIndex: 0,
        endIndex: this.text.length - 1,
        text: this.text,
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
        text: this.text.substring(startIndex, endIndex + 1),
      };

      return;
    } else {
      this.error = null;
      return;
    }
  }

  private savePossibilities() {
    if (
      this.patternMatch?.pattern === this.rootPattern &&
      this.cursor?.didSuccessfullyParse()
    ) {
      this.possibilities = null;
      return;
    }

    if (this.patternMatch?.astNode == null) {
      let options = this.rootPattern?.getPossibilities();
      const parts = this.text.split(" ").filter((part) => {
        return part.length > 0;
      });

      options = options?.filter((option) => {
        return parts.some((part) => {
          return option.indexOf(part) > -1;
        });
      });

      if (options?.length === 0) {
        this.possibilities = null;
        return;
      }

      this.possibilities = {
        startIndex: 0,
        options: options != null ? options : [],
      };

      return;
    }

    const pattern = this.patternMatch.pattern;
    const parentPattern = pattern?.parent;

    if (pattern == null || parentPattern == null) {
      return;
    }

    const index = parentPattern.children.indexOf(pattern);
    const parentClone = parentPattern?.clone();

    parentClone.children = parentClone.children.slice(index + 1);

    const options = parentClone.getPossibilities();
    let startIndex = this.matchedText.length;

    if (this.matchedText.length < this.text.length) {
      const leftOver = this.text.substring(this.matchedText.length);
      const partialMatchOptions = options
        .filter((option) => {
          return option.indexOf(leftOver) === 0;
        })
        .map((option) => {
          return option.substring(leftOver.length);
        });

      if (partialMatchOptions.length === 0) {
        this.possibilities = null;
        return;
      } else {
        if (this.match == null) {
          return;
        }

        this.match = {
          ...this.match,
          text: this.match.text + leftOver,
          endIndex: this.match.endIndex + leftOver.length,
        };

        this.error = null;

        this.possibilities = {
          startIndex: this.match.endIndex + 1,
          options: partialMatchOptions,
        };

        return;
      }
    }

    this.possibilities = {
      startIndex,
      options,
    };
  }

  static inspectParse(text: string, pattern: Pattern) {
    return new ParseInspector().inspectParse(text, pattern);
  }
}
