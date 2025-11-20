import { Cursor } from "./Cursor";
import { Literal } from "./Literal";
import { Node } from "../ast/Node";
import { patterns } from "../grammar/patterns";

const { name } = patterns`
    john = "John"
    jane = "Jane"
    first-names = john | jane

    doe = "Doe"
    smith = "Smith"
    last-names = doe | smith

    space = " " 

    name = first-names + space + last-names
`;

describe("Cursor", () => {
    test("Empty Text", () => {
        const cursor = new Cursor("");

        cursor.next();
        expect(cursor.index).toBe(0);

        cursor.previous();
        expect(cursor.index).toBe(0);

        const text = cursor.substring(0, 1);
        expect(text).toBe("");
    });

    test("Move Cursor", () => {
        const cursor = new Cursor("Hello World!");
        cursor.moveTo(6);

        expect(cursor.currentChar).toBe("W");

        cursor.moveToFirstChar();
        cursor.previous();

        expect(cursor.isOnFirst).toBeTruthy();
        expect(cursor.currentChar).toBe("H");

        cursor.next();

        expect(cursor.currentChar).toBe("e");

        cursor.moveToLastChar();
        cursor.next();

        expect(cursor.isOnLast).toBeTruthy();
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
        expect(cursor.error?.lastIndex).toBe(0);
        expect(cursor.error?.pattern).toBe(pattern);

        cursor.resolveError();

        expect(cursor.hasError).toBeFalsy();
        expect(cursor.error).toBe(null);
        expect(cursor.furthestError?.startIndex).toBe(0);
        expect(cursor.furthestError?.lastIndex).toBe(0);
        expect(cursor.furthestError?.pattern).toBe(pattern);
    });

    test("Error Handling", () => {
        const pattern = new Literal("h", "H");
        const node = new Node("literal", "h", 0, 0, [], "H");

        const cursor = new Cursor("Hello World!");

        cursor.recordMatch(pattern, node);

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
        const hello = cursor.substring(0, 4);

        expect(hello).toBe("Hello");
        expect(cursor.length).toBe(12);
        expect(cursor.text).toBe("Hello World!");
        expect(cursor.index).toBe(0);
    });

    test("Records All matches", () => {
        const { ast, cursor } = name.exec("John Doe", true);
        const records = cursor.records;

        expect(ast?.toString()).toBe("John Doe");
        expect(records[0].ast?.toString()).toBe("John");
        expect(records[1].ast?.toString()).toBe(" ");
        expect(records[2].ast?.toString()).toBe("Doe");
        expect(records[3].ast?.toString()).toBe("John Doe");
    });

    test("Records Some Error Some Matches", () => {
        const { ast, cursor } = name.exec("John Smith", true);
        const records = cursor.records;

        expect(ast?.toString()).toBe("John Smith");
        expect(records[0].ast?.toString()).toBe("John");
        expect(records[1].ast?.toString()).toBe(" ");
        expect(records[2].error?.pattern.name).toBe("doe");
        expect(records[2].error?.startIndex).toBe(5);
        expect(records[2].error?.lastIndex).toBe(5);
        expect(records[3].ast?.toString()).toBe("Smith");
        expect(records[4].ast?.toString()).toBe("John Smith");
    });

    test("Records All Errors", () => {
        const { ast, cursor } = name.exec("Jack Smith", true);
        const records = cursor.records;

        expect(ast).toBeNull();
        expect(records[0].error).not.toBeNull();
        expect(records[0].pattern.name).toBe("john");
        expect(records[1].error).not.toBeNull();
        expect(records[1].pattern.name).toBe("jane");
        expect(records[2].error).not.toBeNull();
        expect(records[2].pattern.name).toBe("first-names");
    });

    test("Text with Emojis", () => {
        const cursor = new Cursor("🔴 World!");
        expect(cursor.currentChar).toBe("🔴");
        cursor.next();
        expect(cursor.currentChar).toBe(" ");
        expect(cursor.length).toBe(9);
    });

});