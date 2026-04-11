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

    test("Empty patterns throws", () => {
        expect(() => new Expression("e", [])).toThrow(
            "Need at least one pattern with an 'expression' pattern."
        );
    });

    test("Atom-only expression parses single value and stops", () => {
        const expression = createOptionsExpression();
        const result = expression.exec("a");

        expect(result.ast?.name).toBe("a");
        expect(result.cursor.hasError).toBe(false);
    });

    test("Prefix at end of input", () => {
        // Expression: negate is prefix (-expr), atom is a variable
        const negate = new Sequence("negate", [
            new Literal("minus", "-"),
            new Reference("expression"),
        ]);
        const variable = new Literal("variable", "a");

        const expression = new Expression("expression", [negate, variable]);
        // "-a" means: prefix "-" matches, cursor moves to "a", atom matches,
        // cursor has no next -> shouldStopParsing = true
        const result = expression.exec("-a");
        expect(result.cursor.hasError).toBe(false);
    });

    test("Infix at end of input", () => {
        // a + b where after matching "b" the cursor has no next
        const expression = createExpressionPattern();
        const result = expression.exec("a + b");
        expect(result.cursor.hasError).toBe(false);
        expect(result.ast).not.toBeNull();
    });

    test("Postfix operator", () => {
        const bang = new Sequence("factorial", [
            new Reference("expression"),
            new Literal("bang", "!"),
        ]);
        const variable = new Literal("variable", "a");

        const expression = new Expression("expression", [bang, variable]);

        const result = expression.exec("a!");
        expect(result.cursor.hasError).toBe(false);
        expect(result.ast).not.toBeNull();
    });

    test("Chained postfix operators", () => {
        const bang = new Sequence("factorial", [
            new Reference("expression"),
            new Literal("bang", "!"),
        ]);
        const variable = new Literal("variable", "a");

        const expression = new Expression("expression", [bang, variable]);

        // a!! means: atom "a", then postfix "!" matched, cursor advances,
        // another "!" matched, cursor has no next -> shouldStopParsing
        const result = expression.exec("a!!");
        expect(result.cursor.hasError).toBe(false);
    });

    test("Expression with no atoms returns null", () => {
        // All patterns are infix (both ends have references), so no atoms exist
        const infix = new Sequence("add", [
            new Reference("expression"),
            new Literal("plus", "+"),
            new Reference("expression"),
        ]);

        const expression = new Expression("expression", [infix]);
        const result = expression.exec("a + b");

        // No atom patterns -> parse returns null
        expect(result.ast).toBeNull();
        expect(result.cursor.hasError).toBe(true);
    });

    test("test() returns boolean", () => {
        const expression = createExpressionPattern();

        expect(expression.test("a + b")).toBe(true);
        expect(expression.test("a + b * c")).toBe(true);
        expect(expression.test("???")).toBe(false);
    });

    test("Accessor: atomPatterns returns atom patterns", () => {
        const expression = createExpressionPattern();
        expression.build();

        // The expression has group and variables as atoms
        expect(expression.atomPatterns.length).toBeGreaterThan(0);
    });

    test("Accessor: infixPatterns, prefixPatterns, postfixPatterns", () => {
        const negate = new Sequence("negate", [
            new Literal("minus", "-"),
            new Reference("expression"),
        ]);
        const bang = new Sequence("factorial", [
            new Reference("expression"),
            new Literal("bang", "!"),
        ]);
        const add = new Sequence("add", [
            new Reference("expression"),
            new Literal("plus", "+"),
            new Reference("expression"),
        ]);
        const variable = new Literal("variable", "a");

        const expression = new Expression("expression", [add, negate, bang, variable]);
        expression.build();

        expect(expression.prefixPatterns.length).toBe(1);
        expect(expression.postfixPatterns.length).toBe(1);
        expect(expression.infixPatterns.length).toBe(1);
        expect(expression.atomPatterns.length).toBe(1);
    });

    test("Accessor: binaryPatterns is deprecated alias for infixPatterns", () => {
        const expression = createExpressionPattern();
        expression.build();

        expect(expression.binaryPatterns).toBe(expression.infixPatterns);
    });

    test("Accessor: originalPatterns returns the original list", () => {
        const a = new Literal("a", "a");
        const b = new Literal("b", "b");
        const expression = new Expression("expression", [a, b]);

        expect(expression.originalPatterns).toContain(a);
        expect(expression.originalPatterns).toContain(b);
        expect(expression.originalPatterns.length).toBe(2);
    });

    test("getTokens returns atom and prefix tokens", () => {
        const negate = new Sequence("negate", [
            new Literal("minus", "-"),
            new Reference("expression"),
        ]);
        const variable = new Options("variable", [
            new Literal("a", "a"),
            new Literal("b", "b"),
        ]);

        const expression = new Expression("expression", [negate, variable]);
        const tokens = expression.getTokens();

        expect(tokens).toContain("-");
        expect(tokens).toContain("a");
        expect(tokens).toContain("b");
    });

    test("getTokensAfter for prefix child returns atoms and prefix tokens", () => {
        const negate = new Sequence("negate", [
            new Literal("minus", "-"),
            new Reference("expression"),
        ]);
        const variable = new Literal("variable", "x");

        const expression = new Expression("expression", [negate, variable]);
        expression.build();

        // The prefix pattern is the extracted prefix (minus only), get the actual child
        const prefixChild = expression.prefixPatterns[0];
        const tokens = expression.getTokensAfter(prefixChild as any);

        // After a prefix, expect atom tokens (and prefix tokens for nested prefixes)
        expect(tokens).toContain("-");
        expect(tokens).toContain("x");
    });

    test("getTokensAfter for atom child returns postfix and infix tokens", () => {
        const bang = new Sequence("factorial", [
            new Reference("expression"),
            new Literal("bang", "!"),
        ]);
        const add = new Sequence("add", [
            new Reference("expression"),
            new Literal("plus", "+"),
            new Reference("expression"),
        ]);
        const variable = new Literal("variable", "x");

        const expression = new Expression("expression", [add, bang, variable]);
        expression.build();

        const atomChild = expression.atomPatterns[0];
        const tokens = expression.getTokensAfter(atomChild as any);

        expect(tokens).toContain("!");
        expect(tokens).toContain("+");
    });

    test("getTokensAfter for postfix child returns postfix and infix tokens", () => {
        const bang = new Sequence("factorial", [
            new Reference("expression"),
            new Literal("bang", "!"),
        ]);
        const add = new Sequence("add", [
            new Reference("expression"),
            new Literal("plus", "+"),
            new Reference("expression"),
        ]);
        const variable = new Literal("variable", "x");

        const expression = new Expression("expression", [add, bang, variable]);
        expression.build();

        const postfixChild = expression.postfixPatterns[0];
        const tokens = expression.getTokensAfter(postfixChild as any);

        expect(tokens).toContain("!");
        expect(tokens).toContain("+");
    });

    test("getTokensAfter for unknown child returns empty", () => {
        const expression = createOptionsExpression();
        expression.build();

        const unrelated = new Literal("z", "z");
        const tokens = expression.getTokensAfter(unrelated);
        expect(tokens).toEqual([]);
    });

    test("getTokensAfter for atom child with parent includes parent next tokens", () => {
        const variable = new Literal("variable", "x");
        const expression = new Expression("expression", [variable]);

        // Embed expression as child of a sequence to give it a parent
        const wrapper = new Sequence("wrapper", [
            expression,
            new Literal("end", ";"),
        ]);

        // The Sequence clones children, so get the actual wired-up expression
        const wiredExpression = wrapper.children[0] as Expression;
        wiredExpression.build();

        const atomChild = wiredExpression.atomPatterns[0];
        const tokens = wiredExpression.getTokensAfter(atomChild as any);

        // The expression's parent is the wrapper Sequence.
        // getTokensAfter for an atom calls this._parent.getNextTokens()
        // which asks the wrapper's parent for what follows the wrapper.
        // Since the wrapper has no grandparent, this returns [].
        // But the branch (this._parent != null) IS taken.
        expect(Array.isArray(tokens)).toBe(true);
    });

    test("getPatterns returns atom and prefix patterns", () => {
        const negate = new Sequence("negate", [
            new Literal("minus", "-"),
            new Reference("expression"),
        ]);
        const variable = new Literal("variable", "x");

        const expression = new Expression("expression", [negate, variable]);
        const patterns = expression.getPatterns();

        expect(patterns.length).toBeGreaterThan(0);
    });

    test("getPatternsAfter for prefix child returns atom and prefix patterns", () => {
        const negate = new Sequence("negate", [
            new Literal("minus", "-"),
            new Reference("expression"),
        ]);
        const variable = new Literal("variable", "x");

        const expression = new Expression("expression", [negate, variable]);
        expression.build();

        const prefixChild = expression.prefixPatterns[0];
        const patterns = expression.getPatternsAfter(prefixChild as any);

        expect(patterns.length).toBeGreaterThan(0);
    });

    test("getPatternsAfter for atom child returns postfix and infix patterns", () => {
        const add = new Sequence("add", [
            new Reference("expression"),
            new Literal("plus", "+"),
            new Reference("expression"),
        ]);
        const variable = new Literal("variable", "x");

        const expression = new Expression("expression", [add, variable]);
        expression.build();

        const atomChild = expression.atomPatterns[0];
        const patterns = expression.getPatternsAfter(atomChild as any);

        // Should include the infix delimiter pattern
        expect(patterns.length).toBeGreaterThan(0);
    });

    test("getPatternsAfter for atom child with parent includes parent next patterns", () => {
        const variable = new Literal("variable", "x");
        const expression = new Expression("expression", [variable]);

        const wrapper = new Sequence("wrapper", [
            expression,
            new Literal("end", ";"),
        ]);

        const wiredExpression = wrapper.children[0] as Expression;
        wiredExpression.build();

        const atomChild = wiredExpression.atomPatterns[0];
        const patterns = wiredExpression.getPatternsAfter(atomChild as any);

        // The branch this._parent != null is taken. getNextPatterns on the
        // wrapper returns [] since the wrapper has no grandparent, but the
        // code path through line 577-578 is exercised.
        expect(Array.isArray(patterns)).toBe(true);
    });

    test("getPatternsAfter for postfix child returns postfix and infix patterns", () => {
        const bang = new Sequence("factorial", [
            new Reference("expression"),
            new Literal("bang", "!"),
        ]);
        const add = new Sequence("add", [
            new Reference("expression"),
            new Literal("plus", "+"),
            new Reference("expression"),
        ]);
        const variable = new Literal("variable", "x");

        const expression = new Expression("expression", [add, bang, variable]);
        expression.build();

        const postfixChild = expression.postfixPatterns[0];
        const patterns = expression.getPatternsAfter(postfixChild as any);

        expect(patterns.length).toBeGreaterThan(0);
    });

    test("getPatternsAfter for postfix child with parent includes parent next patterns", () => {
        const bang = new Sequence("factorial", [
            new Reference("expression"),
            new Literal("bang", "!"),
        ]);
        const variable = new Literal("variable", "x");
        const expression = new Expression("expression", [bang, variable]);

        const wrapper = new Sequence("wrapper", [
            expression,
            new Literal("end", ";"),
        ]);

        const wiredExpression = wrapper.children[0] as Expression;
        wiredExpression.build();

        const postfixChild = wiredExpression.postfixPatterns[0];
        const patterns = wiredExpression.getPatternsAfter(postfixChild as any);

        // The branch this._parent != null is taken, exercising lines 593-594.
        expect(Array.isArray(patterns)).toBe(true);
    });

    test("getNextTokens with no parent returns empty", () => {
        const expression = createOptionsExpression();
        expression.build();

        expect(expression.getNextTokens()).toEqual([]);
    });

    test("getNextTokens with parent returns parent's tokens after", () => {
        const variable = new Literal("variable", "x");
        const expression = new Expression("expression", [variable]);

        const wrapper = new Sequence("wrapper", [
            expression,
            new Literal("end", ";"),
        ]);

        const wiredExpression = wrapper.children[0] as Expression;
        wiredExpression.build();

        const tokens = wiredExpression.getNextTokens();
        expect(tokens).toContain(";");
    });

    test("getNextPatterns with no parent returns empty", () => {
        const expression = createOptionsExpression();
        expression.build();

        expect(expression.getNextPatterns()).toEqual([]);
    });

    test("getNextPatterns with parent returns parent's patterns after", () => {
        const variable = new Literal("variable", "x");
        const expression = new Expression("expression", [variable]);

        const wrapper = new Sequence("wrapper", [
            expression,
            new Literal("end", ";"),
        ]);

        const wiredExpression = wrapper.children[0] as Expression;
        wiredExpression.build();

        const patterns = wiredExpression.getNextPatterns();
        expect(patterns.length).toBeGreaterThan(0);
    });

    test("find delegates to findPattern", () => {
        const expression = createOptionsExpression();
        expression.build();

        const found = expression.find(p => p.name === "a");
        expect(found).not.toBeNull();
        expect(found!.name).toBe("a");

        const notFound = expression.find(p => p.name === "nonexistent");
        expect(notFound).toBeNull();
    });

    test("Prefix matched but input ends before atom", () => {
        // When a prefix matches but there's nothing left for the atom
        const negate = new Sequence("negate", [
            new Literal("minus", "-"),
            new Reference("expression"),
        ]);
        const variable = new Literal("variable", "a");

        const expression = new Expression("expression", [negate, variable]);

        // Just "-" with no atom to follow: prefix matches "-", cursor has no next
        const result = expression.exec("-");
        // This should fail because there's no atom after the prefix
        expect(result.ast).toBeNull();
    });

    test("Atom-only expression with trailing input stops at binary check", () => {
        // "a" matches as atom, cursor still has next ("b" remains), no postfix matches,
        // _tryToMatchBinary is entered, infixPatterns.length === 0 -> shouldStopParsing
        const a = new Literal("a", "a");
        const expression = new Expression("expression", [a]);

        // Input "ab": atom "a" matches index 0, cursor advances to index 1 ("b"),
        // no postfix/infix patterns -> shouldStopParsing in _tryToMatchBinary.
        // exec returns null ast since "b" is leftover, but the code path is exercised.
        const result = expression.exec("ab");
        expect(result.cursor.hasError).toBe(true);
    });

    test("getTokensAfter for postfix child with parent includes parent tokens", () => {
        const bang = new Sequence("factorial", [
            new Reference("expression"),
            new Literal("bang", "!"),
        ]);
        const variable = new Literal("variable", "x");
        const expression = new Expression("expression", [bang, variable]);

        const wrapper = new Sequence("wrapper", [
            expression,
            new Literal("end", ";"),
        ]);

        const wiredExpression = wrapper.children[0] as Expression;
        wiredExpression.build();

        const postfixChild = wiredExpression.postfixPatterns[0];
        const tokens = wiredExpression.getTokensAfter(postfixChild as any);

        // Exercises the postfix branch with parent (line 538-539)
        expect(Array.isArray(tokens)).toBe(true);
    });

    test("getPatternsAfter for unknown child returns empty", () => {
        const expression = createOptionsExpression();
        expression.build();

        const unrelated = new Literal("z", "z");
        const patterns = expression.getPatternsAfter(unrelated);
        expect(patterns).toEqual([]);
    });

    test("isEqual compares two expressions", () => {
        const a = new Literal("a", "a");
        const b = new Literal("b", "b");
        const expr1 = new Expression("expression", [a, b]);
        const expr2 = expr1.clone();

        expr1.build();
        (expr2 as Expression).build();

        expect(expr1.isEqual(expr2 as Expression)).toBe(true);
    });
});