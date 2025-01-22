import { Sequence } from "../patterns/Sequence";
import { Literal } from "../patterns/Literal";
import { Options } from "../patterns/Options";
import { Pattern } from "../patterns/Pattern";
import { Reference } from "../patterns/Reference";
import { Regex } from "../patterns/Regex";
import { Repeat } from "../patterns/Repeat";
import { AutoComplete, AutoCompleteOptions } from "./AutoComplete";
import { Optional } from "../patterns/Optional";

function generateFlagFromList(flagNames: string[]) {
    return flagNames.map(flagName => {
        return new Literal('flag-name', flagName);
    });
}

function generateFlagPattern(flagNames: string[]): Pattern {
    const singleFlagOption = flagNames.length === 1 && flagNames[0];
    if (singleFlagOption) {
        return new Literal('flag-name', singleFlagOption);
    }

    const flagPattern = new Options('flags', generateFlagFromList(flagNames));
    return flagPattern;
}

export function generateExpression(flagNames: string[]): Repeat {
    if (flagNames.length === 0) {
        // regex is purposefully impossible to satisfy
        const noValidOptionsRegex = new Regex('[No Valid Options Exist]', '(?=a)^(?!a)');

        // returning a "Repeat" so as to not break current implementations relying on a Repeat return
        const invalidInputExpression = new Repeat(
            'impossible_expression',
            noValidOptionsRegex
        );

        return invalidInputExpression;
    }

    const openParen = new Literal('open-paren', '(');
    const closeParen = new Literal('close-paren', ')');
    const space = new Regex('[space]', '\\s');
    const and = new Literal('sequence-literal', 'AND');
    const or = new Literal('options-literal', 'OR');
    const not = new Literal('not', 'NOT ');
    const booleanOperator = new Options('booleanOperator', [and, or]);
    const operatorWithSpaces = new Sequence('operator-with-spaces', [
        space,
        booleanOperator,
        space,
    ]);
    const flag = generateFlagPattern(flagNames);
    const group = new Sequence('group', [
        openParen,
        new Reference('flag-expression'),
        closeParen,
    ]);
    const flagOptionsGroup = new Options('flag-or-group', [flag, group]);
    const expressionBody = new Sequence('flag-body', [
        new Optional("optional-not", not),
        flagOptionsGroup,
    ]);
    const flagExpression = new Repeat(
        'flag-expression',
        expressionBody,
        { divider: operatorWithSpaces, trimDivider: true }
    );
    return flagExpression;
}

