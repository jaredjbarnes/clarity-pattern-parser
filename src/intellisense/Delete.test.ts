import { AutoComplete } from "../index";
import { And } from "../patterns/And";
import { Literal } from "../patterns/Literal";
import { Or } from "../patterns/Or";
import { Regex } from "../patterns/Regex";
import { Repeat } from "../patterns/Repeat";

export const STRING_PATTERN_NAME = 'stringPattern';
export const COLUMN_LITERAL_NAME = 'columnName';
export const DATE_COLUMN_LITERAL_NAME = 'dateColumnName';
export const NUMBER_LITERAL_NAME = '[NUMBER]';
export const NULL_LITERAL_NAME = 'null literal';
export const DATE_NOW_LITERAL_NAME = 'dateNowLiteral';

export const equal = new Literal('equal', '==');
export const notEqual = new Literal('not-equal', '!=');
export const lessThanOrEqual = new Literal('less-or-equal', '<=');
export const greaterThanOrEqual = new Literal('greater-or-equal', '>=');
export const lessThan = new Literal('less-than', '<');
export const greaterThan = new Literal('greater-than', '>');
export const contains = new Literal('contains', 'contains');
export const doesNotContain = new Literal('!contains', '!contains');
export const startsWith = new Literal('starts_with', 'starts_with');
export const doesNotStartWith = new Literal('!starts_with', '!starts_with');
export const endsWith = new Literal('ends_with', 'ends_with');
export const doesNotEndWith = new Literal('!ends_with', '!ends_with');
export const comparisonOperator = new Or('comparisonOperator', [
    equal,
    notEqual,
    lessThanOrEqual,
    greaterThanOrEqual,
    lessThan,
    greaterThan,
    contains,
    doesNotContain,
    startsWith,
    doesNotStartWith,
    endsWith,
    doesNotEndWith,
]);

export const stringComparisonOperator = new Or('stringComparisonOperators', [
    equal,
    notEqual,
    contains,
    doesNotContain,
    startsWith,
    doesNotStartWith,
    endsWith,
    doesNotEndWith,
]);

export const plus = new Literal('plus', '+');
export const minus = new Literal('minus', '-');
export const multiply = new Literal('multiply', '*');
export const divide = new Literal('divide', '/');
export const coalesce = new Literal('coalesce', '??');
export const arithmeticOperator = new Or('arithmeticOperator', [
    plus,
    minus,
    multiply,
    divide,
    coalesce,
]);
export const openParen = new Literal('openParen', '(');
export const closedParen = new Literal('closedParen', ')');

export const space = new Regex('space', ' |\n');
export const dash = new Literal('dash', '-');
export const nullValue = new Literal(NULL_LITERAL_NAME, 'null');
export const quote = new Literal('quote', "'");
export const at = new Literal('at', '@');
export const colon = new Literal('colon', ':');

export const booleanTrue = new Literal('true', 'true');
export const booleanFalse = new Literal('false', 'false');
export const and = new Literal('and', 'and');
export const or = new Literal('or', 'or');
export const booleanOperator = new Or('booleanOperator', [and, or]);
export const booleanLiteral = new Or('booleanLiteral', [booleanTrue, booleanFalse]);

export const numberContents = new Regex(
    NUMBER_LITERAL_NAME,
    '[-+]?[0-9]*[.]?[0-9]+?([0-9]*)?'
);
export const stringContents = new Regex('[TEXT]', "[^']*");

export const stringPattern = new And(STRING_PATTERN_NAME, [quote, stringContents, quote]);
export const equalityOperator = new Or('equalityOperator', [equal, notEqual]);

export const yearLiteral = new Literal('year', 'year');
export const monthLiteral = new Literal('month', 'month');
export const dayLiteral = new Literal('day', 'day');
export const hourLiteral = new Literal('hour', 'hour');
export const minuteLiteral = new Literal('minute', 'minute');
export const secondLiteral = new Literal('second', 'second');
export const dateComponentLiteral = new Or('dateComponentLiteral', [
    yearLiteral,
    monthLiteral,
    dayLiteral,
    hourLiteral,
    minuteLiteral,
    secondLiteral,
]);
export const dateNowLiteral = new Literal(DATE_NOW_LITERAL_NAME, 'now');

export const STRING_PARAMETER_NAME = 'stringParameter';
export const BOOLEAN_PARAMETER_NAME = 'booleanParameter';
export const NUMBER_PARAMETER_NAME = 'numberParameter';
export const DATE_PARAMETER_NAME = 'dateParameter';


describe("Riley", () => {
    test("My Test", () => {
        const column = new Or("column", [
            new Literal("column1", "column1"),
            new Literal("column2", "column2"),
            new Literal("column3", "column3")
        ], false, true);

        const operand = new Or('operand', [stringPattern, numberContents, column], false, true);
        const concat = new Repeat("concat", operand, { divider: new Literal("+", " + ") });
        const myLiteral = new Literal("hack", "column1 + jimmy");
        const or = new Or("or", [concat, myLiteral], false, true);

        let autoComplete = new AutoComplete(or, {greedyPatternNames: ["+"]});
        const results = autoComplete.suggestFor("column1 + ");


        let result = or.exec("column1 + 1");
        result = or.exec("column1 + jimmy");
        expect(results).toBe(results);
        expect(result).toBe(results);

    });
});