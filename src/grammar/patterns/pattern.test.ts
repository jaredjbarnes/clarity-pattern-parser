import { pattern } from "./pattern";

describe("pattern", ()=>{
    test("literal", ()=>{
        const result = pattern.exec(`"string"`, true);
    });

    test("and", ()=>{
        const result = pattern.exec(`"string" + pattern-2 + "string-1"`, true);
    });
});