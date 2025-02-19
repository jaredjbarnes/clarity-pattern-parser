import { Cursor } from "./Cursor";
import { Literal } from "./Literal";
import { Options } from "./Options";
import { TakeUntil } from "./TakeUntil";

describe("TakeUntil", () => {
    test("Take With No End", () => {
        const takeUntilScript = new TakeUntil(
            "script-content",
            new Literal("close-script-tag", "</script")
        );

        const result = takeUntilScript.exec("function(){}");

        expect(result.ast?.value).toBe("function(){}");
    });

    test("Take Until Terminating Match", () => {
        const takeUntilScript = new TakeUntil(
            "script-content",
            new Literal("close-script-tag", "</script")
        );
        const cursor = new Cursor("function(){}function(){}</script");
        const result = takeUntilScript.parse(cursor);

        expect(result?.value).toBe("function(){}function(){}");
        expect(cursor.index).toBe(23);
    });

    test("Take Until Terminating Complex Match", () => {
        const takeUntilScript = new TakeUntil(
            "script-content",
            new Options("end-tags", [
                new Literal("close-script-tag", "</script"),
                new Literal("close-style-tag", "</style")
            ])
        );
        let cursor = new Cursor("function(){}function(){}</script");
        let result = takeUntilScript.parse(cursor);

        expect(result?.value).toBe("function(){}function(){}");
        expect(cursor.index).toBe(23);

        cursor = new Cursor("function(){}function(){}</style");
        result = takeUntilScript.parse(cursor);

        expect(result?.value).toBe("function(){}function(){}");
        expect(cursor.index).toBe(23);
    });

    test("Error", () => {
        const takeUntilScript = new TakeUntil(
            "script-content",
            new Literal("close-script-tag", "</script")
        );
        const cursor = new Cursor("</script");
        const result = takeUntilScript.parse(cursor);

        expect(result).toBeNull();
        expect(cursor.index).toBe(0);
    });
});