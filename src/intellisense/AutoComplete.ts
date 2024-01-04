import Cursor from "../patterns/Cursor";
import Node from "../ast/Node";
import Pattern from "../patterns/Pattern";
import { Suggestion } from "./Suggestion";
import { SuggestionOption } from "./SuggestionOption";

export class AutoComplete {
  private _pattern: Pattern;
  private _cursor!: Cursor;
  private _text: string;

  constructor(pattern: Pattern) {
    this._pattern = pattern;
  }

  suggest(text: string): Suggestion {
    if (text.length === 0) {
      return {
        isComplete: false,
        options: this._createOptionsFromRoot(),
        hasError: false,
        error: null,
        leafMatch: {
          pattern: null,
          node: null,
        },
        rootMatch: {
          pattern: null,
          node: null,
        },
        cursor: null
      };
    }

    this._text = text;
    this._cursor = new Cursor(text);
    this._pattern.parse(this._cursor);

    const rootPattern = this._cursor.history.rootMatch.pattern;
    const isComplete = this._cursor.isAtEnd() && rootPattern === this._pattern;

    return {
      isComplete,
      options: this._createOptionsFromTokens(),
      hasError: this._cursor.hasUnresolvedError(),
      error: this._cursor.history.error,
      leafMatch: this._cursor.history.leafMatch,
      rootMatch: this._cursor.history.rootMatch,
      cursor: this._cursor
    };
  }

  private _createOptionsFromRoot() {
    const tokens = this._pattern.getTokens();
    const fullText = this._cursor.text;

    return tokens.map((token) => {
      return this._createOption(fullText, token);
    });
  }

  private _createOption(
    fullText: string,
    suggestion: string
  ): SuggestionOption {
    const startsWith = suggestion.startsWith(fullText);

    if (startsWith) {
      const startIndex = fullText.length - 1;
      const text = suggestion.substring(startIndex);

      return {
        text,
        startIndex,
      };
    } else {
      return {
        text: suggestion,
        startIndex: 0,
      };
    }
  }

  private _createOptionsFromTokens() {
    const leafMatch = this._cursor.history.leafMatch;
    const leafPattern = leafMatch.pattern;
    const leafNode = leafMatch.node;

    if (leafPattern == null || leafNode == null) {
      return this._createSuggestions(0, this._pattern.getTokens());
    }

    const parent = leafPattern.parent;
    const hasParent = parent != null;
    let tokens: string[] = [];

    if (hasParent) {
      tokens = parent.getNextTokens(leafPattern);
    } else {
      tokens = leafPattern.getTokens();
    }

    return this._createSuggestions(leafNode.lastIndex, tokens);
  }

  private _createSuggestions(endIndex: number, tokens: string[]) {
    const substring = this._cursor.getChars(0, endIndex);
    const optionStrings: string[] = [];
    const options: SuggestionOption[] = [];

    tokens.forEach((token) => {
      const suggestion = substring + token;
      const startsWith = suggestion.startsWith(substring);
      const alreadyExist = optionStrings.includes(suggestion);
      const isSameAsText = suggestion == this._text;

      if (startsWith && !alreadyExist && !isSameAsText) {
        optionStrings.push(suggestion);
        options.push(this._createOption(this._text, suggestion));
      }
    });

    return options;
  }
}