import { Cursor } from "./Cursor";
import { HistoryRecord } from "./HistoryRecord";
import { HistoryRecordCache } from "./HistoryRecordCache";
import { Literal } from "./Literal";
import { ParseError } from "./ParseError";

describe("HistoryRecordCache", () => {
    test("Cache Match", () => {
        const cache = new HistoryRecordCache(1);
        const pattern = new Literal("test", "test");
        const node = pattern.parse(new Cursor("test"));
        const record: HistoryRecord = {
            ast: node,
            error: null,
            pattern,
        };

        cache.add(record);

        const result = cache.get(pattern, 0);

        expect(result).toBe(record);
    });

    test("Cache Error", () => {
        const cache = new HistoryRecordCache(1);
        const pattern = new Literal("test", "test");
        const record: HistoryRecord = {
            ast: null,
            error: new ParseError(0, 0, pattern),
            pattern,
        };

        cache.add(record);

        const result = cache.get(pattern, 0);

        expect(result).toBe(record);
    });

    test("Beyond Bounds", () => {
        const cursor = new Cursor("testtest");
        const cache = new HistoryRecordCache(1);
        const pattern = new Literal("test", "test");

        const node = pattern.parse(cursor);
        cursor.next();
        const node1 = pattern.parse(cursor);

        const record: HistoryRecord = {
            ast: node,
            error: null,
            pattern,
        };

        const record1: HistoryRecord = {
            ast: node1,
            error: null,
            pattern,
        };

        cache.add(record);
        cache.add(record1);

        const result = cache.get(pattern, 0);
        const result1 = cache.get(pattern, 4);

        expect(result).toBeNull();
        expect(result1).toBe(record1);
    });
});