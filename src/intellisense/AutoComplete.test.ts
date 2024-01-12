import { Literal } from "../patterns/Literal";
import { AutoComplete } from "./AutoComplete";

describe("AutoComplete", ()=>{
    test("Suggest Empty Text", ()=>{
        const token = new Literal("token", "token");
        const autoComplete = new AutoComplete(token);
        const result = autoComplete.suggest("");

        expect(result.options.length).toBe(1);
        expect(result.options[0].text).toBe("token")
        expect(result.options[0].startIndex).toBe(0)
    });
});