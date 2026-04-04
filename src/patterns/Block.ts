import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";
import { Literal } from "./Literal";
import { Node } from "../ast/Node";
import { findPattern } from "./findPattern";
import { testPattern } from "./testPattern";
import { execPattern } from "./execPattern";
import { ParseResult } from "./ParseResult";

let idIndex = 0;

export class Block implements Pattern {
  private _id: string;
  private _type: string;
  private _name: string;
  private _parent: Pattern | null;
  private _children: Pattern[];
  private _openPattern: Pattern;
  private _contentPattern: Pattern | null;
  private _closePattern: Pattern;
  private _firstIndex: number;
  private _literalOpen: string;
  private _literalClose: string;

  get id(): string {
    return this._id;
  }

  get type(): string {
    return this._type;
  }

  get name(): string {
    return this._name;
  }

  get parent(): Pattern | null {
    return this._parent;
  }

  set parent(pattern: Pattern | null) {
    this._parent = pattern;
  }

  get children(): Pattern[] {
    return this._children;
  }

  get startedOnIndex() {
    return this._firstIndex;
  }

  constructor(
    name: string,
    openPattern: Literal,
    contentPattern: Pattern | null,
    closePattern: Literal
  ) {
    const clonedOpen = openPattern.clone() as Literal;
    const clonedContent = contentPattern != null ? contentPattern.clone() : null;
    const clonedClose = closePattern.clone() as Literal;

    this._id = `block-${idIndex++}`;
    this._type = "block";
    this._name = name;
    this._parent = null;
    this._openPattern = clonedOpen;
    this._contentPattern = clonedContent;
    this._closePattern = clonedClose;
    this._children = clonedContent != null
      ? [clonedOpen, clonedContent, clonedClose]
      : [clonedOpen, clonedClose];
    this._firstIndex = -1;
    this._literalOpen = clonedOpen.token;
    this._literalClose = clonedClose.token;

    for (const child of this._children) {
      child.parent = this;
    }
  }

  test(text: string, record = false): boolean {
    return testPattern(this, text, record);
  }

  exec(text: string, record = false): ParseResult {
    return execPattern(this, text, record);
  }

  parse(cursor: Cursor): Node | null {
    this._firstIndex = cursor.index;

    // Phase 1: Match open delimiter
    const openNode = this._openPattern.parse(cursor);
    if (openNode === null || cursor.hasError) {
      cursor.moveTo(this._firstIndex);
      cursor.recordErrorAt(this._firstIndex, cursor.index, this);
      return null;
    }

    // Phase 2: Scan ahead for matching close
    const scanResult = this._scanForMatchingClose(cursor);
    if (scanResult === null) {
      cursor.moveTo(this._firstIndex);
      cursor.recordErrorAt(this._firstIndex, cursor.index, this);
      return null;
    }

    const { closeStartIndex, closeLastIndex } = scanResult;

    // Phase 3: Parse content within boundaries
    const contentResult = this._parseContent(cursor, openNode.endIndex, closeStartIndex);

    if (contentResult.failed) {
      cursor.moveTo(this._firstIndex);
      cursor.recordErrorAt(this._firstIndex, cursor.index, this);
      return null;
    }

    const contentNode = contentResult.node;

    if (contentNode != null && contentNode.endIndex !== closeStartIndex) {
      cursor.moveTo(this._firstIndex);
      cursor.recordErrorAt(this._firstIndex, cursor.index, this);
      return null;
    }

    // Phase 4: Parse close delimiter at its known position
    cursor.moveTo(closeStartIndex);
    const closeNode = this._closePattern.parse(cursor);
    if (closeNode === null || cursor.hasError) {
      cursor.moveTo(this._firstIndex);
      cursor.recordErrorAt(this._firstIndex, cursor.index, this);
      return null;
    }

    // Build AST — for wildcard blocks, capture inner text as a value node
    let allChildren: Node[];
    if (contentNode != null) {
      allChildren = [openNode, contentNode, closeNode];
    } else if (this._contentPattern == null && openNode.endIndex < closeStartIndex) {
      const innerText = cursor.text.substring(openNode.endIndex, closeStartIndex);
      const innerNode = new Node("block-content", `${this._name}-content`, openNode.endIndex, closeStartIndex - 1, [], innerText);
      allChildren = [openNode, innerNode, closeNode];
    } else {
      allChildren = [openNode, closeNode];
    }

    const node = new Node(
      "block",
      this._name,
      this._firstIndex,
      closeLastIndex,
      allChildren
    );

    cursor.moveTo(closeLastIndex);
    cursor.recordMatch(this, node);
    return node;
  }

