import { Node } from "../ast/Node";
import { Literal } from "../patterns/Literal";
import { Pattern } from "../patterns/Pattern";
import { Regex } from "../patterns/Regex";
import { Reference } from "../patterns/Reference";
import { grammar } from "./patterns/grammar";
import { Options } from "../patterns/Options";
import { Not } from "../patterns/Not";
import { Sequence } from "../patterns/Sequence";
import { Repeat, RepeatOptions } from "../patterns/Repeat";
import { AutoComplete } from "../intellisense/AutoComplete";
import { Optional } from "../patterns/Optional";

let anonymousIndexId = 0;

const patternNodes: Record<string, boolean> = {
    "literal": true,
    "regex-literal": true,
    "options-literal": true,
    "sequence-literal": true,
    "repeat-literal": true,
    "alias-literal": true,
    "configurable-anonymous-pattern": true
};

class ParseContext {
    constructor(params: Pattern[]) {
        params.forEach(p => this.paramsByName.set(p.name, p));
    }
    patternsByName = new Map<string, Pattern>();
    importedPatternsByName = new Map<string, Pattern>();
    paramsByName = new Map<string, Pattern>();
}

function defaultImportResolver(_path: string, _basePath: string | null): Promise<GrammarFile> {
    throw new Error("No import resolver supplied.");
}

export interface GrammarFile {
    resource: string;
    expression: string;
}

export interface GrammarOptions {
    resolveImport?: (resource: string, originResource: string | null) => Promise<GrammarFile>;
    originResource?: string | null;
    params?: Pattern[];
}

export class Grammar {
    private _params: Pattern[];
    private _originResource?: string | null;
    private _resolveImport: (resource: string, originResource: string | null) => Promise<GrammarFile>;
    private _parseContext: ParseContext;
    private _autoComplete: AutoComplete;

    constructor(options: GrammarOptions = {}) {
        this._params = options?.params == null ? [] : options.params;
        this._originResource = options?.originResource == null ? null : options.originResource;
        this._resolveImport = options.resolveImport == null ? defaultImportResolver : options.resolveImport;
        this._parseContext = new ParseContext(this._params);
        this._autoComplete = new AutoComplete(grammar, {
            greedyPatternNames: ["spaces", "optional-spaces", "whitespace", "new-line"],
            customTokens: {
                "regex-literal": ["[Regular Expression]"],
                "literal": ["[String]"],
                "name": ["[Pattern Name]"],
                "pattern-name": ["[Pattern Name]"]
            }
        });
    }

    async import(path: string) {
        const grammarFile = await this._resolveImport(path, null);
        const grammar = new Grammar({
            resolveImport: this._resolveImport,
            originResource: grammarFile.resource,
            params: this._params
        });

        return grammar.parse(grammarFile.expression);
    }

    async parse(expression: string) {
        this._parseContext = new ParseContext(this._params);
        const ast = this._tryToParse(expression);

        await this._resolveImports(ast);
        this._buildPatterns(ast);

        return Object.fromEntries(this._parseContext.patternsByName) as Record<string, Pattern>;
    }

    parseString(expression: string) {
        this._parseContext = new ParseContext(this._params);
        const ast = this._tryToParse(expression);

        if (this._hasImports(ast)) {
            throw new Error("Cannot use imports on parseString, use parse instead.");
        }
        this._buildPatterns(ast);
        return Object.fromEntries(this._parseContext.patternsByName) as Record<string, Pattern>;
    }

    private _tryToParse(expression: string): Node {
        const { ast, cursor, options, isComplete } = this._autoComplete.suggestFor(expression);

        if (!isComplete) {
            const text = cursor?.text || "";
            const index = options.reduce((num, o) => Math.max(o.startIndex, num), 0);
            const foundText = text.slice(Math.max(index - 10, 0), index + 10);
            const expectedTexts = "'" + options.map(o => {
                const startText = text.slice(Math.max(o.startIndex - 10), o.startIndex);
                return startText + o.text;
            }).join("' or '") + "'";
            const message = `[Parse Error] Found: '${foundText}', expected: ${expectedTexts}.`;
            throw new Error(message);
        }

        // If it is complete it will always have a node. So we have to cast it.
        return ast as Node;
    }

