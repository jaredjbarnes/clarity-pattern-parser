import { Literal } from "./Literal"

describe("Literal", () => {
    test("Empty Value", () => {
        expect(() => {
            new Literal("empty", "")
        }).toThrowError()
    });

    test("", ()=>{
        
    });
});