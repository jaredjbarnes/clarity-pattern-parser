import { escapedCharacter } from "./escapedCharacter";
import { exponent } from "./exponent";
import { expression } from "./expression";
import { infixOperator } from "./infixOperator";
import { integer } from "./integer";
import { name } from "./name";
import { parameters } from "./parameters";
import { prefixOperator } from "./prefixOperator";

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


    test("Name", () => {
        let result = name.parseText("p_0");
        expect(result.ast?.value).toBe("p_0");

        result = name.parseText("_0");
        expect(result.ast?.value).toBe("_0");

        result = name.parseText("0");
        expect(result.ast).toBeNull();

        result = name.parseText("_");
        expect(result.ast?.value).toBe("_");
    });

    test("Parameters", () => {
        let result = parameters.parseText("(param1)");
        expect(result.ast?.value).toBe("(param1)");

        result = parameters.parseText("(param1, param2)");
        expect(result.ast?.value).toBe("(param1, param2)");

        result = parameters.parseText("(param1, param2,)");
        expect(result.ast).toBeNull();
    });

    test("Prefix Operator", () => {
        let result = prefixOperator.parseText("typeof");
        expect(result.ast?.value).toBe("typeof");

        result = prefixOperator.parseText("+");
        expect(result.ast?.value).toBe("+");

        result = prefixOperator.parseText("-");
        expect(result.ast?.value).toBe("-");

        result = prefixOperator.parseText("!");
        expect(result.ast?.value).toBe("!");

        result = prefixOperator.parseText("a");
        expect(result.ast).toBeNull();
    });

    test("object-literal", () => {
        let result = expression.parseText(`{}`)
        expect(result.ast?.value).toBe("{}");

        result = expression.parseText(`{prop:{}}`)
        expect(result.ast?.value).toBe("{prop:{}}");

        result = expression.parseText(`{prop:"value"}`)
        expect(result.ast?.value).toBe(`{prop:"value"}`);

        result = expression.parseText(`{prop:0.9}`)
        expect(result.ast?.value).toBe(`{prop:0.9}`);

        result = expression.parseText(`{prop:1}`)
        expect(result.ast?.value).toBe(`{prop:1}`);

        result = expression.parseText(`{"prop":1}`)
        expect(result.ast?.value).toBe(`{"prop":1}`);

    })
});