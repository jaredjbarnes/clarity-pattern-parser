import { Options } from "./Options";
import { Literal } from './Literal';
import { ExpressionPattern } from './ExpressionPattern';
import { Reference } from "./Reference";
import { Sequence } from './Sequence';
import { Regex } from './Regex';
import { Optional } from "./Optional";

function createExpressionPattern() {
    const spaces = new Regex("spaces", "\\s+");
    const optionalSpaces = new Optional("optional-spaces", spaces);

    const variables = new Options("variables", [
        new Literal("a", "a"),
        new Literal("b", "b"),
        new Literal("c", "c"),
        new Literal("d", "d"),
        new Literal("e", "e"),
    ]);

    const mulDivOperator = new Options("mult-div", [
        new Literal("mult", " * "),
        new Literal("div", " / "),
    ]);

    const addSubOperator = new Options("add-sub", [
        new Literal("add", " + "),
        new Literal("sub", " - "),
    ]);

    const boolOperator = new Options("and-or", [
        new Literal("and", " && "),
        new Literal("or", " || "),
    ]);

    const group = new Sequence("group", [
        new Literal("open-paren", "("),
        optionalSpaces,
        new Reference("expression"),
        optionalSpaces,
        new Literal("close-paren", ")"),
    ]);

    const ternary = new Sequence("ternary", [
        new Reference("expression"),
        optionalSpaces,
        new Literal("question-mark", "?"),
        optionalSpaces,
        new Reference("expression"),
        optionalSpaces,
        new Literal("colon", ":"),
        optionalSpaces,
        new Reference("expression"),
    ]);

    const multDivExpression = new Sequence("mult-div-expression", [
        new Reference("expression"),
        mulDivOperator,
        new Reference("expression"),
    ]);

    const addSubExpression = new Sequence("add-sub-expression", [
        new Reference("expression"),
        addSubOperator,
        new Reference("expression"),
    ]);

    const boolExpression = new Sequence("bool-expression", [
        new Reference("expression"),
        boolOperator,
        new Reference("expression"),
    ]);

    const expression = new ExpressionPattern("expression", [
        multDivExpression,
        addSubExpression,
        boolExpression,
        ternary,
        group,
        variables,
    ]);

    return expression;
}

describe("Expression Pattern", () => {
    test("Single Expression", () => {
        const expression = createExpressionPattern();
        let result = expression.exec("a");
        result = expression.exec("a + b");
        result = expression.exec("a + b * c");
        result = expression.exec("a + b * c || d + e");
        result = expression.exec("(a + b) * (c + d)");
        result = expression.exec("(a + b) * c + (d + e)");
        result = expression.exec("a + b * c ? d : e");
        result = expression.exec("a + b * (a + b * c ? d : e) ? d : e");

        expect(result).toBe(result);
    });
});