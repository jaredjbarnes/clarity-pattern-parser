import type { Node } from "../ast/Node";
import type { Cursor } from "./Cursor";
import type { ParseResult } from "./ParseResult";
import type { Pattern } from "./Pattern";
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
export declare abstract class BasePattern implements Pattern {
    protected _id: string;
    protected _type: string;
    protected _name: string;
    protected _parent: Pattern | null;
    protected _children: Pattern[];
    protected _firstIndex: number;
    get id(): string;
    get type(): string;
    get name(): string;
    get parent(): Pattern | null;
    set parent(pattern: Pattern | null);
    get children(): Pattern[];
    get startedOnIndex(): number;
    /**
     * `type` doubles as the id prefix. A pattern whose reported `type` differs
     * from its id prefix (Repeat, which reports its inner repeat's type) should
     * pass the prefix here and reassign `_type` afterwards.
     */
    constructor(type: string, name: string, children?: Pattern[]);
    abstract parse(cursor: Cursor): Node | null;
    abstract clone(name?: string): Pattern;
    abstract getTokens(): string[];
    abstract getTokensAfter(childReference: Pattern): string[];
    abstract getPatterns(): Pattern[];
    abstract getPatternsAfter(childReference: Pattern): Pattern[];
    test(text: string, record?: boolean): boolean;
    exec(text: string, record?: boolean): ParseResult;
    getNextTokens(): string[];
    getNextPatterns(): Pattern[];
    find(predicate: (pattern: Pattern) => boolean): Pattern | null;
    isEqual(pattern: Pattern): boolean;
    /** Copies the source's id onto a fresh clone. See invariant 1 above. */
    protected _cloneIdFrom(source: BasePattern): void;
    protected _assignChildrenToParent(children: Pattern[]): void;
}
