import { Cursor } from "./Cursor";
import { Pattern } from "./Pattern";

export function testPattern (pattern: Pattern, text: string, record = false): boolean{
    const cursor = new Cursor(text);
    record && cursor.startRecording();

    const ast = pattern.parse(cursor);

    return ast?.value.length === text.length;
}