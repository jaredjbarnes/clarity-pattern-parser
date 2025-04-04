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
      const lastIndex = cursor.getLastIndex() + 1;

      error = new ParseError(startIndex, lastIndex, this._pattern);
      errorAtIndex = startIndex;
    } else if (!isComplete && options.length === 0 && ast != null) {
      const startIndex = ast.endIndex;
      const lastIndex = cursor.getLastIndex() + 1;

      error = new ParseError(startIndex, lastIndex, this._pattern);
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
      if (furthestError.lastIndex > furthestMatch.endIndex) {
        return furthestMatch.endIndex;
      } else {
        return furthestError.lastIndex;
      }
    }

    if (furthestError == null && furthestMatch != null) {
      return furthestMatch.endIndex;
    }

    if (furthestMatch == null && furthestError != null) {
      return furthestError.lastIndex;
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
    const errors = this._cursor.errors.filter(e => e.lastIndex === this._cursor.length);
    const suggestions = errors.map(e => {
      const tokens = this._getTokensForPattern(e.pattern);
      const adjustedTokens: Set<string> = new Set();
      const currentText = this._cursor.getChars(e.startIndex, e.lastIndex);

      tokens.forEach((token)=>{
        if (token.startsWith(currentText) && token.length > currentText.length){
          const difference = token.length - currentText.length;
          const suggestedText = token.slice(-difference);
          adjustedTokens.add(suggestedText);
        }
      });

      return Array.from(adjustedTokens).map(t=>{
        return {
          text: t,
          startIndex: e.lastIndex,
        }
      });
    });

    return suggestions.flat();
  }

  private _createSuggestionsFromRoot(): SuggestionOption[] {
    const suggestions: SuggestionOption[] = [];
    const tokens = [...this._pattern.getTokens(),... this._getTokensForPattern(this._pattern)];

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

    if ( match.node != null) {
    const textStartingMatch = this._text.slice(match.node.startIndex,match.node.endIndex)
    const currentPatternsTokens = this._getTokensForPattern(match.pattern);
    /**
     * Compares tokens to current text and extracts remainder tokens
     * - IE. **currentText:** *abc*, **baseToken:** *abcdef*, **trailingToken:** *def*
     */
    const trailingTokens = currentPatternsTokens.reduce<string[]>((acc, token) => {
      if (token.startsWith(textStartingMatch)) {
        const sliced = token.slice(textStartingMatch.length);
        if (sliced !== '') {
          acc.push(sliced);
        }
      }
      return acc;
    }, []);
    
    const leafPatterns = match.pattern.getNextPatterns();
    const leafTokens = leafPatterns.reduce((acc: string[], leafPattern) => {
      acc.push(...this._getTokensForPattern(leafPattern));
      return acc;
    }, []);

    const allTokens = [...trailingTokens,...leafTokens]
      return this._createSuggestions(match.node.lastIndex, allTokens);
    } else {
      return [];
    }
  }

  private _getTokensForPattern(pattern: Pattern) {
    const augmentedTokens = this._getAugmentedTokens(pattern);

    if (this._options.greedyPatternNames != null && this._options.greedyPatternNames.includes(pattern.name)) {
      const nextPatterns = pattern.getNextPatterns();
      const nextPatternTokens = nextPatterns.reduce((acc: string[], pattern) => {
        acc.push(...this._getTokensForPattern(pattern));
        return acc;
      }, []);
      // using set to prevent duplicates
      const tokens = new Set<string>();
      
      for (const token of augmentedTokens) {
        for (const nextPatternToken of nextPatternTokens) {    
          tokens.add(token + nextPatternToken);
        }
      }

      return [...tokens]
        } else {
      return augmentedTokens;
    }
  }

  private _getAugmentedTokens(pattern: Pattern) {
    const customTokensMap: any = this._options.customTokens || {};
    const leafPatterns = pattern.getPatterns();

  /** Using Set to
   * - prevent duplicates
   * - prevent mutation of original customTokensMap
   */
  const customTokensForPattern = new Set<string>(customTokensMap[pattern.name] ?? []);

  for (const lp of leafPatterns) {
    const augmentedTokens = customTokensMap[lp.name] ?? [];
    const lpsCombinedTokens = [...lp.getTokens(), ...augmentedTokens];

  for (const token of lpsCombinedTokens) {    
    customTokensForPattern.add(token);
  }
  }
    return [...customTokensForPattern];
  }

  private _createSuggestions(lastIndex: number, tokens: string[]): SuggestionOption[] {
    let textToIndex = lastIndex === -1 ? "" : this._cursor.getChars(0, lastIndex);
    const suggestionStrings: string[] = [];
    const options: SuggestionOption[] = [];

    for (const token of tokens) {
      // concatenated for start index identification inside createSuggestion
      const suggestion = textToIndex + token;
      const alreadyExist = suggestionStrings.includes(suggestion);
      const isSameAsText = suggestion === this._text;

      if ( !alreadyExist && !isSameAsText) {
        suggestionStrings.push(suggestion);
        const suggestionOption = this._createSuggestion(this._cursor.text, suggestion)
        options.push(suggestionOption);
      }
    }

    const reducedOptions = getFurthestOptions(options);
    reducedOptions.sort((a, b) => a.text.localeCompare(b.text));

    return reducedOptions;
  }

  private _createSuggestion(fullText: string, suggestion: string): SuggestionOption {
    const furthestMatch = findMatchIndex(suggestion, fullText);
    const text = suggestion.slice(furthestMatch);

    const option:SuggestionOption = {
      text: text,
      startIndex: furthestMatch,
    };
    return option
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

