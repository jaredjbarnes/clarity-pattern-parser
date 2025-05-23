import { Options } from "./Options";
import { Literal } from './Literal';
import { Expression } from './Expression';
import { Reference } from "./Reference";
import { Sequence } from './Sequence';
import { Regex } from './Regex';
import { Optional } from "./Optional";
import { AutoComplete } from "../intellisense/AutoComplete";
import { RightAssociated } from "./RightAssociated";

function createExpressionPattern() {
    const spaces = new Regex("spaces", "\\s+");
    spaces.setTokens([" "]);

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

    const expression = new Expression("expression", [
        multDivExpression,
        addSubExpression,
        boolExpression,
        new RightAssociated(ternary),
        group,
        variables,
    ]);

    return expression;
}

function createOptionsExpression() {
    const a = new Literal("a", "a");
    const b = new Literal("b", "b");
    const c = new Literal("c", "c");

    const expression = new Expression("expression", [a, b, c]);
    return expression;
}

function createTailExpression() {
    const a = new Literal("a", "a");
    const b = new Literal("b", "b");
    const c = new Literal("c", "c");
    const variable = new Options("variable", [a, b, c]);
    const period = new Literal(".", ".");

    const refinement = new Sequence("refinement", [period, variable]);
    const refinementExpression = new Sequence("refinement-expression", [
        new Reference("expression"),
        refinement
    ]);

    const invocation = new Literal("invocation", "()");
    const invocationExpression = new Sequence("invocation-expression", [
        new Reference("expression"),
        invocation
    ]);

    const expression = new Expression("expression", [
        refinementExpression,
        invocationExpression,
        variable
    ]);

    return expression;
}

describe("Expression Pattern", () => {
    test("Single Expression", () => {
        const expression = createExpressionPattern();
        let result = expression.exec("a || c || b / c * a + d");
        result = expression.exec("a + b");
        result = expression.exec("a + b * c * d");
        result = expression.exec("a + b * c || d + e");
        result = expression.exec("(a + b) * (c + d)");
        result = expression.exec("(a + b) * c + (d + e)");
        result = expression.exec("a + b * c ? d : e");
        result = expression.exec("a + b * (a + b * c ? d : e) ? d : e");
        result = expression.exec("a + b * a + b * c ? d : e ? d : e");
        result = expression.exec("a + b * ?");

        expect(result).toBe(result);
    });

    test("Tail", () => {
        const expression = createTailExpression();
        let result = expression.exec("a");
        result = expression.exec("a.b");
        result = expression.exec("a.b.c");
        result = expression.exec("a.b.c()()()");

        expect(result).toBe(result);
    });

    test("Options like", () => {
        const expression = createOptionsExpression();
        const autoComplete = new AutoComplete(expression);
        const suggestion = autoComplete.suggestFor("a");

        expect(suggestion).toBe(suggestion);
    });

    test("Suggest", () => {
        const expression = createExpressionPattern();

        const autoComplete = new AutoComplete(expression);
        const suggestion = autoComplete.suggestFor("a ? b ");
        expect(suggestion).toBe(suggestion);
    });

    test("Clone With New Name", ()=>{
        const expression = createExpressionPattern();
        const clone = expression.clone("new-expression");

        const result = clone.exec("a || b && c * d");
        expect(result).toBe(result);
    });
});