    private _hasImports(ast: Node) {
        const importBlock = ast.find(n => n.name === "import-block");
        if (importBlock == null) {
            return false;
        }

        return importBlock && importBlock.children.length > 0;
    }

    private _buildPatterns(ast: Node) {
        const body = ast.find(n => n.name === "body");

        if (body == null) {
            return;
        }

        body.findAll(n => n.name === "assign-statement").forEach((n) => {
            const patternNode = n.children.find(n => patternNodes[n.name] != null);

            if (patternNode == null) {
                return;
            }

            switch (patternNode.name) {
                case "literal": {
                    this._saveLiteral(n);
                    break;
                }
                case "regex-literal": {
                    this._saveRegex(n);
                    break;
                }
                case "options-literal": {
                    this._saveOptions(n);
                    break;
                }
                case "sequence-literal": {
                    this._saveSequence(n);
                    break;
                }
                case "repeat-literal": {
                    this._saveRepeat(n);
                    break;
                }
                case "alias-literal": {
                    this._saveAlias(n);
                    break;
                }
                case "configurable-anonymous-pattern": {
                    this._saveConfigurableAnonymous(n);
                    break;
                }
                default: {
                    break;
                }
            }
        });

        body.findAll(n => n.name === "export-name").forEach((n) => {
            const pattern = this._getPattern(n.value).clone();
            this._parseContext.patternsByName.set(n.value, pattern);
        });
    }

    private _saveLiteral(statementNode: Node) {
        const nameNode = statementNode.find(n => n.name === "name") as Node;
        const literalNode = statementNode.find(n => n.name === "literal") as Node;
        const name = nameNode.value;
        const literal = this._buildLiteral(name, literalNode);

        this._parseContext.patternsByName.set(name, literal);
    }

    private _buildLiteral(name: string, node: Node) {
        return new Literal(name, this._resolveStringValue(node.value));
    }

