import { And } from "./And";
import { findPattern } from "./findPattern";
import { Literal } from "./Literal";

describe("getNextPatter", ()=>{
    test("No Parent", ()=>{
        const a = new Literal("a", "A");
        const nextPattern = a.getNextPattern();

        expect(nextPattern).toBe(null);
    });

    test("No Next Sibling", ()=>{
        const a = new Literal("a", "A");
        const parent = new And("parent", [a]);
        const nextPattern = parent.children[0].getNextPattern();

        expect(nextPattern).toBe(null);
    });

    test("Get Parents Sibling", ()=>{
        const a = new Literal("a", "A");
        const parent = new And("parent", [a]);
        const grandParent = new And("grand-parent", [parent]);
        const clonedA = findPattern(grandParent, p=>p.name === "a");
        const nextPattern = clonedA?.getNextPattern();

        expect(nextPattern).toBe(null);
    });

    test("Get Sibling", ()=>{
        const a = new Literal("a", "A");
        const b = new Literal("b", "B");
        const parent = new And("parent", [a, b]);

        const nextPattern = parent.children[0].getNextPattern();
        expect(nextPattern?.name).toBe("b");
    });
});