import { Node } from "../ast/Node";
import { Literal } from "../patterns/Literal";
import { Pattern } from "../patterns/Pattern";
import { Regex } from "../patterns/Regex";
import { Reference } from "../patterns/Reference";
import { grammar } from "./patterns/grammar";
import { Or } from "../patterns/Or";
import { Not } from "../patterns/Not";
import { And } from "../patterns/And";
import { Repeat, RepeatOptions } from "../patterns/Repeat";

export interface GrammarOptions {

}

class ParseContext {
    patternsByName = new Map<string, Pattern>();
}

export class Grammar {
    private _options: GrammarOptions;
    private _parseContext: ParseContext;

    constructor(options: GrammarOptions = {}) {
        this._options = options;
        this._parseContext = new ParseContext();
    }

    parse(expression: string) {
        this._parseContext = new ParseContext();
        this._tryToParse(expression);

        return this._parseContext.patternsByName;
    }

    private _tryToParse(expression: string) {
        const { ast, cursor } = grammar.exec(expression);

        if (ast == null) {

            throw new Error("Invalid Grammar" + cursor.furthestError?.pattern.name);
        }

        this._cleanAst(ast);
        this._buildPatterns(ast);
    }

    private _cleanAst(ast: Node) {
        ast.findAll(
            n => n.name === "spaces" ||
                n.name === "optional-spaces" ||
                n.name === "new-line" ||
                n.name.includes("whitespace") ||
                n.name.includes("comment")
        ).forEach(n => n.remove());
    }

    private _buildPatterns(ast: Node) {
        ast.children.forEach((n) => {
            const typeNode = n.find(n => n.name.includes("literal"));
            const type = typeNode?.name || "unknown";

            switch (type) {
                case "literal": {
                    this._buildLiteral(n)
                    break;
                }
                case "regex-literal": {
                    this._buildRegex(n);
                    break;
                }
                case "or-literal": {
                    this._buildOr(n);
                    break;
                }
                case "and-literal": {
                    this._buildAnd(n)
                    break;
                }
                case "repeat-literal": {
                    this._buildRepeat(n)
                    break;
                }
                default: {
                    //Do nothing
                }
            }
        });
    }

    private _buildLiteral(statementNode: Node) {
        const nameNode = statementNode.find(n => n.name === "name") as Node;
        const literalNode = statementNode.find(n => n.name === "literal") as Node;
        const value = literalNode.value.slice(1, literalNode.value.length - 1);
        const name = nameNode.value;
        const literal = new Literal(name, value);

        this._parseContext.patternsByName.set(name, literal)
    }

    private _buildRegex(statementNode: Node) {
        const nameNode = statementNode.find(n => n.name === "name") as Node;
        const regexNode = statementNode.find(n => n.name === "regex-literal") as Node;
        const value = regexNode.value.slice(1, regexNode.value.length - 1);
        const name = nameNode.value;

        const regex = new Regex(name, value);

        this._parseContext.patternsByName.set(name, regex);
    }

    private _buildOr(statementNode: Node) {
        const nameNode = statementNode.find(n => n.name === "name") as Node;
        const orNode = statementNode.find(n => n.name === "or-literal") as Node;
        const patternNodes = orNode.children.filter(n => n.name == "pattern-name");

        const name = nameNode.value;
        const patterns = patternNodes.map(n => this._getPattern(n.value));
        const or = new Or(name, patterns);

        this._parseContext.patternsByName.set(name, or);
    }

    private _getPattern(name: string) {
        const pattern = this._parseContext.patternsByName.get(name);

        if (pattern == null) {
            return new Reference(name);
        }

        return pattern;
    }

    private _buildAnd(statementNode: Node) {
        const nameNode = statementNode.find(n => n.name === "name") as Node;
        const andNode = statementNode.find(n => n.name === "and-literal") as Node;
        const patternNodes = andNode.children.filter(n => n.name == "pattern");

        const name = nameNode.value;
        const patterns = patternNodes.map(n => {
            const nameNode = n.find(n => n.name === "pattern-name") as Node;
            const isNot = n.find(n => n.name === "not") != null;
            const isOptional = n.find(n => n.name === "is-optional") != null;
            const name = nameNode.value;
            const pattern = this._getPattern(name);

            if (isNot) {
                return new Not(`not-${name}`, pattern.clone(name, isOptional));
            }

            return pattern.clone(name, isOptional);
        });

        const and = new And(name, patterns);

        this._parseContext.patternsByName.set(name, and);
    }

    private _buildRepeat(statementNode: Node) {
        const nameNode = statementNode.find(n => n.name === "name") as Node;
        const repeatNode = statementNode.find(n => n.name === "repeat-literal") as Node;
        const patternNode = repeatNode.find(n => n.name == "pattern") as Node;
        const patternNameNode = patternNode.find(n => n.name === "pattern-name") as Node;
        const dividerNode = repeatNode.find(n => n.name === "divider-pattern");
        const bounds = repeatNode.find(n => n.name === "bounds");
        const exactCount = repeatNode.find(n => n.name === "exact-count");
        const quantifier = repeatNode.find(n => n.name === "quantifier-shorthand");
        const isPatternOptional = repeatNode.find(n => n.name === "is-optional") != null;
        const trimDivider = repeatNode.find(n => n.name === "trim-divider") != null;

        const name = nameNode.value;
        const pattern = this._getPattern(patternNameNode.value);

        const options: RepeatOptions = {
            min: 1,
            max: Infinity,
            trimDivider
        }

        if (dividerNode != null) {
            options.divider = this._getPattern(dividerNode.value);
        }

        if (bounds != null) {
            const minNode = bounds.find(p => p.name === "min");
            const maxNode = bounds.find(p => p.name === "max");

            const min = minNode == null ? 0 : Number(minNode.value);
            const max = maxNode == null ? Infinity : Number(maxNode.value);

            options.min = min;
            options.max = max;
        } else if (exactCount != null) {
            const integerNode = exactCount.find(p => p.name === "integer") as Node;
            const integer = Number(integerNode.value);

            options.min = integer;
            options.max = integer;
        } else if (quantifier != null) {
            const type = quantifier.value;
            if (type === "+") {
                options.min = 1;
                options.max = Infinity;
            } else {
                options.min = 0;
                options.max = Infinity;
            }
        }

        const repeat = new Repeat(name, pattern.clone(pattern.name, isPatternOptional), options);

        this._parseContext.patternsByName.set(name, repeat);
    }

    static parse(expression: string) {
        const grammar = new Grammar();
        return grammar.parse(expression);
    }

}