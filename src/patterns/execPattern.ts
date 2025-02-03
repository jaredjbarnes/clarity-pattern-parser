import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";

export function execPattern(pattern: Pattern, text: string, record = false): ParseResult {
    const cursor = new Cursor(text);
    record && cursor.startRecording();

    const ast = pattern.parse(cursor);
    const isMatch = ast?.value.length === text.length;

    return {
        ast: isMatch ? ast : null,
        cursor
    };
}