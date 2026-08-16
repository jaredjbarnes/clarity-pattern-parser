import { Node } from "../ast/Node";
import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";
import { execPattern } from "./execPattern";
import { findPattern } from "./findPattern";
import { testPattern } from "./testPattern";

let idIndex = 0;

/**
 * Shared implementation for the built-in patterns.
 *
 * `Pattern` remains the contract: it is a structural interface, so a custom
 * pattern only has to match its shape and never has to extend anything. This
 * class exists purely to spare the built-ins from restating the parts that are
 * identical everywhere — identity, parent/child wiring, the `exec`/`test`
 * conveniences, and the parent-forwarding half of the introspection API.
 *
 * Two invariants live here and are easy to break by accident:
 *
 * 1. `clone()` must copy `_id` from the source. Recursion detection compares
 *    ids across clones (see `isRecursivePattern`, `Reference`, `Expression`),
 *    so a clone that mints a fresh id silently disables it.
 * 2. Patterns keep per-parse state on the instance (`_firstIndex` and friends),
 *    which makes them non-reentrant. That is why every composite clones its
 *    children instead of sharing them — it is a correctness requirement, not a
 *    stylistic one.
 */
export abstract class BasePattern implements Pattern {
  protected _id: string;
  protected _type: string;
  protected _name: string;
  protected _parent: Pattern | null;
  protected _children: Pattern[];
  protected _firstIndex: number;

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

  get startedOnIndex(): number {
    return this._firstIndex;
  }

  /**
   * `type` doubles as the id prefix. A pattern whose reported `type` differs
   * from its id prefix (Repeat, which reports its inner repeat's type) should
   * pass the prefix here and reassign `_type` afterwards.
   */
  constructor(type: string, name: string, children: Pattern[] = []) {
    this._id = `${type}-${idIndex++}`;
    this._type = type;
    this._name = name;
    this._parent = null;
    this._children = children;
    this._firstIndex = 0;
  }

  abstract parse(cursor: Cursor): Node | null;
  abstract clone(name?: string): Pattern;
  abstract getTokens(): string[];
  abstract getTokensAfter(childReference: Pattern): string[];
  abstract getPatterns(): Pattern[];
  abstract getPatternsAfter(childReference: Pattern): Pattern[];

  test(text: string, record = false): boolean {
    return testPattern(this, text, record);
  }

  exec(text: string, record = false): ParseResult {
    return execPattern(this, text, record);
  }

  getNextTokens(): string[] {
    if (this._parent == null) {
      return [];
    }

    return this._parent.getTokensAfter(this);
  }

  getNextPatterns(): Pattern[] {
    if (this._parent == null) {
      return [];
    }

    return this._parent.getPatternsAfter(this);
  }

  find(predicate: (pattern: Pattern) => boolean): Pattern | null {
    return findPattern(this, predicate);
  }

  isEqual(pattern: Pattern): boolean {
    return (
      pattern.type === this.type &&
      this.children.length === pattern.children.length &&
      this.children.every((child, index) => child.isEqual(pattern.children[index]))
    );
  }

  /** Copies the source's id onto a fresh clone. See invariant 1 above. */
  protected _cloneIdFrom(source: BasePattern): void {
    this._id = source._id;
  }

  protected _assignChildrenToParent(children: Pattern[]): void {
    for (const child of children) {
      child.parent = this;
    }
  }
}
