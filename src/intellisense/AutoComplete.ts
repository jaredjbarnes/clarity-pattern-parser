import { Cursor } from "../patterns/Cursor";
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

  /**
   * @deprecated Use suggestFor instead.
   * @param text The text to suggest for.
   */
  suggest(text: string): Suggestion {
    return this.suggestFor(text);
  }

  suggestFor(text: string): Suggestion {
    if (text.length === 0) {
      return {
        isComplete: false,
        options: this._createSuggestionsFromRoot(),
        errorAtIndex: 0,
        cursor: null,
        ast: null
      }
    }

    this._text = text;
    this._cursor = new Cursor(text);

    let errorAtIndex = null;

    const ast = this._pattern.parse(this._cursor);
    const isComplete = ast?.value === text;
    const options = this._createSuggestionsFromTokens();

    if (this._cursor.hasError && this._cursor.furthestError != null) {
      errorAtIndex = this._cursor.furthestError.index;

      errorAtIndex = options.reduce((errorAtIndex, option) =>
        Math.max(errorAtIndex, option.startIndex),
        errorAtIndex);
    }

    return {
      isComplete: isComplete,
      options: options,
      errorAtIndex,
      cursor: this._cursor,
      ast,
    }
  }

  private _createSuggestionsFromRoot(): SuggestionOption[] {
    const suggestions: SuggestionOption[] = [];
    const tokens = this._pattern.getTokens();

    for (const token of tokens) {
      suggestions.push(this._createSuggestion("", token));
    }

    return suggestions;
  }

  private _createSuggestionsFromTokens(): SuggestionOption[] {
    const leafMatch = this._cursor.leafMatch;

    if (!leafMatch.pattern) {
      return this._createSuggestions(-1, this._getTokensForPattern(this._pattern));
    }

    const leafPattern = leafMatch.pattern;
    const parent = leafMatch.pattern.parent;

    if (parent !== null && leafMatch.node != null) {
      const patterns = leafPattern.getNextPatterns();

      const tokens = patterns.reduce((acc: string[], pattern) => {
        acc.push(...this._getTokensForPattern(pattern));
        return acc;
      }, []);

      return this._createSuggestions(leafMatch.node.lastIndex, tokens);
    } else {
      return [];
    }
  }

  private _getTokensForPattern(pattern: Pattern) {
    const augmentedTokens = this._getAugmentedTokens(pattern)

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

