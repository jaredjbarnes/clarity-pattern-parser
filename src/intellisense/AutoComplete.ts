import { Cursor } from "../patterns/Cursor";
import { Match } from "../patterns/CursorHistory";
import { ParseError } from "../patterns/ParseError";
import { Pattern } from "../patterns/Pattern";
import { Suggestion } from "./Suggestion";
import { SuggestionOption } from "./SuggestionOption";

export interface AutoCompleteOptions {
  /**
   * Allows for certain patterns to combine their tokens with the next tokens. 
   * Be very careful, this can explode to infinity pretty quick. Usually useful 
   * for dividers and spaces.
   */
  greedyPatternNames?: string[];
  /**
   * Allows for custom suggestions for patterns. The key is the name of the pattern
   * and the string array are the tokens suggested for that pattern.
   */
  customTokens?: Record<string, string[]>;
}

const defaultOptions = { greedyPatternNames: [], customTokens: {} };

export class AutoComplete {
  private _pattern: Pattern;
  private _options: AutoCompleteOptions;
  private _cursor!: Cursor;
  private _text: string;

  constructor(pattern: Pattern, options: AutoCompleteOptions = defaultOptions) {
    this._pattern = pattern;
    this._options = options;
    this._text = "";
  }

  suggestForWithCursor(cursor: Cursor): Suggestion {
    cursor.moveTo(0);

    this._cursor = cursor;
    this._text = cursor.text;
    this._cursor.startRecording();

    if (cursor.length === 0) {
      return {
        isComplete: false,
        options: this._createSuggestionsFromRoot(),
        error: new ParseError(0, 0, this._pattern),
        errorAtIndex: 0,
        cursor,
        ast: null
      };
    }

    let errorAtIndex = null;
    let error = null;

    const ast = this._pattern.parse(this._cursor);
    const isComplete = ast?.value === this._text;
    const options = this._getAllOptions();

    if (!isComplete && options.length > 0 && !this._cursor.hasError) {
      const startIndex = options.reduce((lowestIndex, o) => {
        return Math.min(lowestIndex, o.startIndex);
      }, Infinity);
      const endIndex = cursor.getLastIndex() + 1;

      error = new ParseError(startIndex, endIndex, this._pattern);
      errorAtIndex = startIndex;
    } else if (!isComplete && options.length === 0 && ast != null) {
      const startIndex = ast.endIndex;
      const endIndex = cursor.getLastIndex() + 1;

      error = new ParseError(startIndex, endIndex, this._pattern);
      errorAtIndex = startIndex;
    } else if (!isComplete && this._cursor.hasError && this._cursor.furthestError != null) {
      errorAtIndex = this.getFurthestPosition(cursor);
      error = new ParseError(errorAtIndex, errorAtIndex, this._pattern);
    }

    return {
      isComplete: isComplete,
      options: options,
      error,
      errorAtIndex,
      cursor: cursor,
      ast,
    };

  }

  private getFurthestPosition(cursor: Cursor): number {
    const furthestError = cursor.furthestError;
    const furthestMatch = cursor.allMatchedNodes[cursor.allMatchedNodes.length - 1];

    if (furthestError && furthestMatch) {
      if (furthestError.endIndex > furthestMatch.endIndex) {
        return furthestMatch.endIndex;
      } else {
        return furthestError.endIndex;
      }
    }

    if (furthestError == null && furthestMatch != null) {
      return furthestMatch.endIndex;
    }

    if (furthestMatch == null && furthestError != null) {
      return furthestError.endIndex;
    }

    return 0;
  }

  suggestFor(text: string): Suggestion {
    return this.suggestForWithCursor(new Cursor(text));
  }

