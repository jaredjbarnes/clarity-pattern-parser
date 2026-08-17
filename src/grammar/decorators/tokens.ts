import type { Pattern } from "../../patterns/Pattern";
import { isTokenizablePattern } from "../../patterns/TokenizablePattern";
import type { Decorator } from "../Grammar";

/**
 * `@tokens([...])` supplies the tokens a pattern offers to autocomplete.
 *
 * The target is detected structurally rather than by `type`, so this works for
 * any pattern that can accept tokens — `Regex`, `TakeUntil`, or a custom one —
 * instead of only the built-in regex.
 */
export const tokens: Decorator = (pattern, arg) => {
  if (!Array.isArray(arg) || !isTokenizablePattern(pattern)) {
    return;
  }

  pattern.setTokens(arg.filter((token): token is string => typeof token === "string"));
};
