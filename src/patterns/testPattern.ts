import { Cursor } from "./Cursor";
import { execPattern } from "./execPattern";
import { Pattern } from "./Pattern";

export function testPattern(pattern: Pattern, text: string, record = false): boolean {
    const result = execPattern(pattern, text, record);
    return !result.cursor.hasError;
}