    private _resolveStringValue(value: string) {
        return value.replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\b/g, '\b')
            .replace(/\\f/g, '\f')
            .replace(/\\v/g, '\v')
            .replace(/\\0/g, '\0')
            .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/\\u([0-9A-Fa-f]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/\\(.)/g, '$1').slice(1, -1);
    }

    private _saveRegex(statementNode: Node) {
        const nameNode = statementNode.find(n => n.name === "name") as Node;
        const regexNode = statementNode.find(n => n.name === "regex-literal") as Node;
        const name = nameNode.value;
        const regex = this._buildRegex(name, regexNode);

        this._parseContext.patternsByName.set(name, regex);
    }

    private _buildRegex(name: string, node: Node) {
        const value = node.value.slice(1, node.value.length - 1);
        return new Regex(name, value);
    }

    private _saveOptions(statementNode: Node) {
        const nameNode = statementNode.find(n => n.name === "name") as Node;
        const name = nameNode.value;
        const optionsNode = statementNode.find(n => n.name === "options-literal") as Node;
        const options = this._buildOptions(name, optionsNode);

        this._parseContext.patternsByName.set(name, options);
    }

    private _buildOptions(name: string, node: Node) {
        const patternNodes = node.children.filter(n => n.name !== "default-divider" && n.name !== "greedy-divider");
        const isGreedy = node.find(n => n.name === "greedy-divider") != null;
        const patterns = patternNodes.map(n => this._buildPattern(n));
        const or = new Options(name, patterns, isGreedy);

        return or;
    }

    private _buildPattern(node: Node): Pattern {
        const type = node.name;
        const name = `anonymous-pattern-${anonymousIndexId++}`;

        switch (type) {
            case "pattern-name": {
                return this._getPattern(node.value).clone();
            }
            case "literal": {
                return this._buildLiteral(node.value.slice(1, -1), node);
            }
            case "regex-literal": {
                return this._buildRegex(node.value.slice(1, -1), node);
            }
            case "repeat-literal": {
                return this._buildRepeat(name, node);
            }
            case "options-literal": {
                return this._buildOptions(name, node);
            }
            case "sequence-literal": {
                return this._buildSequence(name, node);
            }
            case "complex-anonymous-pattern": {
                return this._buildComplexAnonymousPattern(node);
            }
        }

        throw new Error(`Couldn't build node: ${node.name}.`);
    }

    private _saveSequence(statementNode: Node) {
        const nameNode = statementNode.find(n => n.name === "name") as Node;
        const name = nameNode.value;
        const sequenceNode = statementNode.find(n => n.name === "sequence-literal") as Node;
        const sequence = this._buildSequence(name, sequenceNode);

        this._parseContext.patternsByName.set(name, sequence);
    }

    private _buildSequence(name: string, node: Node) {
        const patternNodes = node.children.filter(n => n.name !== "and-divider");

        const patterns = patternNodes.map(n => {
            const patternNode = n.children[0].name === "not" ? n.children[1] : n.children[0];
            const isNot = n.find(n => n.name === "not") != null;
            const isOptional = n.find(n => n.name === "is-optional");
            const pattern = this._buildPattern(patternNode);
            const finalPattern = isOptional ? new Optional(pattern.name, pattern) : pattern;

            if (isNot) {
                return new Not(`not-${finalPattern.name}`, finalPattern);
            }

            return finalPattern;
        });

        return new Sequence(name, patterns);
    }

    private _saveRepeat(statementNode: Node) {
        const nameNode = statementNode.find(n => n.name === "name") as Node;
        const name = nameNode.value;
        const repeatNode = statementNode.find(n => n.name === "repeat-literal") as Node;
        const repeat = this._buildRepeat(name, repeatNode);

        this._parseContext.patternsByName.set(name, repeat);
    }

    private _buildRepeat(name: string, repeatNode: Node) {
        let isOptional = false;
        const bounds = repeatNode.find(n => n.name === "bounds");
        const exactCount = repeatNode.find(n => n.name === "exact-count");
        const quantifier = repeatNode.find(n => n.name === "quantifier-shorthand");
        const trimDivider = repeatNode.find(n => n.name === "trim-flag") != null;
        const patterNode = repeatNode.children[1].type === "spaces" ? repeatNode.children[2] : repeatNode.children[1];
        const pattern = this._buildPattern(patterNode);
        const dividerSectionNode = repeatNode.find(n => n.name === "divider-section");

        const options: RepeatOptions = {
            min: 1,
            max: Infinity
        };

        if (trimDivider) {
            options.trimDivider = trimDivider;
        }

        if (dividerSectionNode != null) {
            const dividerNode = dividerSectionNode.children[1];
            options.divider = this._buildPattern(dividerNode);
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
                isOptional = true;
            }
        }

        return isOptional ? new Optional(name, new Repeat(name, pattern, options)) : new Repeat(name, pattern, options);
    }

    private _saveConfigurableAnonymous(node: Node) {
        const nameNode = node.find(n => n.name === "name") as Node;
        const name = nameNode.value;
        const anonymousNode = node.find(n => n.name === "complex-anonymous-pattern") as Node;
        const isOptional = node.children[1] != null;

        const anonymous = isOptional ? new Optional(name, this._buildPattern(anonymousNode)) : this._buildPattern(anonymousNode);
        this._parseContext.patternsByName.set(name, anonymous);
    }

    private _buildComplexAnonymousPattern(node: Node) {
        const wrappedNode = node.children[1].name === "line-spaces" ? node.children[2] : node.children[1];
        return this._buildPattern(wrappedNode);
    }

    private async _resolveImports(ast: Node) {
        const parseContext = this._parseContext;
        const importStatements = ast.findAll(n => n.name === "import-from");

        for (const importStatement of importStatements) {
            const resourceNode = importStatement.find(n => n.name === "resource") as Node;
            const params = this._getParams(importStatement);
            const resource = resourceNode.value.slice(1, -1);
            const grammarFile = await this._resolveImport(resource, this._originResource || null);
            const grammar = new Grammar({
                resolveImport: this._resolveImport,
                originResource: grammarFile.resource,
                params
            });

            try {
                const patterns = await grammar.parse(grammarFile.expression);
                const importStatements = importStatement.findAll(n => n.name === "import-name" || n.name === "import-alias");

                importStatements.forEach((node) => {
                    if (node.name === "import-name" && node.parent?.name === "import-alias") {
                        return;
                    }

                    if (node.name === "import-name" && node.parent?.name !== "import-alias") {
                        const importName = node.value;

                        if (parseContext.importedPatternsByName.has(importName)) {
                            throw new Error(`'${importName}' was already used within another import.`);
                        }

                        const pattern = patterns[importName];
                        if (pattern == null) {
                            throw new Error(`Couldn't find pattern with name: ${importName}, from import: ${resource}.`);
                        }

                        parseContext.importedPatternsByName.set(importName, pattern);
                    } else {
                        const importNameNode = node.find(n => n.name === "import-name") as Node;
                        const importName = importNameNode.value;
                        const aliasNode = node.find(n => n.name === "import-name-alias") as Node;
                        const alias = aliasNode.value;

                        if (parseContext.importedPatternsByName.has(alias)) {
                            throw new Error(`'${alias}' was already used within another import.`);
                        }

                        const pattern = patterns[importName];
                        if (pattern == null) {
                            throw new Error(`Couldn't find pattern with name: ${importName}, from import: ${resource}.`);
                        }

                        parseContext.importedPatternsByName.set(alias, pattern.clone(alias));
                    }
                });



            } catch (e: any) {
                throw new Error(`Failed loading expression from: "${resource}". Error details: "${e.message}"`);
            }

        }
    }

    private _getParams(importStatement: Node) {
        let params: Pattern[] = [];
        const paramsStatement = importStatement.find(n => n.name === "with-params-statement");

        if (paramsStatement != null) {
            const statements = paramsStatement.find(n => n.name === "with-params-body");

            if (statements != null) {
                const expression = statements.toString();
                const importedValues = Array.from(this
                    ._parseContext
                    .importedPatternsByName
                    .values()
                );

                const grammar = new Grammar({
                    params: importedValues,
                    originResource: this._originResource,
                    resolveImport: this._resolveImport
                });

                const patterns = grammar.parseString(expression);
                params = Array.from(Object.values(patterns));
            }
        }

        return params;
    }

    private _getPattern(name: string) {
        let pattern = this._parseContext.patternsByName.get(name);

        if (pattern == null) {
            pattern = this._parseContext.importedPatternsByName.get(name);
        }

        if (pattern == null) {
            pattern = this._parseContext.paramsByName.get(name);
        }

        if (pattern == null) {
            return new Reference(name);
        }

        return pattern;
    }

    private _saveAlias(statementNode: Node) {
        const nameNode = statementNode.find(n => n.name === "name") as Node;
        const aliasNode = statementNode.find(n => n.name === "alias-literal") as Node;
        const aliasName = aliasNode.value;
        const name = nameNode.value;
        const alias = this._getPattern(aliasName).clone(name);

        this._parseContext.patternsByName.set(name, alias);
    }

    static parse(expression: string, options?: GrammarOptions) {
        const grammar = new Grammar(options);
        return grammar.parse(expression);
    }

    static import(path: string, options?: GrammarOptions) {
        const grammar = new Grammar(options);
        return grammar.import(path);
    }

    static parseString(expression: string, options?: GrammarOptions) {
        const grammar = new Grammar(options);
        return grammar.parseString(expression);
    }

}