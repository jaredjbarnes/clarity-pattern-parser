import { Cursor } from "../patterns/Cursor";
import { Match } from "../patterns/CursorHistory";
import { ParseError } from "../patterns/ParseError";
import { Pattern } from "../patterns/Pattern";
import { Suggestion } from "./Suggestion";
import { SuggestionSegment, SuggestionOption, CompositeSuggestion } from "./SuggestionOption";


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
  /**
   * Suggestions may share the same text but differ in their suggestionSequence. 
   * By default, duplicates are removed and only the first instance is kept. 
   * Disabling deduplication allows all distinct instances to be returned together.
   */
  disableDedupe?: boolean;
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

  suggestFor(text: string): Suggestion {
    return this.suggestForWithCursor(new Cursor(text));
  }

  suggestForWithCursor(cursor: Cursor): Suggestion {
    cursor.moveTo(0);

    this._cursor = cursor;
    this._text = cursor.text;
    this._cursor.startRecording();

    if (cursor.length === 0) {

      const suggestion: Suggestion = {
        isComplete: false,
        options: this._createSuggestionOptionsFromMatch(),
        error: new ParseError(0, 0, this._pattern),
        errorAtIndex: 0,
        cursor,
        ast: null
      }

      return suggestion;
    }

    let errorAtIndex = null;
    let error = null;

    const ast = this._pattern.parse(this._cursor);
    const isComplete = ast?.value === this._text;
    const options = this._getAllSuggestionsOptions();

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
      if (furthestMatch.endIndex  > furthestError.lastIndex ) {
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



  private _getAllSuggestionsOptions() {

    const errorMatchOptions = this._createSuggestionOptionsFromErrors();
    const leafMatchOptions = this._cursor.leafMatches.map((m) => this._createSuggestionOptionsFromMatch(m)).flat();
    
    const finalResults: SuggestionOption[] = [];
    [...leafMatchOptions, ...errorMatchOptions].forEach(m => {
      const index = finalResults.findIndex(f => m.text === f.text);
      if (index === -1) {
        finalResults.push(m);
      }
    });

    return getFurthestOptions(finalResults);
  }

  private _createSuggestionOptionsFromErrors() {
    // These errored because the length of the string.
    const errors = this._cursor.errors.filter(e => e.lastIndex === this._cursor.length);
    
    const errorSuggestionOptions = errors.map(parseError => {

      const currentText = this._cursor.getChars(parseError.startIndex, parseError.lastIndex);
    
      const compositeSuggestions = this._getCompositeSuggestionsForPattern(parseError.pattern);
      const trimmedErrorCompositeSuggestions = this._trimSuggestionsByExistingText(currentText, compositeSuggestions);
  
      return this._createSuggestions(parseError.lastIndex, trimmedErrorCompositeSuggestions);
    }).flat();

    const dedupedErrorSuggestionOptions = this._deDupeCompositeSuggestions(errorSuggestionOptions);

    return dedupedErrorSuggestionOptions
  }


  private _createSuggestionOptionsFromMatch(match?: Match): SuggestionOption[] {

    if (match?.pattern == null) {
      const compositeSuggestions = this._getCompositeSuggestionsForPattern(this._pattern);
      return this._createSuggestions(-1, compositeSuggestions);
    }

    if ( match?.node != null) {
      const currentText = this._text.slice(match.node.startIndex,match.node.endIndex)
      
      
      /**Captures suggestions for a "completed" match pattern that still has existing possible suggestions.
       * particularly relevant when working with set/custom tokens.
      */
      const matchCompositeSuggestions = this._getCompositeSuggestionsForPattern(match.pattern)
      const trimmedMatchCompositeSuggestions =  this._trimSuggestionsByExistingText(currentText, matchCompositeSuggestions) 

      
      const leafPatterns = match.pattern.getNextPatterns();
      const leafCompositeSuggestions = leafPatterns.flatMap(leafPattern => 
      this._getCompositeSuggestionsForPattern(leafPattern)
    );

     const allCompositeSuggestions = [...leafCompositeSuggestions,...trimmedMatchCompositeSuggestions,]

     const dedupedCompositeSuggestions = this._deDupeCompositeSuggestions(allCompositeSuggestions);

      return this._createSuggestions(match.node.lastIndex, dedupedCompositeSuggestions);
    } else {
      return [];
    }
  }

  /**
   * Compares suggestions with provided text and removes completed sub-sequences and preceding text
   * - IE. **currentText:** *abc*, **sequence:** *[{ab}{cd}{ef}*
   *   - refines to {d}{ef}
   */
  private _trimSuggestionsByExistingText(currentText: string, compositeSuggestions: CompositeSuggestion[]): CompositeSuggestion[] {
    
        const trimmedSuggestions = compositeSuggestions.reduce<CompositeSuggestion[]>((acc, compositeSuggestion) => {
          if (compositeSuggestion.text.startsWith(currentText)) {
    
            const filteredSegments = this._filterCompletedSubSegments(currentText, compositeSuggestion);
            const slicedSuggestionText = compositeSuggestion.text.slice(currentText.length);
    
            if (slicedSuggestionText !== '') {
              const refinedCompositeSuggestion: CompositeSuggestion = {
                text: slicedSuggestionText,
                suggestionSequence: filteredSegments,
              }
    
              acc.push(refinedCompositeSuggestion);
            }
          }
          return acc;
        }, []);

        return trimmedSuggestions
  }

    /** Removed segments already accounted for in the existing text.
   * ie. sequence pattern segments ≈ [{look}, {an example}, {phrase}]
   * fullText = "look an"
   * remove {look} segment as its already been completed by the existing text.
 */
    private _filterCompletedSubSegments(currentText: string, compositeSuggestion: CompositeSuggestion){

      let elementsToRemove: SuggestionSegment [] = [];
      let workingText = currentText;
  
      compositeSuggestion.suggestionSequence.forEach(segment => {
        /**sub segment has been completed, remove it from the sequence */
        if(workingText.startsWith(segment.text)){
          workingText = workingText.slice(segment.text.length);
          elementsToRemove.push (segment);
        }
      })
  
      const filteredSegments = compositeSuggestion.suggestionSequence.filter(segment => !elementsToRemove.includes (segment) );
  
      return filteredSegments
    }

  private _getCompositeSuggestionsForPattern(pattern: Pattern):CompositeSuggestion[] {

    const suggestionsToReturn:CompositeSuggestion[] = [];
    
    const leafPatterns = pattern.getPatterns();
    // for when pattern has no leafPatterns and only returns itself
    if(leafPatterns.length === 1 && leafPatterns[0].id === pattern.id) { 

      const currentCustomTokens = this._getCustomTokens(pattern);
      const currentTokens = pattern.getTokens();
      const allTokens = [...currentCustomTokens, ...currentTokens];

      const leafCompositeSuggestions: CompositeSuggestion[] = allTokens.map(token => {

        const segment:SuggestionSegment = {
          text: token,
          pattern: pattern,
        }
  
        const compositeSuggestion:CompositeSuggestion = { 
          text: token,
          suggestionSequence: [segment],
        }
        return compositeSuggestion;
      })
      suggestionsToReturn.push(...leafCompositeSuggestions);

    }else{

      const currentCustomTokens = this._getCustomTokens(pattern);

      const patternsSuggestionList = currentCustomTokens.map(token => {
        const segment:SuggestionSegment = {
          text: token,
          pattern: pattern,
        }

        const patternSuggestion:CompositeSuggestion = {
          text: token,
          suggestionSequence: [segment],
        }
        return patternSuggestion;
      })

      const leafCompositeSuggestions = leafPatterns.map(lp => this._getCompositeSuggestionsForPattern(lp)).flat();

      suggestionsToReturn.push(...patternsSuggestionList, ...leafCompositeSuggestions);
    }

    if (this._options.greedyPatternNames != null && this._options.greedyPatternNames.includes(pattern.name)) {

      const nextPatterns = pattern.getNextPatterns();

      const nextPatternedTokensList = nextPatterns.reduce<CompositeSuggestion[]>((acc, pattern) => {
        const patternedTokensList = this._getCompositeSuggestionsForPattern(pattern);
        acc.push(...patternedTokensList);

        return acc;
      }, []);
      
      const compositeSuggestionList:CompositeSuggestion[] = [];
      
      for (const currentSuggestion of suggestionsToReturn) {
        for (const nextSuggestionWithSubElements of nextPatternedTokensList) { 

          const augmentedTokenWithPattern:CompositeSuggestion = {
            text: currentSuggestion.text + nextSuggestionWithSubElements.text,
            suggestionSequence: [...currentSuggestion.suggestionSequence,...nextSuggestionWithSubElements.suggestionSequence ],
          }

          compositeSuggestionList.push(augmentedTokenWithPattern);
        }
      }

      return compositeSuggestionList;

    } else {   

      const dedupedSuggestions = this._deDupeCompositeSuggestions(suggestionsToReturn);
      return dedupedSuggestions;
    }
  }

  private _getCustomTokens(pattern: Pattern) {

   const customTokensMap: Record<string, string[]> = this._options.customTokens || {};
   const customTokens = customTokensMap[pattern.name] ?? [];

   const allTokens = [...customTokens];

   return allTokens;
  }


  
  private _deDupeCompositeSuggestions<T extends CompositeSuggestion>(suggestions: T[]): T[] {

    if (this._options.disableDedupe) {
      return suggestions;
    }

    const seen = new Set<string>();
    const unique: T[] = [];

    for (const suggestion of suggestions) {
      // Create a unique key based on text and subElements
      const subElementsKey = suggestion.suggestionSequence
        .map(sub => ` ${sub.pattern.name} - ${sub.text}  `)
        .sort()
        .join('|');


      const key = `${suggestion.text}|${subElementsKey}`;

      if (!seen.has(key)) {
        seen.add(key);
        unique.push(suggestion);
      }
    }

    return unique;
  }

  private _createSuggestions(lastIndex: number, compositeSuggestionList:CompositeSuggestion[]): SuggestionOption[] {

    let textToIndex = lastIndex === -1 ? "" : this._cursor.getChars(0, lastIndex);
    const suggestionStrings: string[] = [];
    const options: SuggestionOption[] = [];

    for (const compositeSuggestion of compositeSuggestionList) {
      // concatenated for start index identification inside createSuggestion
      const existingTextWithSuggestion = textToIndex + compositeSuggestion.text;

      const alreadyExist = suggestionStrings.includes(existingTextWithSuggestion);
      const isSameAsText = existingTextWithSuggestion === this._text;

      // if ( !alreadyExist && !isSameAsText) {
        suggestionStrings.push(existingTextWithSuggestion);
        const suggestionOption = this._createSuggestionOption(this._cursor.text, existingTextWithSuggestion, compositeSuggestion.suggestionSequence);
        options.push(suggestionOption);
      // }
    }

    const reducedOptions = getFurthestOptions(options);
    reducedOptions.sort((a, b) => a.text.localeCompare(b.text));

    return reducedOptions;
  }

  private _createSuggestionOption(fullText: string, suggestion: string, segments: SuggestionSegment[]): SuggestionOption {
    const furthestMatch = findMatchIndex(suggestion, fullText);
    const text = suggestion.slice(furthestMatch);

    const option:SuggestionOption = {
      text: text,
      startIndex: furthestMatch,
      suggestionSequence: segments,
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

