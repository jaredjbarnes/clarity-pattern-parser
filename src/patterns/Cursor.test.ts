import { Cursor } from "./Cursor";
import { Literal } from "./Literal";
import { Node } from "../ast/Node"

describe("Cursor", () => {
    test("Empty Text", () => {
        const cursor = new Cursor("");

        cursor.next();
        expect(cursor.index).toBe(0);

        cursor.previous();
        expect(cursor.index).toBe(0);

        const text = cursor.getChars(0, 1);
        expect(text).toBe("");
    });

    test("Move Cursor", () => {
        const cursor = new Cursor("Hello World!");
        cursor.moveTo(6);

        expect(cursor.currentChar).toBe("W")

        cursor.moveToFirstChar();
        cursor.previous();

        expect(cursor.isOnFirst).toBeTruthy();
        expect(cursor.currentChar).toBe("H");

        cursor.next();

        expect(cursor.currentChar).toBe("e");

        cursor.moveToLastChar();
        cursor.next();

        expect(cursor.isOnLast).toBeTruthy()
        expect(cursor.currentChar).toBe("!");

        cursor.previous();

        expect(cursor.currentChar).toBe("d");
    });

    test("Error Handling", () => {
        const pattern = new Literal("a", "A");
        const cursor = new Cursor("Hello World!");

        cursor.recordErrorAt(0, 0, pattern);

        expect(cursor.hasError).toBeTruthy();
        expect(cursor.error?.startIndex).toBe(0);
        expect(cursor.error?.endIndex).toBe(0);
        expect(cursor.error?.pattern).toBe(pattern);

        cursor.resolveError();

        expect(cursor.hasError).toBeFalsy();
        expect(cursor.error).toBe(null);
        expect(cursor.furthestError?.startIndex).toBe(0);
        expect(cursor.furthestError?.endIndex).toBe(0);
        expect(cursor.furthestError?.pattern).toBe(pattern);
    });

    test("Error Handling", () => {
        const pattern = new Literal("h", "H");
        const node = new Node("literal", "h", 0, 0, [], "H");

        const cursor = new Cursor("Hello World!");

        cursor.recordMatch(pattern, node)

        expect(cursor.leafMatch.node).toBe(node);
        expect(cursor.leafMatch.pattern).toBe(pattern);

        expect(cursor.rootMatch.node).toBe(node);
        expect(cursor.rootMatch.pattern).toBe(pattern);
    });

    test("Recording", () => {
        const cursor = new Cursor("Hello World!");
        cursor.startRecording();

        expect(cursor.isRecording).toBeTruthy();

        cursor.stopRecording();

        expect(cursor.isRecording).toBeFalsy();
    });


    test("Text Information", () => {
        const cursor = new Cursor("Hello World!");
        const hello = cursor.getChars(0, 4);

        expect(hello).toBe("Hello");
        expect(cursor.length).toBe(12);
        expect(cursor.text).toBe("Hello World!")
        expect(cursor.index).toBe(0);
    });
});