  private _scanForMatchingClose(
    cursor: Cursor
  ): { closeStartIndex: number; closeLastIndex: number } | null {
    const text = cursor.text;
    const openToken = this._literalOpen;
    const closeToken = this._literalClose;
    const openLen = openToken.length;
    const closeLen = closeToken.length;

    let from = cursor.index + openLen;
    let depth = 0;
    let lastCloseIdx = -1;

    while (true) {
      const closeIdx = text.indexOf(closeToken, from);
      if (closeIdx === -1) {
        if (lastCloseIdx !== -1) {
          return {
            closeStartIndex: lastCloseIdx,
            closeLastIndex: lastCloseIdx + closeLen - 1,
          };
        }
        return null;
      }

      lastCloseIdx = closeIdx;

      // Count any opens that appear before this close
      let searchFrom = from;
      while (true) {
        const openIdx = text.indexOf(openToken, searchFrom);
        if (openIdx === -1 || openIdx >= closeIdx) {
          break;
        }
        depth++;
        searchFrom = openIdx + openLen;
      }

      if (depth === 0) {
        return {
          closeStartIndex: closeIdx,
          closeLastIndex: closeIdx + closeLen - 1,
        };
      }

      depth--;
      from = closeIdx + closeLen;
    }
  }

  private _parseContent(
    cursor: Cursor,
    openEndIndex: number,
    closeStartIndex: number
  ): { node: Node | null; failed: boolean } {
    if (this._contentPattern == null) {
      return { node: null, failed: false };
    }

    cursor.moveTo(openEndIndex);

    if (openEndIndex >= closeStartIndex) {
      // Empty block — no room for content. Only fail if content is required.
      const isOptional = this._contentPattern.type === "optional";
      return { node: null, failed: !isOptional };
    }

    const node = this._contentPattern.parse(cursor);

    if (cursor.hasError) {
      return { node: null, failed: true };
    }

    if (node === null) {
      // Content pattern didn't match — only fail if it's required
      const isOptional = this._contentPattern.type === "optional";
      return { node: null, failed: !isOptional };
    }

    return { node, failed: false };
  }

  getTokens(): string[] {
    return this._openPattern.getTokens();
  }

  getTokensAfter(childReference: Pattern): string[] {
    const patterns = this.getPatternsAfter(childReference);
    const tokens: string[] = [];
    patterns.forEach((p) => tokens.push(...p.getTokens()));
    return tokens;
  }

  getNextTokens(): string[] {
    if (this.parent == null) {
      return [];
    }
    return this.parent.getTokensAfter(this);
  }

  getPatterns(): Pattern[] {
    return this._openPattern.getPatterns();
  }

  getPatternsAfter(childReference: Pattern): Pattern[] {
    const index = this._children.indexOf(childReference);
    if (index === -1) {
      return [];
    }

    const nextIndex = index + 1;
    if (nextIndex >= this._children.length && this._parent !== null) {
      return this._parent.getPatternsAfter(this);
    }

    const patterns: Pattern[] = [];
    for (let i = nextIndex; i < this._children.length; i++) {
      patterns.push(this._children[i]);
      if (this._children[i].type !== "optional") {
        break;
      }
      if (i === this._children.length - 1 && this._parent !== null) {
        patterns.push(...this._parent.getPatternsAfter(this));
      }
    }

    return patterns;
  }

  getNextPatterns(): Pattern[] {
    if (this.parent == null) {
      return [];
    }
    return this.parent.getPatternsAfter(this);
  }

  find(predicate: (p: Pattern) => boolean): Pattern | null {
    return findPattern(this, predicate);
  }

  clone(name = this._name): Pattern {
    const clone = new Block(
      name,
      this._openPattern as Literal,
      this._contentPattern,
      this._closePattern as Literal
    );
    clone._id = this._id;
    return clone;
  }

  isEqual(pattern: Block): boolean {
    return (
      pattern.type === this.type &&
      this.children.every((c, index) => c.isEqual(pattern.children[index]))
    );
  }
}
