import { Cursor } from "../../patterns/Cursor";
import { escapedCharacter } from "./escapedCharacter";
import { exponent } from "./exponent";
import { expression } from "./expression";
import { expressionStatement } from "./expressionStatement";
import { infixOperator } from "./infixOperator";
import { integer } from "./integer";
import { name } from "./name";
import { parameters } from "./parameters";
import { prefixOperator } from "./prefixOperator";

describe("Ecmascript 3", () => {
    test("Escaped Character", () => {
        let result = escapedCharacter.exec(`\\"`);
        expect(result.ast?.value).toBe(`\\"`)

        result = escapedCharacter.exec(`\\'`)
        expect(result.ast?.value).toBe(`\\'`)

        result = escapedCharacter.exec(`\\\\`)
        expect(result.ast?.value).toBe(`\\\\`)

        result = escapedCharacter.exec(`\\/`)
        expect(result.ast?.value).toBe(`\\/`)

        result = escapedCharacter.exec(`\\f`)
        expect(result.ast?.value).toBe(`\\f`)

        result = escapedCharacter.exec(`\\t`)
        expect(result.ast?.value).toBe(`\\t`)

        result = escapedCharacter.exec(`\\u00E9`)
        expect(result.ast?.value).toBe(`\\u00E9`)
    });

    test("Exponent", () => {
        let result = exponent.exec("e+1");
        expect(result.ast?.value).toBe("e+1")

        result = exponent.exec("e-1");
        expect(result.ast?.value).toBe("e-1")

        result = exponent.exec("E+1");
        expect(result.ast?.value).toBe("E+1")

        result = exponent.exec("E-1");
        expect(result.ast?.value).toBe("E-1")

        result = exponent.exec("e+11");
        expect(result.ast?.value).toBe("e+11")

        result = exponent.exec("11");
        expect(result.ast).toBeNull()
    });

    test("Integer", () => {
        let result = integer.exec("0");
        expect(result.ast?.value).toBe("0");

        result = integer.exec("1");
        expect(result.ast?.value).toBe("1");

        result = integer.exec("100");
        expect(result.ast?.value).toBe("100");

        result = integer.exec(".1");
        expect(result.ast).toBeNull();
    });

    test("Infix Operator", () => {
        let result = infixOperator.exec("*");
        expect(result.ast?.value).toBe("*");

        result = infixOperator.exec("/");
        expect(result.ast?.value).toBe("/");

        result = infixOperator.exec("%");
        expect(result.ast?.value).toBe("%");

        result = infixOperator.exec("+");
        expect(result.ast?.value).toBe("+");

        result = infixOperator.exec("-");
        expect(result.ast?.value).toBe("-");

        result = infixOperator.exec(">=");
        expect(result.ast?.value).toBe(">=");

        result = infixOperator.exec("<=");
        expect(result.ast?.value).toBe("<=");

        result = infixOperator.exec(">");
        expect(result.ast?.value).toBe(">");

        result = infixOperator.exec("<");
        expect(result.ast?.value).toBe("<");

        result = infixOperator.exec("===");
        expect(result.ast?.value).toBe("===");

        result = infixOperator.exec("!==");
        expect(result.ast?.value).toBe("!==");

        result = infixOperator.exec("||");
        expect(result.ast?.value).toBe("||");

        result = infixOperator.exec("&&");
        expect(result.ast?.value).toBe("&&");

        result = infixOperator.exec("bad");
        expect(result.ast).toBeNull();
    });


    test("Name", () => {
        let result = name.exec("p_0");
        expect(result.ast?.value).toBe("p_0");

        result = name.exec("_0");
        expect(result.ast?.value).toBe("_0");

        result = name.exec("0");
        expect(result.ast).toBeNull();

        result = name.exec("_");
        expect(result.ast?.value).toBe("_");
    });

    test("Parameters", () => {
        let result = parameters.exec("(param1)");
        expect(result.ast?.value).toBe("(param1)");

        result = parameters.exec("(param1, param2)");
        expect(result.ast?.value).toBe("(param1, param2)");

        result = parameters.exec("(param1, param2,)");
        expect(result.ast).toBeNull();
    });

    test("Prefix Operator", () => {
        let result = prefixOperator.exec("typeof ");
        expect(result.ast?.value).toBe("typeof ");

        result = prefixOperator.exec("+");
        expect(result.ast?.value).toBe("+");

        result = prefixOperator.exec("-");
        expect(result.ast?.value).toBe("-");

        result = prefixOperator.exec("!");
        expect(result.ast?.value).toBe("!");

        result = prefixOperator.exec("a");
        expect(result.ast).toBeNull();
    });

    test("Object Literal", () => {
        let result = expression.exec(`{}`)
        expect(result.ast?.value).toBe("{}");

        result = expression.exec(`{prop:{}}`)
        expect(result.ast?.value).toBe("{prop:{}}");

        result = expression.exec(`{prop:"value"}`)
        expect(result.ast?.value).toBe(`{prop:"value"}`);

        result = expression.exec(`{prop:0.9}`)
        expect(result.ast?.value).toBe(`{prop:0.9}`);

        result = expression.exec(`{prop:1}`)
        expect(result.ast?.value).toBe(`{prop:1}`);

        result = expression.exec(`{"prop":1}`)
        expect(result.ast?.value).toBe(`{"prop":1}`);
    });

    test("Expression", () => {

        let result = expression.exec("[]")
        expect(result.ast?.value).toBe("[]");

        result = expression.exec("[{}, 9, 0.9e-10, [1, 2]]")
        expect(result.ast?.value).toBe("[{}, 9, 0.9e-10, [1, 2]]");

        result = expression.exec(`"John"`);
        expect(result.ast?.value).toBe(`"John"`)

        result = expression.exec(`variableName.property`);
        expect(result.ast?.value).toBe(`variableName.property`);

        result = expression.exec(`{property: ""}`);
        expect(result.ast?.value).toBe(`{property: ""}`);

        const cursor = new Cursor(`name() == name.property === name2 ? {prop: name, blah: [ 0.9e-10 ]} : name`);
        cursor.startRecording();
        const ast = expression.parse(cursor);
    })

    test("Expression Statement", () => {
        let result = expressionStatement.exec(`name = "John"`);
        expect(result.ast?.value).toBe(`name = "John"`);

        result = expressionStatement.exec(`name = othername = "John"`)
        expect(result.ast?.value).toBe(`name = othername = "John"`);

        result = expressionStatement.exec(`name = othername.prop = "John"`)
        expect(result.ast?.value).toBe(`name = othername.prop = "John"`);

        result = expressionStatement.exec(`name = othername.prop += 2`)
        expect(result.ast?.value).toBe(`name = othername.prop += 2`);

        result = expressionStatement.exec(`name.prop().method(blah) = blah.prop()`)
        expect(result.ast?.value).toBe(`name.prop().method(blah) = blah.prop()`);

    });


});