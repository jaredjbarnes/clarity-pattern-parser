import { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { Association, PrecedenceTree } from "./PrecedenceTree";
import { Reference } from "./Reference";
import { Sequence } from "./Sequence";

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
    const finalPatterns: Pattern[] = [];
    patterns.forEach((pattern, index) => {
      if (this._isAtom(pattern)) {
        const atom = pattern.clone();
        atom.parent = this;

        this._atomPatterns.push(atom);

        finalPatterns.push(atom);
      } else if (this._isPrefix(pattern)) {
        const name = this._extractName(pattern);
        const prefix = this._extractPrefix(pattern);

        prefix.parent = this;

        this._precedenceMap[name] = index;
        this._prefixPatterns.push(prefix);
        this._prefixNames.push(name);

        finalPatterns.push(prefix);
      } else if (this._isPostfix(pattern)) {
        const name = this._extractName(pattern);
        const postfix = this._extractPostfix(pattern);
        postfix.parent = this;

        this._precedenceMap[name] = index;
        this._postfixPatterns.push(postfix);
        this._postfixNames.push(name);

        finalPatterns.push(postfix);
      } else if (this._isBinary(pattern)) {
        const name = this._extractName(pattern);
        const infix = this._extractInfix(pattern);
        infix.parent = this;

        this._precedenceMap[name] = index;
        this._infixPatterns.push(infix);
        this._infixNames.push(name);

        if (pattern.type === "right-associated") {
          this._associationMap[name] = Association.right;
        } else {
          this._associationMap[name] = Association.left;
        }

        finalPatterns.push(infix);
      }
    });

    this._children = finalPatterns;
    this._precedenceTree = new PrecedenceTree(this._precedenceMap, this._associationMap);

    return finalPatterns;
  }

  private _cacheAncestors() {
    for (const atom of this._atomPatterns) {
      const id = atom.id;
      const ancestors: Pattern[] = (this._atomsIdToAncestorsMap[id] = []);

      let pattern: Pattern | null = this.parent;
      while (pattern != null) {
        if (pattern.id === id) {
          ancestors.push(pattern);
        }
        pattern = pattern.parent;
      }
    }
  }

  private _extractName(pattern: Pattern) {
    if (pattern.type === "right-associated") {
      return pattern.children[0].name;
    }

    return pattern.name;
  }

  private _isPrefix(pattern: Pattern) {
    pattern = this._unwrapAssociationIfNecessary(pattern);

    const lastChild = pattern.children[pattern.children.length - 1];
    const referenceCount = this._referenceCount(pattern);
    const lastChildIsReference = this._isRecursiveReference(lastChild);

    return lastChildIsReference && referenceCount === 1;
  }

  private _extractPrefix(pattern: Pattern) {
    pattern = this._unwrapAssociationIfNecessary(pattern);
    return new Sequence(`${pattern.name}-prefix`, pattern.children.slice(0, -1));
  }

  private _isAtom(pattern: Pattern) {
    pattern = this._unwrapAssociationIfNecessary(pattern);

    const firstChild = pattern.children[0];
    const lastChild = pattern.children[pattern.children.length - 1];
    const firstChildIsReference = this._isRecursiveReference(firstChild);
    const lastChildIsReference = this._isRecursiveReference(lastChild);

    return !firstChildIsReference && !lastChildIsReference;
  }

  private _isPostfix(pattern: Pattern) {
    pattern = this._unwrapAssociationIfNecessary(pattern);

    const firstChild = pattern.children[0];
    const referenceCount = this._referenceCount(pattern);
    const firstChildIsReference = this._isRecursiveReference(firstChild);

    return firstChildIsReference && referenceCount === 1;
  }

  private _extractPostfix(pattern: Pattern) {
    pattern = this._unwrapAssociationIfNecessary(pattern);
    return new Sequence(`${pattern.name}-postfix`, pattern.children.slice(1));
  }

  private _isBinary(pattern: Pattern) {
    pattern = this._unwrapAssociationIfNecessary(pattern);

    const firstChild = pattern.children[0];
    const lastChild = pattern.children[pattern.children.length - 1];
    const firstChildIsReference = this._isRecursiveReference(firstChild);
    const lastChildIsReference = this._isRecursiveReference(lastChild);

    return firstChildIsReference && lastChildIsReference && pattern.children.length > 2;
  }

  private _extractInfix(pattern: Pattern) {
    pattern = this._unwrapAssociationIfNecessary(pattern);
    const children = pattern.children.slice(1, -1);
    const infixSequence = new Sequence(`${pattern.name}-delimiter`, children);

    return infixSequence;
  }

  private _unwrapAssociationIfNecessary(pattern: Pattern) {
    if (pattern.type === "right-associated") {
      pattern = pattern.children[0];
    }

    if (pattern.type === "reference") {
      pattern.parent = this;
      pattern = (pattern as Reference).getReferencePatternSafely();
      pattern.parent = null;
    }

    return pattern;
  }

  private _referenceCount(pattern: Pattern) {
    return pattern.children.filter(p => this._isRecursiveReference(p)).length;
  }

  private _isRecursiveReference(pattern: Pattern) {
    if (pattern == null) {
      return false;
    }
    return pattern.name === this._originalName;
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
    this.build();
    const atomTokens = this._atomPatterns.flatMap(p => p.getTokens());
    const prefixTokens = this.prefixPatterns.flatMap(p => p.getTokens());

    return [...prefixTokens, ...atomTokens];
  }

  getTokensAfter(childReference: Pattern): string[] {
    this.build();
    if (
      this._prefixPatterns.includes(childReference) ||
      this._infixPatterns.includes(childReference)
    ) {
      const atomTokens = this._atomPatterns.flatMap(p => p.getTokens());
      const prefixTokens = this.prefixPatterns.flatMap(p => p.getTokens());

      return [...prefixTokens, ...atomTokens];
    }

    if (this._atomPatterns.includes(childReference)) {
      const postfixTokens = this.postfixPatterns.flatMap(p => p.getTokens());
      const infixTokens = this._infixPatterns.flatMap(p => p.getTokens());

      if (this._parent != null) {
        return [...postfixTokens, ...infixTokens, ...this._parent.getNextTokens()];
      }

      return [...postfixTokens, ...infixTokens];
    }

    if (this._infixPatterns.includes(childReference)) {
      const atomTokens = this._atomPatterns.flatMap(p => p.getTokens());
      return atomTokens;
    }

    if (this._postfixPatterns.includes(childReference)) {
      const postfixTokens = this.postfixPatterns.flatMap(p => p.getTokens());
      const infixTokens = this._infixPatterns.flatMap(p => p.getTokens());

      if (this._parent != null) {
        return [...postfixTokens, ...infixTokens, ...this._parent.getNextTokens()];
      }

      return [...postfixTokens, ...infixTokens];
    }

    return [];
  }

  getPatterns(): Pattern[] {
    this.build();
    const atomPatterns = this._atomPatterns.flatMap(p => p.getPatterns());
    const prefixPatterns = this.prefixPatterns.flatMap(p => p.getPatterns());

    return [...prefixPatterns, ...atomPatterns];
  }

  getPatternsAfter(childReference: Pattern): Pattern[] {
    this.build();
    if (
      this._prefixPatterns.includes(childReference) ||
      this._infixPatterns.includes(childReference)
    ) {
      const atomPatterns = this._atomPatterns.flatMap(p => p.getPatterns());
      const prefixPatterns = this.prefixPatterns.flatMap(p => p.getPatterns());

      return [...prefixPatterns, ...atomPatterns];
    }

    if (this._atomPatterns.includes(childReference)) {
      const postfixPatterns = this.postfixPatterns.flatMap(p => p.getPatterns());
      const infixPatterns = this._infixPatterns.flatMap(p => p.getPatterns());

      if (this._parent != null) {
        return [...postfixPatterns, ...infixPatterns, ...this._parent.getNextPatterns()];
      }

      return [...postfixPatterns, ...infixPatterns];
    }

    if (this._infixPatterns.includes(childReference)) {
      const atomPatterns = this._atomPatterns.flatMap(p => p.getPatterns());
      return atomPatterns;
    }

    if (this._postfixPatterns.includes(childReference)) {
      const postfixPatterns = this.postfixPatterns.flatMap(p => p.getPatterns());
      const infixPatterns = this._infixPatterns.flatMap(p => p.getPatterns());

      if (this._parent != null) {
        return [...postfixPatterns, ...infixPatterns, ...this._parent.getNextPatterns()];
      }

      return [...postfixPatterns, ...infixPatterns];
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
