import { execPattern } from "./execPattern";
import type { Pattern } from "./Pattern";

export function testPattern(pattern: Pattern, text: string, record = false): boolean {
  const result = execPattern(pattern, text, record);
  return !result.cursor.hasError;
}
