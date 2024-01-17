import { escapedCharacter } from "./escapedCharacter";
import { exponent } from "./exponent";
import { infixOperator } from "./infixOperator";
import { integer } from "./integer";
import { name } from "./name";
import { parameters } from "./parameters";

describe("Ecmascript 3", () => {
    test("Escaped Character", () => {
        let result = escapedCharacter.parseText(`\\"`);
        expect(result.ast?.value).toBe(`\\"`)

        result = escapedCharacter.parseText(`\\'`)
        expect(result.ast?.value).toBe(`\\'`)

        result = escapedCharacter.parseText(`\\\\`)
        expect(result.ast?.value).toBe(`\\\\`)

        result = escapedCharacter.parseText(`\\/`)
        expect(result.ast?.value).toBe(`\\/`)

        result = escapedCharacter.parseText(`\\f`)
        expect(result.ast?.value).toBe(`\\f`)

        result = escapedCharacter.parseText(`\\t`)
        expect(result.ast?.value).toBe(`\\t`)

        result = escapedCharacter.parseText(`\\u00E9`)
        expect(result.ast?.value).toBe(`\\u00E9`)
    });

    test("Exponent", () => {
        let result = exponent.parseText("e+1");
        expect(result.ast?.value).toBe("e+1")

        result = exponent.parseText("e-1");
        expect(result.ast?.value).toBe("e-1")

        result = exponent.parseText("E+1");
        expect(result.ast?.value).toBe("E+1")

        result = exponent.parseText("E-1");
        expect(result.ast?.value).toBe("E-1")

        result = exponent.parseText("e+11");
        expect(result.ast?.value).toBe("e+11")

        result = exponent.parseText("11");
        expect(result.ast).toBeNull()
    });

    test("Integer", () => {
        let result = integer.parseText("0");
        expect(result.ast?.value).toBe("0");

        result = integer.parseText("1");
        expect(result.ast?.value).toBe("1");

        result = integer.parseText("100");
        expect(result.ast?.value).toBe("100");

        result = integer.parseText(".1");
        expect(result.ast).toBeNull();
    });

    test("Infix Operator", () => {
        let result = infixOperator.parseText("*");
        expect(result.ast?.value).toBe("*");

        result = infixOperator.parseText("/");
        expect(result.ast?.value).toBe("/");

        result = infixOperator.parseText("%");
        expect(result.ast?.value).toBe("%");

        result = infixOperator.parseText("+");
        expect(result.ast?.value).toBe("+");

        result = infixOperator.parseText("-");
        expect(result.ast?.value).toBe("-");

        result = infixOperator.parseText(">=");
        expect(result.ast?.value).toBe(">=");

        result = infixOperator.parseText("<=");
        expect(result.ast?.value).toBe("<=");

        result = infixOperator.parseText(">");
        expect(result.ast?.value).toBe(">");

        result = infixOperator.parseText("<");
        expect(result.ast?.value).toBe("<");

        result = infixOperator.parseText("===");
        expect(result.ast?.value).toBe("===");

        result = infixOperator.parseText("!==");
        expect(result.ast?.value).toBe("!==");

        result = infixOperator.parseText("||");
        expect(result.ast?.value).toBe("||");

        result = infixOperator.parseText("&&");
        expect(result.ast?.value).toBe("&&");

        result = infixOperator.parseText("bad");
        expect(result.ast).toBeNull();
    });


    test("name", () => {
        let result = name.parseText("p_0");
        expect(result.ast?.value).toBe("p_0");

        result = name.parseText("_0");
        expect(result.ast?.value).toBe("_0");

        result = name.parseText("0");
        expect(result.ast).toBeNull();

        result = name.parseText("_");
        expect(result.ast?.value).toBe("_");
    });

    test("parameters", ()=>{
        let result = parameters.parseText("(param1)");
        expect(result.ast?.value).toBe("(param1)");

        result = parameters.parseText("(param1, param2)");
        expect(result.ast?.value).toBe("(param1, param2)");

        result = parameters.parseText("(param1, param2,)");
        expect(result.ast).toBeNull();
    });
});