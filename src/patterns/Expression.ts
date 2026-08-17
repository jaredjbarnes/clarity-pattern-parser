import type { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import { classifyExpressionPatterns } from "./classifyExpressionPatterns";
import type { Cursor } from "./Cursor";
import type { Pattern } from "./Pattern";
import { type Association, PrecedenceTree } from "./PrecedenceTree";

export class Expression extends BasePattern {
  private _originalName: string;
  private _cachedParent: Pattern | null;
  private _originalPatterns: Pattern[];
  private _atomPatterns: Pattern[];
  private _prefixPatterns: Pattern[];
  private _prefixNames: string[];
  private _postfixPatterns: Pattern[];
  private _postfixNames: string[];
  private _infixPatterns: Pattern[];
  private _infixNames: string[];
  private _associationMap: Record<string, Association>;
  private _precedenceMap: Record<string, number>;
  private _shouldStopParsing: boolean;
  private _precedenceTree: PrecedenceTree;
  private _hasOrganized: boolean;
  private _atomsIdToAncestorsMap: Record<string, Pattern[]>;

  get prefixPatterns(): readonly Pattern[] {
    return this._prefixPatterns;
  }

  get atomPatterns(): readonly Pattern[] {
    return this._atomPatterns;
  }

  get postfixPatterns(): readonly Pattern[] {
    return this._postfixPatterns;
  }

  get infixPatterns(): readonly Pattern[] {
    return this._infixPatterns;
  }

  // @deprecated use infixPatterns instead
  get binaryPatterns(): readonly Pattern[] {
    return this._infixPatterns;
  }

  get originalPatterns(): readonly Pattern[] {
    return this._originalPatterns;
  }

  constructor(name: string, patterns: Pattern[]) {
    if (patterns.length === 0) {
      throw new Error("Need at least one pattern with an 'expression' pattern.");
    }

    super("expression", name);

    this._originalName = name;
    this._cachedParent = null;
    this._atomPatterns = [];
    this._prefixPatterns = [];
    this._prefixNames = [];
    this._postfixPatterns = [];
    this._postfixNames = [];
    this._infixPatterns = [];
    this._infixNames = [];
    this._associationMap = {};
    this._precedenceMap = {};
    this._originalPatterns = patterns;
    this._shouldStopParsing = false;
    this._hasOrganized = false;
    this._children = [];
    this._precedenceTree = new PrecedenceTree({}, {});
    this._atomsIdToAncestorsMap = {};
  }

  private _organizePatterns(patterns: Pattern[]) {
    const classified = classifyExpressionPatterns(patterns, this._originalName, this);

    this._atomPatterns = classified.atomPatterns;
    this._prefixPatterns = classified.prefixPatterns;
    this._prefixNames = classified.prefixNames;
    this._postfixPatterns = classified.postfixPatterns;
    this._postfixNames = classified.postfixNames;
    this._infixPatterns = classified.infixPatterns;
    this._infixNames = classified.infixNames;
    this._precedenceMap = classified.precedenceMap;
    this._associationMap = classified.associationMap;

    this._children = classified.patterns;
    this._precedenceTree = new PrecedenceTree(this._precedenceMap, this._associationMap);

    return classified.patterns;
  }

  private _cacheAncestors() {
    for (const atom of this._atomPatterns) {
      const id = atom.id;
      const ancestors: Pattern[] = [];
      this._atomsIdToAncestorsMap[id] = ancestors;

      let pattern: Pattern | null = this.parent;
      while (pattern != null) {
        if (pattern.id === id) {
          ancestors.push(pattern);
        }
        pattern = pattern.parent;
      }
    }
  }

  build() {
    if (!this._hasOrganized || this._cachedParent !== this.parent) {
      this._cachedParent = this.parent;
      this._hasOrganized = true;
      this._organizePatterns(this._originalPatterns);
      this._cacheAncestors();
    }
  }

  parse(cursor: Cursor): Node | null {
    this._firstIndex = cursor.index;

    this.build();

    // If there are not any atom nodes then nothing can be found.
    if (this._atomPatterns.length < 1) {
      cursor.moveTo(this._firstIndex);
      cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
      return null;
    }

    const node = this._tryToParse(cursor);

    if (node != null) {
      node.normalize(this._firstIndex);

      cursor.moveTo(node.lastIndex);
      cursor.resolveError();
      return node;
    }

    cursor.moveTo(this._firstIndex);
    cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
    return null;
  }

  private _tryToParse(cursor: Cursor): Node | null {
    this._shouldStopParsing = false;

    while (true) {
      cursor.resolveError();

      this._tryToMatchPrefix(cursor);

      if (this._shouldStopParsing) {
        break;
      }

      this._tryToMatchAtom(cursor);

      if (this._shouldStopParsing) {
        break;
      }

      this._tryToMatchPostfix(cursor);

      if (this._shouldStopParsing) {
        break;
      }

      if (this._precedenceTree.hasAtom()) {
        this._tryToMatchBinary(cursor);

        if (this._shouldStopParsing) {
          break;
        }
      } else {
        break;
      }
    }

    return this._precedenceTree.commit();
  }

  private _tryToMatchPrefix(cursor: Cursor) {
    let onIndex = cursor.index;

    for (let i = 0; i < this._prefixPatterns.length; i++) {
      const pattern = this._prefixPatterns[i];
      const name = this._prefixNames[i];
      const node = pattern.parse(cursor);

      if (node != null) {
        this._precedenceTree.addPrefix(name, ...node.children);

        if (cursor.hasNext()) {
          cursor.next();
          onIndex = cursor.index;
          i = -1;
        } else {
          this._shouldStopParsing = true;
          break;
        }
      } else {
        cursor.moveTo(onIndex);
        cursor.resolveError();
      }
    }
  }

  private _tryToMatchAtom(cursor: Cursor) {
    const onIndex = cursor.index;

    for (let i = 0; i < this._atomPatterns.length; i++) {
      cursor.moveTo(onIndex);

      const pattern = this._atomPatterns[i];

      if (this._isBeyondRecursiveAllowance(pattern, onIndex)) {
        continue;
      }

      const node = pattern.parse(cursor);

      if (node != null) {
        this._precedenceTree.addAtom(node);

        if (cursor.hasNext()) {
          cursor.next();
        } else {
          this._shouldStopParsing = true;
        }

        break;
      } else {
        cursor.resolveError();
        cursor.moveTo(onIndex);
      }
    }
  }

  private _isBeyondRecursiveAllowance(atom: Pattern, onIndex: number) {
    const ancestors = this._atomsIdToAncestorsMap[atom.id];
    return ancestors.some(a => a.startedOnIndex === onIndex);
  }

  private _tryToMatchPostfix(cursor: Cursor) {
    let onIndex = cursor.index;

    for (let i = 0; i < this._postfixPatterns.length; i++) {
      const pattern = this._postfixPatterns[i];
      const name = this._postfixNames[i];
      const node = pattern.parse(cursor);

      if (node != null) {
        this._precedenceTree.addPostfix(name, ...node.children);

        if (cursor.hasNext()) {
          cursor.next();
          onIndex = cursor.index;
          i = -1;
        } else {
          this._shouldStopParsing = true;
          break;
        }
      } else {
        cursor.moveTo(onIndex);
        cursor.resolveError();
      }
    }
  }

  private _tryToMatchBinary(cursor: Cursor) {
    const onIndex = cursor.index;
    let foundMatch = false;

    if (this.infixPatterns.length === 0) {
      this._shouldStopParsing = true;
    }

    for (let i = 0; i < this._infixPatterns.length; i++) {
      cursor.moveTo(onIndex);

      const pattern = this._infixPatterns[i];
      const name = this._infixNames[i];
      const node = pattern.parse(cursor);

      if (node != null) {
        foundMatch = true;
        this._precedenceTree.addBinary(name, ...node.children);

        if (cursor.hasNext()) {
          cursor.next();
        } else {
          this._shouldStopParsing = true;
        }

        break;
      } else {
        cursor.moveTo(onIndex);
        cursor.resolveError();
      }
    }

    if (!foundMatch) {
      this._shouldStopParsing = true;
    }
  }

  getTokens(): string[] {
    return this._selectLeading(p => p.getTokens());
  }

  getTokensAfter(childReference: Pattern): string[] {
    return this._selectAfter(
      childReference,
      p => p.getTokens(),
      parent => parent.getNextTokens()
    );
  }

  getPatterns(): Pattern[] {
    return this._selectLeading(p => p.getPatterns());
  }

  getPatternsAfter(childReference: Pattern): Pattern[] {
    return this._selectAfter(
      childReference,
      p => p.getPatterns(),
      parent => parent.getNextPatterns()
    );
  }

  /** What may start an expression: a prefix operator, or an atom. */
  private _selectLeading<T>(select: (pattern: Pattern) => T[]): T[] {
    this.build();

    return [
      ...this._prefixPatterns.flatMap(select),
      ...this._atomPatterns.flatMap(select),
    ];
  }

  /**
   * `getTokensAfter` and `getPatternsAfter` ask the same question and differ
   * only in what they project out of the answer, so they share this.
   */
  private _selectAfter<T>(
    childReference: Pattern,
    select: (pattern: Pattern) => T[],
    fromParent: (parent: Pattern) => T[]
  ): T[] {
    this.build();

    // An operator still owed a right operand: an operand may start here.
    if (
      this._prefixPatterns.includes(childReference) ||
      this._infixPatterns.includes(childReference)
    ) {
      return this._selectLeading(select);
    }

    // A completed operand: the expression may continue with a postfix or infix
    // operator, or end here — in which case whatever follows the expression.
    if (
      this._atomPatterns.includes(childReference) ||
      this._postfixPatterns.includes(childReference)
    ) {
      const continuation = [
        ...this._postfixPatterns.flatMap(select),
        ...this._infixPatterns.flatMap(select),
      ];
      const parent = this._parent;

      return parent != null ? [...continuation, ...fromParent(parent)] : continuation;
    }

    return [];
  }

  clone(name = this._name): Pattern {
    const clone = new Expression(name, this._originalPatterns);
    clone._originalName = this._originalName;
    clone._cloneIdFrom(this);
    return clone;
  }
}
