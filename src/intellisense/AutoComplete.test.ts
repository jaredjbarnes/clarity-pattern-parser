import { Literal } from "../patterns/Literal";
import { AutoComplete } from "./AutoComplete";
import cssValue from "./css/cssValue";

describe("AutoComplete", ()=>{
    test("Suggest Empty Text", ()=>{
        const autoComplete = new AutoComplete(cssValue);
        const result = autoComplete.suggest("r")

        expect(result.options.length).toBe(1);
    });
});