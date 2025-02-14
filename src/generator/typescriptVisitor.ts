import { Context } from "../patterns/Context";
import { Expression } from "../patterns/Expression";
import { Literal } from "../patterns/Literal";
import { Pattern } from "../patterns/Pattern";
import { Regex } from "../patterns/Regex";
import { Repeat } from "../patterns/Repeat";
import { IGenerator } from "./igenerator";
import { IVisitor } from "./ivisitor";

export class TypescriptVisitor implements IVisitor {
    private _generator: IGenerator | null = null;

    get generator() {
        if (this._generator == null) {
            throw new Error("No Generator Found");
        }

        return this._generator;
    }

    begin(generator: IGenerator) {
        this._generator = generator;
    }

    end() { }

    header(): string {
        return "";
    }
    footer(): string {
        return "";
    }

    context(pattern: Pattern, depth: number): string {
        const name = pattern.name;
        const context = pattern as Context;
        const contextPatterns = context.getPatternsWithinContext();

        this.generator.setDepth(depth);

        const contextPatternString = this.generator.generate(context.children[0]);

        const contextPatternsString = this._indent(Object.values(contextPatterns).map(p => {
            this.generator.setDepth(depth + 2);
            return this.generator.generate(p);
        }), depth + 2);

        return `new Context("${name}",${this._generateTabs(depth + 1)}${contextPatternString}, [${contextPatternsString.join(", ")}${this._generateTabs(depth + 1)}])`;

    }

    expression(pattern: Pattern, depth: number): string {
        const name = pattern.name;
        const expression = pattern as Expression;
        const patterns = expression.originalPatterns;

        const patternsString = this._indent(patterns.map(p => {
            this.generator.setDepth(depth + 2);
            return this.generator.generate(p);
        }), depth + 2);

        return `new Expression("${name}", [${patternsString.join(", ")}${this._generateTabs(depth)}])`;

    }

    literal(pattern: Pattern): string {
        const name = pattern.name;
        const literal = pattern as Literal;
        return `new Literal("${name}", "${this._escapeString(literal.token)}")`;
    }

    not(pattern: Pattern, args: string[], depth: number): string {
        args = this._indent(args, depth + 1);

        const name = pattern.name;
        return `new Not("${name}", ${args.join("")})`;
    }

    optional(pattern: Pattern, args: string[], depth: number): string {
        args = this._indent(args, depth + 1);
        const name = pattern.name;
        return `new Optional("${name}", ${args.join("")})`;
    }

    options(pattern: Pattern, args: string[], depth: number): string {
        args = this._indent(args, depth + 1);
        const name = pattern.name;
        return `new Options("${name}", [${args.join(", ")}${this._generateTabs(depth)}])`;
    }

    reference(pattern: Pattern): string {
        const name = pattern.name;
        return `new Reference("${name}")`;
    }

    regex(pattern: Pattern): string {
        const name = pattern.name;
        const regex = pattern as Regex;
        return `new Literal("${name}", "${this._escapeString(regex.regex)}")`;

    }

    infiniteRepeat(pattern: Pattern, depth: number): string {
        const name = pattern.name;
        const repeat = pattern as Repeat;
        this.generator.setDepth(depth);
        const repeatPattern = repeat.pattern;
        const options = repeat.options;
        const repeatPatternString = this.generator.generate(repeatPattern);
        let dividerString = "null";

        if (options.divider != null) {
            dividerString = this.generator.generate(options.divider);
        }

        return `new Repeat("${name}", ${this._generateTabs(depth + 1)}${repeatPatternString}, {min: ${repeat.min}, divider: ${dividerString}})`;
    }
    
    finiteRepeat(pattern: Pattern, depth: number): string {
        const name = pattern.name;
        const repeat = pattern as Repeat;
        this.generator.setDepth(depth);

        const repeatPattern = repeat.pattern;
        const options = repeat.options;
        const repeatPatternString = this.generator.generate(repeatPattern);
        let dividerString = "null";

        if (options.divider != null) {
            dividerString = this.generator.generate(options.divider);
        }
        return `new Repeat("${name}", ${this._generateTabs(depth + 1)}${repeatPatternString}, {min: ${repeat.min}, max: ${repeat.max} divider: ${dividerString}})`;
    }

    rightAssociated(_: Pattern, args: string[], depth: number) {
        args = this._indent(args, depth + 1);
        return `new RightAssociation(${args.join("")})`;
    }

    sequence(pattern: Pattern, args: string[], depth: number): string {
        args = this._indent(args, depth + 1);
        const name = pattern.name;
        return `new Sequence("${name}", [${args.join(", ")}${this._generateTabs(depth)}])`;
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