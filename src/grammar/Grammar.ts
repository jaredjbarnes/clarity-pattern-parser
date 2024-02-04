import { Node } from "../ast/Node";
import { Literal } from "../patterns/Literal";
import { Pattern } from "../patterns/Pattern";
import { grammar } from "./patterns/grammar";

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

    parse(content: string) {
        this._parseContext = new ParseContext();
        this._tryToParse(content);

        return this._parseContext.patternsByName;
    }

    private _tryToParse(content: string) {
        const { ast, cursor } = grammar.exec(content);

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

    private _buildRegex(statementNode: Node) { }

    private _buildOr(statementNode: Node) { }

    private _buildAnd(statementNode: Node) { }

    private _buildRepeat(statementNode: Node) { }
}