describe("AutoComplete", () => {
    test("No Text", () => {
        const name = new Literal("name", "Name");
        const autoComplete = new AutoComplete(name);
        let result = autoComplete.suggestFor("");

        expect(result.options[0].text).toBe("Name");
        expect(result.options[0].startIndex).toBe(0);
        expect(result.errorAtIndex).toBe(0);
        expect(result.isComplete).toBeFalsy();
    });

    test("Full Pattern Match", () => {
        const john = new Literal("john", "John");
        const space = new Literal("space", " ");
        const doe = new Literal("doe", "Doe");
        const smith = new Literal("smith", "Smith");
        const name = new Sequence("name", [john, space, new Options("last-name", [smith, doe])]);

        const autoComplete = new AutoComplete(name);
        const result = autoComplete.suggestFor("John Doe");

        expect(result.ast?.value).toBe("John Doe");
        expect(result.options.length).toBe(0);
        expect(result.errorAtIndex).toBeNull();
        expect(result.isComplete).toBeTruthy();
        expect(result.cursor).not.toBeNull();
    });

    test("More Than One Option", () => {
        const john = new Literal("john", "John");
        const space = new Literal("space", " ");
        const doe = new Literal("doe", "Doe");
        const smith = new Literal("smith", "Smith");
        const name = new Sequence("name", [john, space, new Options("last-name", [smith, doe])]);

        const text = "John "
        const autoComplete = new AutoComplete(name);
        const result = autoComplete.suggestFor(text);
        const expectedOptions = [{
            text: "Doe",
            startIndex: 5
        }, {
            text: "Smith",
            startIndex: 5
        }];

        expect(result.ast).toBeNull();
        expect(result.options).toEqual(expectedOptions);
        expect(result.errorAtIndex).toBe(text.length);
        expect(result.isComplete).toBeFalsy();
        expect(result.cursor).not.toBeNull();
    });

    test("Full Pattern Match With Root Repeat", () => {
        const john = new Literal("john", "John");
        const space = new Literal("space", " ");
        const doe = new Literal("doe", "Doe");
        const smith = new Literal("smith", "Smith");
        const name = new Sequence("name", [john, space, new Options("last-name", [smith, doe])]);
        const divider = new Regex("divider", "\\s+,\\s+");

        divider.setTokens([", "])

        const text = "John Doe";
        const autoComplete = new AutoComplete(new Repeat("last-names", name, { divider }));
        const result = autoComplete.suggestFor(text);
        const expectedOptions = [{
            text: ", ",
            startIndex: 8
        }];

        expect(result.ast?.value).toBe(text);
        expect(result.options).toEqual(expectedOptions);
        expect(result.errorAtIndex).toBeNull()
        expect(result.isComplete).toBeTruthy();
        expect(result.cursor).not.toBeNull();
    });

    test("Partial", () => {
        const name = new Literal("name", "Name");
        const autoComplete = new AutoComplete(name);
        // Use deprecated suggest for code coverage.
        const result = autoComplete.suggestFor("Na");
        const expectedOptions = [{
            text: "me",
            startIndex: 2
        }];

        expect(result.ast).toBeNull();
        expect(result.options).toEqual(expectedOptions);
        expect(result.errorAtIndex).toBe(2);
        expect(result.isComplete).toBeFalsy();
        expect(result.cursor).not.toBeNull();
    });

    test("Partial Match With Bad Characters", () => {
        const name = new Literal("name", "Name");
        const autoComplete = new AutoComplete(name);
        const result = autoComplete.suggestFor("Ni");

        const expectedOptions = [{
            text: "ame",
            startIndex: 1
        }];

        expect(result.ast).toBeNull();
        expect(result.options).toEqual(expectedOptions);
        expect(result.errorAtIndex).toBe(1);
        expect(result.isComplete).toBeFalsy();
        expect(result.cursor).not.toBeNull();
    });

    test("Complete", () => {
        const name = new Literal("name", "Name");
        const autoComplete = new AutoComplete(name);
        const text = "Name"
        const result = autoComplete.suggestFor(text);

        expect(result.ast?.value).toBe(text);
        expect(result.options).toEqual([]);
        expect(result.errorAtIndex).toBeNull();
        expect(result.isComplete).toBeTruthy();
        expect(result.cursor).not.toBeNull();
    });

    test("Options AutoComplete on Composing Pattern", () => {
        const autoCompleteOptions: AutoCompleteOptions = {
            greedyPatternNames: ["space"],
            customTokens: {
                "last-name": ["Sparrow"]
            }
        };

        const jack = new Literal("jack", "Jack");
        const john = new Literal("john", "John");
        const space = new Literal("space", " ");
        const doe = new Literal("doe", "Doe");
        const smith = new Literal("smith", "Smith");
        const firstName = new Options("first-name", [jack, john]);
        const lastName = new Options("last-name", [doe, smith]);
        const fullName = new Sequence("full-name", [firstName, space, lastName]);

        const text = "Jack";
        const autoComplete = new AutoComplete(fullName, autoCompleteOptions);
        const { options, ast, errorAtIndex } = autoComplete.suggestFor(text);

        const expectedOptions = [
            { text: " Doe", startIndex: 4 },
            { text: " Smith", startIndex: 4 },
            { text: " Sparrow", startIndex: 4 },
        ];

        const results = expectedOptions.map(o => text.slice(0, o.startIndex) + o.text);
        const expectedResults = [
            "Jack Doe",
            "Jack Smith",
            "Jack Sparrow",
        ]

        expect(ast).toBeNull();
        expect(errorAtIndex).toBe(4);
        expect(options).toEqual(expectedOptions);
        expect(results).toEqual(expectedResults);

    });

    test("Options AutoComplete On Leaf Pattern", () => {
        const autoCompleteOptions: AutoCompleteOptions = {
            greedyPatternNames: ["space"],
            customTokens: {
                "space": ["  "]
            }
        };

        const jack = new Literal("jack", "Jack");
        const john = new Literal("john", "John");
        const space = new Literal("space", " ");
        const doe = new Literal("doe", "Doe");
        const smith = new Literal("smith", "Smith");
        const firstName = new Options("first-name", [jack, john]);
        const lastName = new Options("last-name", [doe, smith]);
        const fullName = new Sequence("full-name", [firstName, space, lastName]);

        const text = "Jack";
        const autoComplete = new AutoComplete(fullName, autoCompleteOptions);
        const { options, ast, errorAtIndex } = autoComplete.suggestFor(text);
        const expectedOptions = [
            { text: "  Doe", startIndex: 4 },
            { text: "  Smith", startIndex: 4 },
            { text: " Doe", startIndex: 4 },
            { text: " Smith", startIndex: 4 },
        ];

        const results = expectedOptions.map(o => text.slice(0, o.startIndex) + o.text);
        const expectedResults = [
            "Jack  Doe",
            "Jack  Smith",
            "Jack Doe",
            "Jack Smith",
        ]

        expect(ast).toBeNull();
        expect(errorAtIndex).toBe(4);
        expect(options).toEqual(expectedOptions);
        expect(results).toEqual(expectedResults)

    });

    test("Match On Different Pattern Roots", () => {
        const start = new Literal("start", "John went to");
        const a = new Literal("a", "a bank.");
        const the = new Literal("the", "the store.");

        const first = new Sequence("first", [start, a]);
        const second = new Sequence("second", [start, the]);

        const both = new Options("both", [first, second]);

        const autoComplete = new AutoComplete(both);
        const result = autoComplete.suggestFor("John went to a gas station.");
        const expected = [
            { text: "the store.", startIndex: 12 },
            { text: "a bank.", startIndex: 12 }
        ];
        expect(result.options).toEqual(expected);
    });

    test("Options on errors because of string ending, with match", () => {
        const smalls = new Options("kahns", [
            new Literal("large", "kahnnnnnn"),
            new Literal("medium", "kahnnnnn"),
            new Literal("small", "kahn"),
        ]);

        const autoComplete = new AutoComplete(smalls);
        const result = autoComplete.suggestFor("kahn");

        const expected = [
            { text: "nnnnn", startIndex: 4 },
            { text: "nnnn", startIndex: 4 }
        ];

        expect(result.options).toEqual(expected);
        expect(result.isComplete).toBeTruthy();
    });

    test("Options on errors because of string ending, between matches", () => {
        const smalls = new Options("kahns", [
            new Literal("large", "kahnnnnnn"),
            new Literal("medium", "kahnnnnn"),
            new Literal("small", "kahn"),
        ]);

        const autoComplete = new AutoComplete(smalls);
        const result = autoComplete.suggestFor("kahnn");

        const expected = [
            { text: "nnnn", startIndex: 5 },
            { text: "nnn", startIndex: 5 }
        ];

        expect(result.options).toEqual(expected);
        expect(result.isComplete).toBeFalsy();
    });

    test("Options on errors because of string ending, match middle", () => {
        const smalls = new Options("kahns", [
            new Literal("large", "kahnnnnnn"),
            new Literal("medium", "kahnnnnn"),
            new Literal("small", "kahn"),
        ]);

        const autoComplete = new AutoComplete(smalls);
        const result = autoComplete.suggestFor("kahnnnnn");

        const expected = [
            { text: "n", startIndex: 8 },
        ];

        expect(result.options).toEqual(expected);
        expect(result.isComplete).toBeTruthy();
    });


    test("Options on errors because of string ending on a variety, with match", () => {
        const smalls = new Options("kahns", [
            new Literal("different-3", "kahnnnnnnn3"),
            new Literal("different-21", "kahnnnnnn21"),
            new Literal("different-22", "kahnnnnnn22"),
            new Literal("different-2", "kahnnnnnn2"),
            new Literal("different", "kahnnnnnn1"),
            new Literal("large", "kahnnnnnn"),
            new Literal("medium", "kahnnnnn"),
            new Literal("small", "kahn"),
        ]);

        const autoComplete = new AutoComplete(smalls);
        const result = autoComplete.suggestFor("kahnnnnn");

        const expected = [
            { text: "nn3", startIndex: 8 },
            { text: "n21", startIndex: 8 },
            { text: "n22", startIndex: 8 },
            { text: "n2", startIndex: 8 },
            { text: "n1", startIndex: 8 },
            { text: "n", startIndex: 8 },
        ];

        expect(result.options).toEqual(expected);
        expect(result.isComplete).toBeTruthy();
    });

    test("Options on errors because of string ending on different branches, with match", () => {
        const smalls = new Options("kahns", [
            new Sequence("kahn-combo-3", [new Literal("kah", "kah"), new Sequence('partial', [new Literal("n", "n"), new Literal("three", "3")])]),
            new Sequence("kahn-combo", [new Literal("kahn", "kahn"), new Literal("one", "1")]),
            new Sequence("kahn-combo-2", [new Literal("kahn", "kahn"), new Literal("two", "2")]),
            new Literal("small", "kahn"),
        ]);

        const autoComplete = new AutoComplete(smalls);
        const result = autoComplete.suggestFor("kahn");

        const expected = [
            { text: "2", startIndex: 4 },
            { text: "1", startIndex: 4 },
            { text: "3", startIndex: 4 },
        ];

        expect(result.options).toEqual(expected);
        expect(result.isComplete).toBeTruthy();
    });

    test("Remove Trailing Divider", () => {
        const repeat = new Repeat("repeat", new Literal("a", "a"), { divider: new Literal("pipe", "|"), trimDivider: true });
        const autoComplete = new AutoComplete(repeat);
        const result = autoComplete.suggestFor("a|a|");

        expect(result.options).toEqual([{ text: 'a', startIndex: 4 }]);
    });

    test("Expect Divider", () => {
        const repeat = new Repeat("repeat", new Literal("a", "a"), { divider: new Literal("pipe", "|") });
        const autoComplete = new AutoComplete(repeat);
        const result = autoComplete.suggestFor("a|a");

        expect(result.options).toEqual([{ text: '|', startIndex: 3 }]);
    });

    test("Repeat with bad second repeat", () => {
        const repeat = new Repeat("repeat", new Literal("a", "a"), { divider: new Literal("pipe", "|"), trimDivider: true });
        const autoComplete = new AutoComplete(repeat);
        const result = autoComplete.suggestFor("a|b");

        expect(result.options).toEqual([{ text: 'a', startIndex: 2 }]);
    });

    test("Repeat with bad trailing content", () => {
        const flags = ["FlagA", "FlagB", "FlagC"];
        const pattern = generateExpression(flags);
        const result = new AutoComplete(pattern).suggestFor("FlagA AND FlagAlkjhgB")

        expect(result.options).toEqual([]);
        expect(result.ast?.value).toBe("FlagA AND FlagA");
        expect(result.errorAtIndex).toBe(15);
    });

    test("Greedy Options", () => {
        const john = new Literal("john", "John");
        const doe = new Literal("doe", "Doe");
        const jane = new Literal("jane", "Jane");
        const smith = new Literal("smith", "Smith");
        const space = new Literal("space", " ");

        const firstName = new Options("first-name", [john, jane], true);
        const lastName = new Options("last-name", [doe, smith], true);
        const johnJohnson = new Literal("john-johnson", "John Johnson");
        const johnStockton = new Literal("john-stockton", "John Stockton");
        const fullName = new Sequence("full-name", [firstName, space, lastName]);
        const names = new Options("names", [johnStockton, johnJohnson, fullName], true);

        const autoComplete = new AutoComplete(names);
        const results = autoComplete.suggestFor("John ");
        const expected = [
            {
                text: "Doe",
                startIndex: 5,
            },
            {
                text: "Smith",
                startIndex: 5,
            },
            {
                text: "Stockton",
                startIndex: 5,
            },
            {
                text: "Johnson",
                startIndex: 5,
            },
        ];
        expect(results.options).toEqual(expected);
        expect(results.ast).toBeNull();
        expect(results.errorAtIndex).toBe(5);
    });

    test("Dedup suggestions", () => {
        const branchOne = new Sequence("branch-1", [new Literal("space", " "), new Literal("A", "A")]);
        const branchTwo = new Sequence("branch-2", [new Literal("space", " "), new Literal("B", "B")]);
        const eitherBranch = new Options("either-branch", [branchOne, branchTwo]);

        const autoComplete = new AutoComplete(eitherBranch);
        const results = autoComplete.suggestFor("");
        const expected = [{
            startIndex: 0,
            text: " "
        }];
        expect(results.options).toEqual(expected);
    });

    test("Furthest Error", () => {
        const branchOne = new Sequence("branch-1", [
          new Literal("space-1-1", " "),
          new Literal("space-1-2", " "),
          new Options('branch-1-options', [
            new Literal("AA", "AA"),
            new Literal("AB", "AB"),
          ])
        ]);
        const branchTwo = new Sequence("branch-2", [
          new Literal("space-2-1", " "),
          new Literal("space-2-2", " "),
          new Options('branch-2-options', [
            new Literal("BA", "BA"),
            new Literal("BB", "BB")
          ])
        ]);
        const eitherBranch = new Options("either-branch", [branchOne, branchTwo]);

        const autoComplete = new AutoComplete(eitherBranch);
        const results = autoComplete.suggestFor("  B");
        const expected = [
          { startIndex: 3, text: "A" },
          { startIndex: 3, text: "B" },
        ];
        expect(results.options).toEqual(expected);
    })
});
