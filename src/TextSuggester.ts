import Node from "./ast/Node";
import Cursor from "./Cursor";
import { Match } from "./CursorHistory";
import Pattern from "./patterns/Pattern";

export interface Token {
  startIndex: number;
  values: string[];
}

export interface SuggestionError {
  startIndex: number;
  endIndex: number;
  text: string;
}

export interface SuggestionMatch {
  startIndex: number;
  endIndex: number;
  text: string;
}

export interface SuggestionResult {
  pattern: Pattern | null;
  astNode: Node | null;
  match: SuggestionMatch | null;
  error: SuggestionError | null;
  options: Token;
  isComplete: boolean;
  parseStack: Node[];
}

export default class TextSuggester {
  private cursor: Cursor | null = null;
  private result: Node | null = null;
  private text: string = "";
  private match: SuggestionMatch | null = null;
  private error: SuggestionError | null = null;
  private patternMatch: Match | null = null;
  private matchedText: string = "";
  private rootPattern: Pattern | null = null;
  private tokens: Token | null = {
    startIndex: 0,
    values: [],
  };
  private options: string[] = [];
  private parseStack: Node[] = [];

  suggest(text: string, pattern: Pattern) {
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
        options: {
          startIndex: 0,
          values: pattern.getTokens(),
        },
        isComplete: false,
        parseStack: [],
      } as SuggestionResult;
    }

    this.parse();
    this.saveParseStack();
    this.saveMatchedText();
    this.saveMatch();
    this.saveError();
    this.saveOptions();
    this.saveNextToken();

    return {
      pattern: this.patternMatch?.pattern || null,
      astNode: this.patternMatch?.astNode || null,
      match: this.match,
      error: this.error,
      options: this.tokens,
      isComplete: this.cursor?.didSuccessfullyParse() || false,
      parseStack: this.parseStack,
    } as SuggestionResult;
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
    this.tokens = {
      startIndex: 0,
      values: [],
    };
    this.options = [];
    this.parseStack = [];
  }

  private parse() {
    this.rootPattern = this.rootPattern;
    this.cursor = new Cursor(this.text || "");
    this.cursor.startRecording();
    this.result = this.rootPattern?.parse(this.cursor) || null;
    this.patternMatch = this.cursor.lastMatch;
  }

  private saveParseStack() {
    this.parseStack = this.cursor?.history.getLastParseStack() || [];
  }

  private saveMatchedText() {
    if (this.patternMatch?.astNode != null) {
      this.matchedText =
        this.text?.substring(0, this.patternMatch.astNode.endIndex + 1) || "";
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

    if (
      this.patternMatch != null &&
      this.text.length > this.matchedText.length
    ) {
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

  private saveNextToken() {
    if (
      this.patternMatch?.pattern === this.rootPattern &&
      this.cursor?.didSuccessfullyParse()
    ) {
      this.tokens = null;
      return;
    }

    if (this.patternMatch?.astNode == null) {
      let options = this.rootPattern?.getTokens();

      options = options?.filter((option: any) => {
        return option.indexOf(this.text) > -1;
      });

      if (options?.length === 0) {
        this.tokens = null;
        return;
      }

      const values = options?.map((option) => {
        const parts = option.split(this.text);
        return parts[1];
      });

      this.tokens = {
        startIndex: 0,
        values: values || [],
      };

      this.matchedText = this.text;
      this.match = {
        text: this.text,
        startIndex: 0,
        endIndex: this.text.length - 1,
      };
      this.error = null;
      
      return;
    }

    const options = this.options;
    let startIndex = this.matchedText.length;

    if (this.matchedText.length < this.text.length) {
      const leftOver = this.text.substring(this.matchedText.length);
      const partialMatchOptions = options
        .filter((option: any) => {
          return option.indexOf(leftOver) === 0;
        })
        .map((option: any) => {
          return option.substring(leftOver.length);
        });

      if (partialMatchOptions.length === 0) {
        this.tokens = null;
        return;
      } else {
        if (this.match == null) {
          return;
        }

        this.match = {
          text: this.match.text + leftOver,
          startIndex: this.match.startIndex,
          endIndex: this.match.endIndex + leftOver.length,
        };

        this.error = null;

        this.tokens = {
          startIndex: this.match.endIndex + 1,
          values: partialMatchOptions,
        };

        return;
      }
    }

    this.tokens = {
      startIndex,
      values: options,
    };
  }

  private saveOptions() {
    const furthestMatches = this.cursor?.history.astNodes.reduce(
      (acc: any, node: any, index: any) => {
        if (node.endIndex === acc.furthestTextIndex) {
          acc.nodeIndexes.push(index);
        } else if (node.endIndex > acc.furthestTextIndex) {
          acc.furthestTextIndex = node.endIndex;
          acc.nodeIndexes = [index];
        }

        return acc;
      },
      { furthestTextIndex: -1, nodeIndexes: [] }
    );

    const matches = furthestMatches.nodeIndexes.reduce(
      (acc: any, index: any) => {
        const pattern = this.cursor?.history.patterns[index];
        const tokens = pattern?.getNextTokens();

        tokens?.forEach((token: any) => {
          acc[token] = true;
        });

        return acc;
      },
      {}
    );

    this.options = Object.keys(matches);
  }

  static suggest(text: string, pattern: Pattern) {
    return new TextSuggester().suggest(text, pattern);
  }
}
