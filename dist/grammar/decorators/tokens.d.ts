import type { Decorator } from "../Grammar";
/**
 * `@tokens([...])` supplies the tokens a pattern offers to autocomplete.
 *
 * The target is detected structurally rather than by `type`, so this works for
 * any pattern that can accept tokens — `Regex`, `TakeUntil`, or a custom one —
 * instead of only the built-in regex.
 */
export declare const tokens: Decorator;
