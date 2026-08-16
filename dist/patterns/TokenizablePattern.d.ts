import type { Pattern } from "./Pattern";
/**
 * Capability interface for patterns whose suggested tokens can be supplied from
 * the outside.
 *
 * Some patterns cannot derive their own tokens: a `Regex` has no literal text to
 * offer, and a `TakeUntil` consumes arbitrary text. Without help they contribute
 * nothing to autocomplete, so the `@tokens` decorator hands them a list.
 *
 * This is deliberately a separate interface rather than an optional member on
 * `Pattern`. The core contract stays small, and — consistent with the rest of
 * the library — the capability is detected structurally, so a custom pattern
 * gains it just by having the method.
 */
export interface TokenizablePattern {
    setTokens(tokens: string[]): void;
}
export declare function isTokenizablePattern(pattern: Pattern): pattern is Pattern & TokenizablePattern;
