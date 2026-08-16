import { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { Literal } from "./Literal";
import type { Pattern } from "./Pattern";

export class Block extends BasePattern {
  private _openPattern: Pattern;
  private _contentPattern: Pattern | null;
  private _closePattern: Pattern;
  private _literalOpen: string;
  private _literalClose: string;

  constructor(
    name: string,
    openPattern: Literal,
    contentPattern: Pattern | null,
    closePattern: Literal
  ) {
    const clonedOpen = openPattern.clone() as Literal;
    const clonedContent = contentPattern != null ? contentPattern.clone() : null;
    const clonedClose = closePattern.clone() as Literal;

    super(
      "block",
      name,
      clonedContent != null
        ? [clonedOpen, clonedContent, clonedClose]
        : [clonedOpen, clonedClose]
    );

    this._openPattern = clonedOpen;
    this._contentPattern = clonedContent;
    this._closePattern = clonedClose;
    this._firstIndex = -1;
    this._literalOpen = clonedOpen.token;
    this._literalClose = clonedClose.token;

    this._assignChildrenToParent(this._children);
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
    const scanResult = this._scanForMatchingClose(cursor, openNode);
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
      const innerNode = new Node(
        "block-content",
        `${this._name}-content`,
        openNode.endIndex,
        closeStartIndex - 1,
        [],
        innerText
      );
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
    cursor: Cursor,
    openNode: Node
  ): { closeStartIndex: number; closeLastIndex: number } | null {
    const text = cursor.text;
    const openToken = this._literalOpen;
    const closeToken = this._literalClose;
    const openLen = openToken.length;
    const closeLen = closeToken.length;

    let from = openNode.endIndex;
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
      // Empty block — delimiters are adjacent, so there's no content space.
      // This is always valid: it's the natural base case for recursive blocks
      // and structurally complete for any block with matched delimiters.
      return { node: null, failed: false };
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

    if (node.endIndex !== closeStartIndex) {
      return { node: null, failed: true };
    }

    return { node, failed: false };
  }

  getTokens(): string[] {
    return this._openPattern.getTokens();
  }

  getTokensAfter(childReference: Pattern): string[] {
    return this.getPatternsAfter(childReference).flatMap(p => p.getTokens());
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

  clone(name = this._name): Pattern {
    const clone = new Block(
      name,
      this._openPattern as Literal,
      this._contentPattern,
      this._closePattern as Literal
    );
    clone._cloneIdFrom(this);
    return clone;
  }
}
