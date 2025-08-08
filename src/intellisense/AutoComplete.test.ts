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

    test("Full Pattern Match Simple", () => {
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


    test("Option should error at furthest match index", () => {
        const john = new Literal("john", "John");
        const space = new Literal("space", " ");
        const doe = new Literal("doe", "Doe");
        const smith = new Literal("smith", "Smith");
        const name = new Sequence("name", [john, space, new Options("last-name", [smith, doe])]);

        const text = "John Smi"
        const autoComplete = new AutoComplete(name);
        const result = autoComplete.suggestFor(text);
        const expectedOptions = [{
            text: "th",
            startIndex: 8
        }];

        expect(result.ast).toBeNull();
        expect(result.options).toEqual(expectedOptions);
        expect(result.errorAtIndex).toBe(text.length);
        expect(result.isComplete).toBeFalsy();
        expect(result.cursor).not.toBeNull();
    });


    test("Root Regex Pattern suggests customTokens", () => {
        const freeTextPattern = new Regex(
            `free-text`,
            '[(\\w)\\s]+'
          );

          const customTokensMap:Record<string, string[]> = {
            'free-text': ['luke',"leia skywalker",'luke skywalker']
        }
        const autoComplete = new AutoComplete(freeTextPattern,{
            customTokens:customTokensMap
        });
        const result = autoComplete.suggestFor("luke");

        const expected = [
            { text: " skywalker", startIndex: 4 },
        ];       

        expect(result.ast?.value).toBe("luke");
        expect(result.options).toEqual(expected);
        expect(result.errorAtIndex).toBeNull()
        expect(result.isComplete).toBeTruthy();
        expect(result.cursor).not.toBeNull();

    });


    test("Sequence Regex Pattern suggests customTokens", () => {
        const jediLiteral = new Literal("jedi", "jedi ");
        const freeTextPattern = new Regex(
            `free-text`,
            '[(\\w)\\s]+'
          );
        const sequence = new Sequence('sequence', [jediLiteral,freeTextPattern])


        const customTokensMap:Record<string, string[]> = {
            'free-text': ['luke',"leia skywalker",'luke skywalker']
        }
        const autoComplete = new AutoComplete(sequence,{
            customTokens:customTokensMap
        });
        const result = autoComplete.suggestFor("jedi luke sky");

        const expected = [
            { text: "walker", startIndex: 13 },
        ];       

        expect(result.ast?.value).toBe("jedi luke sky");
        expect(result.options).toEqual(expected);
        expect(result.errorAtIndex).toBeNull()
        expect(result.isComplete).toBeTruthy();
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

    test("Partial Simple", () => {
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


    test("Options AutoComplete on Root Pattern", () => {

        const jack = new Literal("first-name", "Jack");
        const john = new Literal("first-name", "John");

        const names = new Options('names', [jack,john]);
        const divider = new Literal('divider', ', ');
        const repeat = new Repeat('name-list', names, { divider, trimDivider: true });

        const text = ''

        const autoCompleteOptions: AutoCompleteOptions = {
            customTokens: {
                'first-name': ["James"]
            }
        };
        const autoComplete = new AutoComplete(repeat,autoCompleteOptions);

        const suggestion = autoComplete.suggestFor(text)

        const expectedOptions = [
            { text: "Jack", startIndex: 0 },
            { text: "John", startIndex: 0 },
            { text: "James", startIndex: 0 },
        ];

        expect(suggestion.options).toEqual(expectedOptions)
    
    })

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

    test("Remove options divider", () => {
        const jediLuke = new Literal(`jedi`, 'luke');
        const names = new Options('names', [jediLuke]);
        const literalA = new Literal('literal-a', 'a');
        const literalB = new Literal('literal-b', 'b');

        const optionsDivider = new Options('options-divider', [literalA, literalB]);

        // control to prove the pattern works without trimDivider
        const controlPattern = new Repeat('name-list', names, { divider: optionsDivider });
        const controlAutoComplete = new AutoComplete(controlPattern);
        const controlResult = controlAutoComplete.suggestFor('lukea');
        expect(controlResult.isComplete).toEqual(true);

        const trimPattern = new Repeat('name-list', names, { divider: optionsDivider, trimDivider: true });
        const trimAutoComplete = new AutoComplete(trimPattern);

        const trimResult = trimAutoComplete.suggestFor('lukea');
        expect(trimResult.isComplete).toEqual(false);
    })

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
        const result = new AutoComplete(pattern).suggestFor("FlagA AND FlagAlkjhgB");

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

    test("Multiple Complex Branches", () => {
        const branchOne = new Sequence("branch-1", [
            new Literal("space-1-1", " "),
            new Literal("space-1-2", " "),
            new Options('branch-1-options', [
                new Literal("AA", "AA"),
                new Literal("AB", "AB"),
                new Literal("BC", "BC"),
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
            { startIndex: 3, text: "C" },
        ];
        expect(results.options).toEqual(expected);
    });


    test("Recursion With Or", () => {
        const ref = new Reference("names");
        const names = new Options("names", [
            ref,
            new Literal("john", "John"),
            new Literal("jane", "Jane")
        ]);

        const autoComplete = new AutoComplete(names);
        const suggestion = autoComplete.suggestFor("Jo");

        expect(suggestion.options).toEqual([
            { text: 'hn', startIndex: 2 }
        ]);
        expect(suggestion.error?.lastIndex).toBe(2);
    });

    test("Recursion With And", () => {
        const firstNames = new Options("first-names", [
            new Literal("john", "John"),
            new Literal("jane", "Jane"),
        ]);

        const lastNames = new Options("last-names", [
            new Literal("doe", "Doe"),
            new Literal("smith", "Smith"),
        ]);

        const fullName = new Sequence("full-name", [
            firstNames,
            new Literal("space", " "),
            lastNames
        ]);

        const ref = new Reference("names");
        const names = new Sequence("names", [
            fullName,
            ref,
            lastNames,
        ]);

        const autoComplete = new AutoComplete(names, {
            greedyPatternNames: ["space"]
        });
        const suggestion = autoComplete.suggestFor("John");

        expect(suggestion.options).toEqual([{
            "text": " Doe",
            "startIndex": 4
        }, {
            "text": " Smith",
            "startIndex": 4
        }]);
    });

    test("Repeat With Options", () => {
        const john = new Literal("john", "John");
        const jane = new Literal("jane", "Jane");
        const names = new Options("names", [john, jane]);
        const comma = new Regex("comma", "\\s*,\\s*");
        comma.setTokens([", "]);
        const list = new Repeat("names-list", names, {
            divider: comma
        });

        const autoComplete = new AutoComplete(list);
        const suggestion = autoComplete.suggestFor("John, ");

        expect(suggestion).toBe(suggestion);
    });

    test("Repeat With Options With Options", () => {
        const john = new Literal("john", "John");
        const jane = new Literal("jane", "Jane");
        const jack = new Literal("jack", "Jack");
        const jill = new Literal("jill", "Jill");
        const otherNames = new Options("names", [jack, jill]);
        const names = new Options("names", [john, jane, otherNames]);
        const comma = new Regex("comma", "\\s*,\\s*");
        comma.setTokens([", "]);
        const list = new Repeat("names-list", names, {
            divider: comma,
            trimDivider: true
        });

        const autoComplete = new AutoComplete(list, { greedyPatternNames: ["comma"] });
        const suggestion = autoComplete.suggestFor("John");

        expect(suggestion).toBe(suggestion);
    });

    test("Mid sequence suggestion", () => {
        const operator = new Options("operator", [
            new Literal("==", "=="),
            new Literal("!=", "!="),
        ]);
        const leftOperands = new Options("left-operands", [
            new Literal("variable-1", "variable1"),
            new Literal("variable-2", "variable2"),
        ]);

        const rightOperands = new Options("right-operands", [
            new Literal("variable-3", "variable3"),
            new Literal("variable-4", "variable4"),
        ]);

        const optionalSpace = new Optional("optional-sapce", new Regex("space", "\\s+"));
        const statement = new Sequence("statement", [leftOperands, optionalSpace, operator, optionalSpace, rightOperands]);

        const autoComplete = new AutoComplete(statement, { greedyPatternNames: ["space", "operator"], customTokens: { space: [" "] } }
        );
        const result = autoComplete.suggestFor("variable1 ==");

        expect(result.options).toEqual([{
            text: " ",
            startIndex: 12,
        },
        {
            text: "variable3",
            startIndex: 12,
        },
        {
            text: "variable4",
            startIndex: 12,
        }
    ]);
    });


    test("Calling AutoComplete -> _getAllOptions Does not mutate customTokensMap", () => {

        const jediLuke = new Literal(`jedi`, 'luke');
        const names = new Options('names', [jediLuke]);
        const divider = new Literal('divider', ', ');
        const pattern = new Repeat('name-list', names, { divider, trimDivider: true });
        
        const customTokensMap:Record<string, string[]> = {
            'jedi': ["leia"]
        }
        
        const copiedCustomTokensMap:Record<string, string[]>  = JSON.parse(JSON.stringify(customTokensMap));
        
        const autoCompleteOptions: AutoCompleteOptions = {
            greedyPatternNames:['jedi'],
            customTokens: customTokensMap
        };
        const autoComplete = new AutoComplete(pattern,autoCompleteOptions);
        
        // provide a non-empty input to trigger the logic flow that hits _getAllOptions
        autoComplete.suggestFor('l')
        
        expect(customTokensMap).toEqual(copiedCustomTokensMap)
    })

});

  
