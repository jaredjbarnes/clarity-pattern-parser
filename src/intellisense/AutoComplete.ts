import { Node } from "../ast/Node";
import { Cursor } from "../patterns/Cursor";
import { ParseError } from "../patterns/ParseError";
import { Pattern } from "../patterns/Pattern";
import { Suggestion } from "./Suggestion";
import { SuggestionOption } from "./SuggestionOption";

export class AutoComplete {
  private _pattern: Pattern;
  private _cursor!: Cursor;
  private _text: string;

  constructor(pattern: Pattern) {
    this._pattern = pattern;
    this._text = "";
  }

  suggest(text: string): Suggestion {
    if (text.length === 0) {
      return {
        isComplete: false,
        options: this.createSuggestionsFromRoot(),
        nextPattern: this._pattern,
        cursor: null,
        error: new ParseError(0, this._pattern),
      }
    }

    this._text = text;
    this._cursor = new Cursor(text);
    this._pattern.parse(this._cursor);

    const leafPattern = this._cursor.leafMatch.pattern;
    const rootMatch = this._cursor.rootMatch.pattern;
    const isComplete = this._cursor.isOnLast && rootMatch === this._pattern;
    const options = this.createSuggestionsFromTokens();

    return {
      isComplete: isComplete,
      options: options,
      nextPattern: leafPattern?.getNextPattern() || this._pattern,
      cursor: this._cursor,
      error: this._cursor.furthestError
    }
  }

  private createSuggestionsFromRoot(): SuggestionOption[] {
    const suggestions: SuggestionOption[] = [];
    const tokens = this._pattern.getTokens();

    for (const token of tokens) {
      suggestions.push(this.createSuggestion("", token));
    }

    return suggestions;
  }

  private createSuggestionsFromTokens(): SuggestionOption[] {
    const leafMatch = this._cursor.leafMatch;

    if (!leafMatch.pattern) {
      return this.createSuggestions(-1, this._pattern.getTokens());
    }

    const leafPattern = leafMatch.pattern;
    const parent = leafMatch.pattern.parent;

    if (parent !== null && leafMatch.node != null) {
      const tokens = parent.getNextTokens(leafPattern);
      return this.createSuggestions(leafMatch.node.lastIndex, tokens);
    } else {
      return [];
    }
  }

  private createSuggestions(lastIndex: number, tokens: string[]): SuggestionOption[] {
    let substring = lastIndex === -1 ? "" : this._cursor.getChars(0, lastIndex);
    const suggestionStrings: string[] = [];
    const options: SuggestionOption[] = [];

    for (const token of tokens) {
      const suggestion = substring + token;
      const startsWith = suggestion.startsWith(substring);
      const alreadyExist = suggestionStrings.includes(suggestion);
      const isSameAsText = suggestion === this._text;

      if (startsWith && !alreadyExist && !isSameAsText) {
        suggestionStrings.push(suggestion);
        options.push(this.createSuggestion(this._cursor.text, suggestion));
      }
    }

    const reducedOptions = getFurthestOptions(options);
    reducedOptions.sort((a, b) => a.text.localeCompare(b.text));

    return reducedOptions;
  }

  private createSuggestion(fullText: string, suggestion: string): SuggestionOption {
    const furthestMatch = findMatchIndex(suggestion, fullText);
    const text = suggestion.slice(furthestMatch);

    return {
      text: text,
      startIndex: furthestMatch,
    }
  }
}

function findMatchIndex(str1: string, str2: string): number {
  let matchCount = 0;
  let minLength = str1.length;

  if (str2.length < minLength) {
    minLength = str2.length;
  }

  for (let i = 0; i < minLength; i++) {
    if (str1[i] === str2[i]) {
      matchCount++;
    } else {
      break;
    }
  }

  return matchCount;
}

function getFurthestOptions(options: SuggestionOption[]): SuggestionOption[] {
  let furthestOptions: SuggestionOption[] = [];
  let furthestIndex = -1;

  for (const option of options) {
    if (option.startIndex > furthestIndex) {
      furthestIndex = option.startIndex;
      furthestOptions = [];
    }

    if (option.startIndex === furthestIndex) {
      furthestOptions.push(option);
    }
  }

  return furthestOptions;
}

