import { AutoComplete } from "./AutoComplete";
import cssValue from "./css/cssValue";

describe("AutoComplete", ()=>{
    test("Playground", ()=>{
        const autoComplete = new AutoComplete(cssValue);
        let result = autoComplete.suggest("r")
        result = autoComplete.suggest("rgba(");
        result = autoComplete.suggest("rgba(0");

        
    });
});