  private _getAllOptions() {
    const errorMatches = this._getOptionsFromErrors();
    const leafMatches = this._cursor.leafMatches.map((m) => this._createSuggestionsFromMatch(m)).flat();
    const finalResults: SuggestionOption[] = [];

    [...leafMatches, ...errorMatches].forEach(m => {
      const index = finalResults.findIndex(f => m.text === f.text);
      if (index === -1) {
        finalResults.push(m);
      }
    });

    return finalResults;
  }

  private _getOptionsFromErrors() {
    // These errored because the length of the string.
    const errors = this._cursor.errors.filter(e => e.endIndex === this._cursor.length);
    const suggestions = errors.map(e => {
      const tokens = this._getTokensForPattern(e.pattern);
      const adjustedTokens = tokens.map(t => t.slice(e.endIndex - e.startIndex));
      return this._createSuggestions(e.endIndex, adjustedTokens);
    });

    return suggestions.flat();
  }

  private _createSuggestionsFromRoot(): SuggestionOption[] {
    const suggestions: SuggestionOption[] = [];
    const tokens = this._pattern.getTokens();

    for (const token of tokens) {
      if (suggestions.findIndex(s => s.text === token) === -1) {
        suggestions.push(this._createSuggestion("", token));
      }
    }

    return suggestions;
  }

  private _createSuggestionsFromMatch(match: Match): SuggestionOption[] {
    if (match.pattern == null) {
      return this._createSuggestions(-1, this._getTokensForPattern(this._pattern));
    }

    const leafPattern = match.pattern;
    const parent = match.pattern.parent;

    if (parent !== null && match.node != null) {
      const patterns = leafPattern.getNextPatterns();

      const tokens = patterns.reduce((acc: string[], pattern) => {
        acc.push(...this._getTokensForPattern(pattern));
        return acc;
      }, []);

      return this._createSuggestions(match.node.lastIndex, tokens);
    } else {
      return [];
    }
  }

  private _getTokensForPattern(pattern: Pattern) {
    const augmentedTokens = this._getAugmentedTokens(pattern);

    if (this._options.greedyPatternNames != null && this._options.greedyPatternNames.includes(pattern.name)) {
      const nextPatterns = pattern.getNextPatterns();
      const tokens: string[] = [];

      const nextPatternTokens = nextPatterns.reduce((acc: string[], pattern) => {
        acc.push(...this._getTokensForPattern(pattern));
        return acc;
      }, []);

      for (let token of augmentedTokens) {
        for (let nextPatternToken of nextPatternTokens) {
          tokens.push(token + nextPatternToken);
        }
      }

      return tokens;
    } else {
      return augmentedTokens;
    }
  }

  private _getAugmentedTokens(pattern: Pattern) {
    const customTokensMap: any = this._options.customTokens || {};
    const leafPatterns = pattern.getPatterns();
    const tokens: string[] = customTokensMap[pattern.name] || [];

    leafPatterns.forEach(p => {
      const augmentedTokens = customTokensMap[p.name] || [];
      tokens.push(...p.getTokens(), ...augmentedTokens);
    });

    return tokens;
  }

  private _createSuggestions(lastIndex: number, tokens: string[]): SuggestionOption[] {
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
        options.push(this._createSuggestion(this._cursor.text, suggestion));
      }
    }

    const reducedOptions = getFurthestOptions(options);
    reducedOptions.sort((a, b) => a.text.localeCompare(b.text));

    return reducedOptions;
  }

  private _createSuggestion(fullText: string, suggestion: string): SuggestionOption {
    const furthestMatch = findMatchIndex(suggestion, fullText);
    const text = suggestion.slice(furthestMatch);

    return {
      text: text,
      startIndex: furthestMatch,
    };
  }

  static suggestFor(text: string, pattern: Pattern, options?: AutoCompleteOptions) {
    return new AutoComplete(pattern, options).suggestFor(text);
  }

  static suggestForWithCursor(cursor: Cursor, pattern: Pattern, options?: AutoCompleteOptions) {
    return new AutoComplete(pattern, options).suggestForWithCursor(cursor);
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

