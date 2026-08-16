import { Node } from "../ast/Node";
import { BasePattern } from "./BasePattern";
import type { Cursor } from "./Cursor";
import type { Pattern } from "./Pattern";

export class TakeUntil extends BasePattern {
  private _tokens: string[];

  private get _terminatingPattern(): Pattern {
    return this._children[0];
  }

  constructor(name: string, terminatingPattern: Pattern) {
    super("take-until", name, [terminatingPattern]);
    this._tokens = [];
  }

  parse(cursor: Cursor): Node | null {
    let cursorIndex = cursor.index;
    let foundMatch = false;
    this._firstIndex = cursor.index;

    let terminatingResult = this._terminatingPattern.parse(cursor);
    cursor.resolveError();

    if (terminatingResult == null) {
      foundMatch = true;

      cursor.moveTo(cursorIndex);
      cursorIndex += 1;
      cursor.hasNext() && cursor.next();
    }

    while (true) {
      terminatingResult = this._terminatingPattern.parse(cursor);
      cursor.resolveError();

      if (terminatingResult == null) {
        cursor.moveTo(cursorIndex);
        cursorIndex += 1;

        if (cursor.hasNext()) {
          cursor.next();
        } else {
          break;
        }
      } else {
        break;
      }
    }

    if (foundMatch) {
      cursor.moveTo(cursorIndex - 1);
      const value = cursor.substring(this.startedOnIndex, cursorIndex - 1);
      const node = Node.createValueNode(this._type, this._name, value);

      cursor.recordMatch(this, node);
      return node;
    } else {
      cursor.moveTo(this.startedOnIndex);
      cursor.recordErrorAt(this._firstIndex, this._firstIndex, this);
      return null;
    }
  }

  clone(name = this.name): Pattern {
    const clone = new TakeUntil(name, this._terminatingPattern);
    clone._tokens = this._tokens.slice();
    clone._cloneIdFrom(this);

    return clone;
  }

  getTokens() {
    return this._tokens;
  }

  getTokensAfter(_childReference: Pattern): string[] {
    return [];
  }

  getPatterns(): Pattern[] {
    return [this];
  }

  getPatternsAfter(_childReference: Pattern): Pattern[] {
    return [];
  }

  find(_predicate: (p: Pattern) => boolean): Pattern | null {
    return null;
  }

  setTokens(tokens: string[]) {
    this._tokens = tokens;
  }
}
