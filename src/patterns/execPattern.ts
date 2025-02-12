import { Cursor } from "./Cursor";
import { ParseResult } from "./ParseResult";
import { Pattern } from "./Pattern";

export function execPattern(pattern: Pattern, text: string, record = false): ParseResult {
  const cursor = new Cursor(text);

  if (cursor.length === 0) {
    return { ast: null, cursor };
  }
  
  record && cursor.startRecording();

  let ast = pattern.parse(cursor);
  const resultLength = ast == null ? 0 : ast.value.length;

  if (ast != null) {
    const isMatch = ast.value === text;

    if (!isMatch && !cursor.hasError) {
      ast = null;
      cursor.recordErrorAt(resultLength, cursor.length, pattern);
    }
  } else {
    cursor.recordErrorAt(resultLength, cursor.length, pattern);
  }

  return {
    ast: ast,
    cursor
  };
}