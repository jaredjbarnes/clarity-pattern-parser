import { Node } from "../../ast/Node";
import { tokens } from "../../grammar/decorators/tokens";
import { GrammarFile } from "../../grammar/Grammar";
import { generateErrorMessage } from "../../patterns/generate_error_message";
import { Pattern } from "../../patterns/Pattern";
import { grammar } from "./patterns/grammar"

let anonymousIndexId = 0;

function defaultImportResolver(_path: string, _basePath: string | null): Promise<GrammarFile> {
    throw new Error("No import resolver supplied.");
}

function defaultImportResolverSync(_path: string, _basePath: string | null): GrammarFile {
    throw new Error("No import resolver supplied.");
}

export type Decorator = (pattern: Pattern, arg?: string | boolean | number | null | Record<string, any> | any[]) => void;

const defaultDecorators = {
    tokens: tokens
};

export interface GrammarOptions {
    resolveImport?: (resource: string, originResource: string | null) => Promise<GrammarFile>;
    resolveImportSync?: (resource: string, originResource: string | null) => GrammarFile;
    originResource?: string | null;
    params?: Pattern[];
    decorators?: Record<string, Decorator>;
}

class ParseContext {
    patternsByName = new Map<string, Pattern>();
    importedPatternsByName = new Map<string, Pattern>();
    paramsByName = new Map<string, Pattern>();
    decorators: Record<string, Decorator>;

    constructor(params: Pattern[], decorators: Record<string, Decorator> = {}) {
        params.forEach(p => this.paramsByName.set(p.name, p));
        this.decorators = { ...decorators, ...defaultDecorators };
    }

    getImportedPatterns() {
        return Array.from(this.importedPatternsByName.values());
    }

    getParams() {
        return Array.from(this.paramsByName.values());
    }

}

export class Grammar {
    private _options: GrammarOptions;
    private _parseContext: ParseContext;
    private _resolveImportSync: (resource: string, originResource: string | null) => GrammarFile;

    constructor(options: GrammarOptions) {
        this._options = options;
        this._parseContext = new ParseContext(options.params || [], options.decorators || {});
        this._resolveImportSync = options.resolveImportSync == null ? defaultImportResolverSync : options.resolveImportSync;
    }

    // parse(cpat: string): Promise<Pattern> { }
    // import(path: string): Promise<Pattern> { }

    // parseString(cpat: string): Pattern {
    //     const ast = this._tryToParse(cpat);

    //     this._flattenExpressions(ast);

    // }

    private _resolveImportsSync(ast: Node) {
        const importStatements = ast.findAll(n => {
            return n.name === "importStatement" || n.name === "useParamsStatement";
        });

        for (const importStatement of importStatements) {
            if (importStatement.name === "importStatement") {
                this._processImportSync(importStatement);
            } else {
                this._processUseParams(importStatement);
            }
        }
    }

    private _processImportSync(importStatement: Node) {
        const parseContext = this._parseContext;
        const resourceNode = importStatement.find(n => n.name === "resource") as Node;
        const params = this._getWithParams(importStatement);
        const resource = resourceNode.value.slice(1, -1);
        const grammarFile = this._resolveImportSync(resource, this._options.originResource || null);


        if (resourceNode == null) {
            throw new Error("Invalid import statement: resource is required");
        }


    }

    private _getWithParams(importStatement: Node) {
        const withParamsStatements = importStatement.find(n => n.name === "withParamsStatements");

        if (withParamsStatements == null) {
            return [];
        }

        const expression = withParamsStatements.toString();
        const importedValues = this._parseContext.getImportedPatterns();

        const grammar = new Grammar({
            params: [...importedValues, ...this._parseContext.paramsByName.values()],
            originResource: this._options.originResource,
            resolveImport: this._options.resolveImport,
            decorators: this._parseContext.decorators
        });

        // const patterns = grammar.parseString(expression);
        // return Array.from(Object.values(patterns));
        return[]
    }


    private _processUseParams(useParamsStatement: Node) {
    }

    private _tryToParse(cpat: string): Node {
        const { ast, cursor } = grammar.exec(cpat, true);

        if (ast == null) {
            const message = generateErrorMessage(grammar, cursor);
            throw new Error(`[Invalid Grammar] ${message}`);
        }

        return ast;
    }


    private _flattenExpressions(node: Node) {
        switch (node.name) {
            case "sequenceExpr":
                return this._unwrapNode("sequenceExpr", node);
            case "optionsExpr":
                return this._unwrapNode("optionsExpr", node);
            case "greedyOptionsExpr":
                return this._unwrapNode("greedyOptionsExpr", node);
            default:
                return node;
        }
    }

    private _unwrapNode(type: string, node: Node) {
        if (node.name !== type) {
            return node;
        }

        for (let x = 0; x < node.children.length; x++) {
            const child = node.children[x];

            if (child.name === type) {
                node.spliceChildren(x, 1, ...child.children);
                x--;
            }
        }

        return node;
    }
}