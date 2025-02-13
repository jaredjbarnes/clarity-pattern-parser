import { Context } from "../patterns/Context";
import { Expression } from "../patterns/Expression";
import { Literal } from "../patterns/Literal";
import { Pattern } from "../patterns/Pattern";
import { Regex } from "../patterns/Regex";
import { Repeat } from "../patterns/Repeat";

export class Generator {
    private _depth = 1;
    private _terminalPatterns = [
        "literal",
        "regex",
        "repeat",
        "finite-repeat",
        "infinite-repeat",
        "reference",
        "context",
        "expression"
    ];

    constructor(depth = 0) {
        this._depth = depth;
    }

    generate(pattern: Pattern): string {
        return this._walkUp(pattern, (pattern: Pattern, args: string[]) => {
            const type = pattern.type;
            const name = this._escapeString(pattern.name);

            args = this._indent(args, this._depth + 1);
            switch (type) {
                case "context": {
                    const context = pattern as Context;
                    const contextPatterns = context.getPatternsWithinContext();
                    const contextPatternString = new Generator(this._depth).generate(context.children[0]);

                    const contextPatternsString = this._indent(Object.values(contextPatterns).map(p => {
                        return new Generator(this._depth + 2).generate(p);
                    }), this._depth + 2);

                    return `new Context("${name}",${this._generateTabs(this._depth + 1)}${contextPatternString}, [${contextPatternsString.join(", ")}${this._generateTabs(this._depth)}])`;
                }
                case "expression": {
                    const expression = pattern as Expression;
                    const patterns = expression.originalPatterns;

                    const patternsString = this._indent(patterns.map(p => {
                        return new Generator(this._depth + 2).generate(p);
                    }), this._depth + 2);

                    return `new Expression("${name}", [${patternsString.join(", ")}${this._generateTabs(this._depth + 1)}])`;
                }
                case "literal": {
                    const literal = pattern as Literal;
                    return `new Literal("${name}", "${this._escapeString(literal.token)}")`;
                }
                case "not": {
                    return `new Not("${name}", ${args.join("")})`;
                }
                case "optional": {
                    return `new Optional("${name}", ${args.join("")})`;
                }
                case "options": {
                    return `new Options("${name}", [${args.join(", ")}${this._generateTabs(this._depth)}])`;
                }
                case "reference": {
                    return `new Reference("${name}")`;
                }
                case "regex": {
                    const regex = pattern as Regex;
                    return `new Literal("${name}", "${this._escapeString(regex.regex)}")`;
                }
                case "infinite-repeat": {
                    const repeat = pattern as Repeat;
                    const generator = new Generator(this._depth + 1);
                    const repeatPattern = repeat.pattern;
                    const options = repeat.options;
                    const repeatPatternString = generator.generate(repeatPattern);
                    let dividerString = "null";

                    if (options.divider != null) {
                        dividerString = generator.generate(options.divider);
                    }

                    return `new Repeat("${name}", ${this._generateTabs(this._depth + 1)}${repeatPatternString}, {min: ${repeat.min}, divider: ${dividerString}})`;
                }
                case "finite-repeat": {
                    const repeat = pattern as Repeat;
                    const generator = new Generator(this._depth);
                    const repeatPattern = repeat.pattern;
                    const options = repeat.options;
                    const repeatPatternString = generator.generate(repeatPattern);
                    let dividerString = "null";

                    if (options.divider != null) {
                        dividerString = generator.generate(options.divider);
                    }
                    return `new Repeat("${name}", ${this._generateTabs(this._depth + 1)}${repeatPatternString}, {min: ${repeat.min}, max: ${repeat.max} divider: ${dividerString}})`;
                }
                case "right-associated": {
                    return `new RightAssociation(${args.join("")})`;
                }
                case "sequence": {
                    return `new Sequence("${name}", [${args.join(", ")}${this._generateTabs(this._depth)}])`;
                }
            }
            throw Error("Cannot find pattern.");
        });
    }

    private _walkUp(pattern: Pattern, callback: (pattern: Pattern, args: string[]) => string): string {
        const results: string[] = [];

        if (this._terminalPatterns.includes(pattern.type)) {
            return callback(pattern, []);
        }

        pattern.children.forEach(p => {
            this._depth++;
            results.push(this._walkUp(p, callback));
            this._depth--;
        });

        const filteredResults = results.filter(s => s.length > 0);

        return callback(pattern, filteredResults);
    }

    private _escapeString(value: string) {
        return value.replaceAll('"', '\\"');
    }

    private _generateTabs(depth: number) {
        return "\n" + new Array(depth).fill("  ").join("");
    }

    private _indent(args: string[], depth: number) {
        return args.map(s => this._generateTabs(depth) + s);
    }

}