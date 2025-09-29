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
  disableDedupe?:boolean
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

  suggestFor(text: string): Suggestion {
    return this.suggestForWithCursor(new Cursor(text));
  }

  private _getAllOptions() {
    const errorMatchSuggestions = this._getOptionsFromErrors();
    const leafMatchSuggestions = this._cursor.leafMatches.map((m) => this._createSuggestionsFromMatch(m)).flat();
    
    const finalResults: SuggestionOption[] = [];
    [...leafMatchSuggestions, ...errorMatchSuggestions].forEach(m => {
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
    const errorSuggestionOptions = errors.map(e => {
      const errorTokens = this._createTokensFromError(e);
      return this._createSuggestions(e.lastIndex, errorTokens);
    }).flat();

    /////////FIXME: dedupe?

    return errorSuggestionOptions
  }




  private _createTokensFromError(parseError:ParseError){
    const suggestionsWithSubElements = this._getTokensForPattern(parseError.pattern);
    const currentText = this._cursor.getChars(parseError.startIndex, parseError.lastIndex);


    const errorTokens = suggestionsWithSubElements.reduce<CompositeSuggestion[]>((acc, token) => {
      if (token.text.startsWith(currentText)){

        // look at full existing text that is part of the current match
        let fullText = currentText;
        let elementsToRemove: SuggestionSegment [] = [];


          token.suggestionSequence.forEach(subElement => {

            if(fullText.startsWith(subElement.text)){

              fullText = fullText.slice(subElement.text.length);
              elementsToRemove.push (subElement);
            }
          })

        const mutatedSubElements = token.suggestionSequence. filter(subElement => !elementsToRemove. includes (subElement) );

          const sliced = token.text.slice(currentText.length);
          if (sliced !== '') {
            acc.push({text: sliced, suggestionSequence: mutatedSubElements});
          }
      }
      return acc;

    }, []);


    return errorTokens;
  }

  private _createSuggestionsFromRoot(): SuggestionOption[] {
    
    const tokens = this._getTokensForPattern(this._pattern)
    
    const suggestions: SuggestionOption[] = [];
    for (const token of tokens) {
      //if (suggestions.findIndex(sOption => sOption.text === token.token) === -1) {
        suggestions.push(this._createSuggestion("", token.text, token.suggestionSequence));
      //}
    }

    return suggestions;
  }

  private _createSuggestionsFromMatch(match: Match): SuggestionOption[] {

    if (match.pattern == null) {
      const tokens = this._getTokensForPattern(this._pattern);
      return this._createSuggestions(-1, tokens);
    }

    if ( match.node != null) {
    const textStartingMatch = this._text.slice(match.node.startIndex,match.node.endIndex)
    const currentPatternsTokens = this._getTokensForPattern(match.pattern)
    /**
     * Compares tokens to current text and extracts remainder tokens
     * - IE. **currentText:** *abc*, **baseToken:** *abcdef*, **trailingToken:** *def*
     */
    const trailingTokens = currentPatternsTokens.reduce<CompositeSuggestion[]>((acc, token) => {
      if (token.text.startsWith(textStartingMatch)) {


        // look at full existing text that is part of the current match
        let fullText = textStartingMatch;
        let elementsToRemove:SuggestionSegment[] = [];


        token.suggestionSequence.forEach(subElement => {
          if(fullText.startsWith(subElement.text)){
            // this is for greedy situations
            // if it starts with the sub element, it means we have already passed it and can remove its text, and driving pattern 
            fullText = fullText.slice(subElement.text.length);
            elementsToRemove.push(subElement);
          }
        });

        // these are the remaining sub-elements after the purging of completed sub elements
        const mutatedSubElements = token.suggestionSequence.filter(subElement => !elementsToRemove.includes(subElement));

        const sliced = token.text.slice(textStartingMatch.length);
        // const remainder = token.text.slice(0,textStartingMatch.length);
        if (sliced !== '') {
          acc.push({text: sliced, suggestionSequence: mutatedSubElements});
        }
      }
      return acc;
    }, []);

    
    const leafPatterns = match.pattern.getNextPatterns();
    const leafTokens = leafPatterns.reduce((acc:CompositeSuggestion[], leafPattern) => {
      const tokens = this._getTokensForPattern(leafPattern);
      acc.push(...tokens);
      return acc;
    }, []);

     const allTokens = [...leafTokens,...trailingTokens,]

     // Remove duplicates based on text and subElements
     const uniqueTokens = this._deDupeCompositeSuggestions(allTokens);

      return this._createSuggestions(match.node.lastIndex, uniqueTokens);
    } else {
      return [];
    }
  }

  private _getTokensForPattern(pattern: Pattern):CompositeSuggestion[] {

    const suggestionsToReturn:CompositeSuggestion[] = [];
    const leafPatterns = pattern.getPatterns();

    // pattern has no leafs and only returns itself
    if(leafPatterns.length === 1 && leafPatterns[0].id === pattern.id) { 

      const currentCustomTokens = this._getCustomTokens(pattern);
      const currentTokens = pattern.getTokens();
      const allTokens = [...currentCustomTokens, ...currentTokens];

      const suggestionWithSubElementsList: CompositeSuggestion[] = allTokens.map(token => {

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
      suggestionsToReturn.push(...suggestionWithSubElementsList);

    }else{

      const currentCustomTokens = this._getCustomTokens(pattern);

      const augmentedSuggestions = currentCustomTokens.map(token => {
        const subElement:SuggestionSegment = {
          text: token,
          pattern: pattern,
        }

        const suggestionWithSubElements:CompositeSuggestion = {
          text: token,
          suggestionSequence: [subElement],
        }
        return suggestionWithSubElements;
      })

      const leafSuggestionWithSubElementsList = leafPatterns.map(lp => this._getTokensForPattern(lp)).flat();

      suggestionsToReturn.push(...augmentedSuggestions, ...leafSuggestionWithSubElementsList);
    }

    if (this._options.greedyPatternNames != null && this._options.greedyPatternNames.includes(pattern.name)) {

      const nextPatterns = pattern.getNextPatterns();

      const nextPatternedTokensList = nextPatterns.reduce<CompositeSuggestion[]>((acc, pattern) => {
        const patternedTokensList = this._getTokensForPattern(pattern);
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

  private _createSuggestions(lastIndex: number, suggestionWithSubElements:CompositeSuggestion[]): SuggestionOption[] {

    let textToIndex = lastIndex === -1 ? "" : this._cursor.getChars(0, lastIndex);
    const suggestionStrings: string[] = [];
    const options: SuggestionOption[] = [];

    for (const patternedToken of suggestionWithSubElements) {
      // concatenated for start index identification inside createSuggestion
      const existingTextWithSuggestion = textToIndex + patternedToken.text;

      const alreadyExist = suggestionStrings.includes(existingTextWithSuggestion);
      const isSameAsText = existingTextWithSuggestion === this._text;

      // if ( !alreadyExist && !isSameAsText) {
        suggestionStrings.push(existingTextWithSuggestion);
        const suggestionOption = this._createSuggestion(this._cursor.text, existingTextWithSuggestion, patternedToken.suggestionSequence);
        options.push(suggestionOption);
      // }
    }

    const reducedOptions = getFurthestOptions(options);
    reducedOptions.sort((a, b) => a.text.localeCompare(b.text));

    return reducedOptions;
  }

  private _createSuggestion(fullText: string, suggestion: string, segments: SuggestionSegment[]): SuggestionOption {
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

