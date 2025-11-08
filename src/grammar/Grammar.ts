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
import { Optional } from "../patterns/Optional";
import { Context } from "../patterns/Context";
import { Expression } from "../patterns/Expression";
import { TakeUntil } from "../patterns/TakeUntil";
import { RightAssociated } from "../patterns/RightAssociated";
import { generateErrorMessage } from "../patterns/generate_error_message";
import { tokens } from "./decorators/tokens";

let anonymousIndexId = 0;

export type Decorator = (pattern: Pattern, arg?: string | boolean | number | null | Record<string, any> | any[]) => void;

const defaultDecorators = {
    tokens: tokens
};

const patternNodes: Record<string, boolean> = {
    "literal": true,
    "regex-literal": true,
    "options-literal": true,
    "sequence-literal": true,
    "repeat-literal": true,
    "alias-literal": true,
    "take-until-literal": true,
    "configurable-anonymous-pattern": true
};

class ParseContext {
    patternsByName = new Map<string, Pattern>();
    importedPatternsByName = new Map<string, Pattern>();
    paramsByName = new Map<string, Pattern>();
    decorators: Record<string, Decorator>;
    constructor(params: Pattern[], decorators: Record<string, Decorator> = {}) {
        params.forEach(p => this.paramsByName.set(p.name, p));
        this.decorators = { ...decorators, ...defaultDecorators };
    }
}

function defaultImportResolver(_path: string, _basePath: string | null): Promise<GrammarFile> {
    throw new Error("No import resolver supplied.");
}

function defaultImportResolverSync(_path: string, _basePath: string | null): GrammarFile {
    throw new Error("No import resolver supplied.");
}

export interface GrammarFile {
    resource: string;
    expression: string;
}

export interface GrammarOptions {
    resolveImport?: (resource: string, originResource: string | null) => Promise<GrammarFile>;
    resolveImportSync?: (resource: string, originResource: string | null) => GrammarFile;
    originResource?: string | null;
    params?: Pattern[];
    decorators?: Record<string, Decorator>;
}

export class Grammar {
    private _params: Pattern[];
    private _originResource?: string | null;
    private _resolveImport: (resource: string, originResource: string | null) => Promise<GrammarFile>;
    private _resolveImportSync: (resource: string, originResource: string | null) => GrammarFile;
    private _parseContext: ParseContext;

    constructor(options: GrammarOptions = {}) {
        this._params = options?.params == null ? [] : options.params;
        this._originResource = options?.originResource == null ? null : options.originResource;
        this._resolveImport = options.resolveImport == null ? defaultImportResolver : options.resolveImport;
        this._resolveImportSync = options.resolveImportSync == null ? defaultImportResolverSync : options.resolveImportSync;
        this._parseContext = new ParseContext(this._params, options.decorators || {});
    }

    async import(path: string) {
        const grammarFile = await this._resolveImport(path, null);
        const grammar = new Grammar({
            resolveImport: this._resolveImport,
            originResource: grammarFile.resource,
            params: this._params,
            decorators: this._parseContext.decorators
        });

        return grammar.parse(grammarFile.expression);
    }

    async parse(expression: string) {
        this._parseContext = new ParseContext(this._params, this._parseContext.decorators);
        const ast = this._tryToParse(expression);

        await this._resolveImports(ast);
        this._buildPatterns(ast);

        return this._buildPatternRecord();
    }

    parseString(expression: string) {
        this._parseContext = new ParseContext(this._params, this._parseContext.decorators);
        const ast = this._tryToParse(expression);

        this._resolveImportsSync(ast);
        this._buildPatterns(ast);

        return this._buildPatternRecord();
    }

    private _buildPatternRecord() {
        const patterns: Record<string, Pattern> = {};
        const allPatterns = Array.from(this._parseContext.patternsByName.values());

        allPatterns.forEach(p => {
            patterns[p.name] = new Context(p.name, p, allPatterns.filter(o => o !== p));
        });

        return patterns;
    }

    private _tryToParse(expression: string): Node {
        const { ast, cursor } = grammar.exec(expression, true);

        if (ast == null) {
            const message = generateErrorMessage(grammar, cursor);
            throw new Error(`[Invalid Grammar] ${message}`);
        }

        return ast;
    }

    private _hasImports(ast: Node) {
        const importBlock = ast.find(n => n.name === "import-block");
        if (importBlock == null) {
            return false;
        }

        return importBlock && importBlock.children.length > 0;
    }

    private _buildPatterns(ast: Node) {
        const body = ast.find(n => n.name === "body" && n.findAncestor(n => n.name === "head") == null);

        if (body == null) {
            return;
        }

        const statements = body.findAll(n => n.name === "assign-statement");

        statements.forEach((n) => {
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
                case "take-until-literal": {
                    this._saveTakeUntil(n);
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

        this._applyDecorators(statementNode, literal);
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

        this._applyDecorators(statementNode, regex);
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

        this._applyDecorators(statementNode, options);
        this._parseContext.patternsByName.set(name, options);
    }

    private _buildOptions(name: string, node: Node) {
        const patternNodes = node.children.filter(n => n.name !== "default-divider" && n.name !== "greedy-divider");
        const isGreedy = node.find(n => n.name === "greedy-divider") != null;
        const patterns = patternNodes.map(n => {
            const rightAssociated = n.find(n => n.name === "right-associated");
            if (rightAssociated != null) {
                return new RightAssociated(this._buildPattern(n.children[0]));
            } else {
                return this._buildPattern(n.children[0]);
            }

        });

        const hasRecursivePattern = patterns.some(p => this._isRecursive(name, p));
        if (hasRecursivePattern && !isGreedy) {
            try {
                const expression = new Expression(name, patterns);
                return expression;
            } catch { }
        }

        const options = new Options(name, patterns, isGreedy);
        return options;
    }

    private _isRecursive(name: string, pattern: Pattern) {
        if (pattern.type === "right-associated") {
            pattern = pattern.children[0];
        }

        return this._isRecursivePattern(name, pattern);
    }

    private _isRecursivePattern(name: string, pattern: Pattern) {
        // Because we don't know if the pattern is a sequence with a reference we have to just assume it is.
        // The better solution here would be to not have options at all and just use expresssion pattern instead.
        if (pattern.type === "reference") {
            return true;
        }

        if (pattern.children.length === 0) {
            return false;
        }

        const firstChild = pattern.children[0];
        const lastChild = pattern.children[pattern.children.length - 1];
        const isLongEnough = pattern.children.length >= 2;

        return pattern.type === "sequence" && isLongEnough &&
            (firstChild.name === name ||
                lastChild.name === name);
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
            case "take-until-literal": {
                return this._buildTakeUntil(name, node);
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

        this._applyDecorators(statementNode, sequence);
        this._parseContext.patternsByName.set(name, sequence);
    }

    private _buildSequence(name: string, node: Node) {
        const patternNodes = node.children.filter(n => n.name !== "sequence-divider");

        const patterns = patternNodes.map(n => {
            const patternNode = n.children[0].name === "not" ? n.children[1] : n.children[0];
            const isNot = n.find(n => n.name === "not") != null;
            const isOptional = n.find(n => n.name === "is-optional");
            const pattern = this._buildPattern(patternNode);
            const finalPattern = isOptional ? new Optional(`optional-${pattern.name}`, pattern) : pattern;

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

        this._applyDecorators(statementNode, repeat);
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
        const dividerSectionNode = repeatNode.find(n => n.name === "repeat-divider-section");

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

        return isOptional ? new Optional(name, new Repeat(`inner-optional-${name}`, pattern, options)) : new Repeat(name, pattern, options);
    }

    private _saveTakeUntil(statementNode: Node) {
        const nameNode = statementNode.find(n => n.name === "name") as Node;
        const name = nameNode.value;
        const takeUntilNode = statementNode.find(n => n.name === "take-until-literal") as Node;
        const takeUntil = this._buildTakeUntil(name, takeUntilNode);

        this._applyDecorators(statementNode, takeUntil);
        this._parseContext.patternsByName.set(name, takeUntil);
    }


    private _buildTakeUntil(name: string, takeUntilNode: Node) {
        const patternNode = takeUntilNode.children[takeUntilNode.children.length - 1];
        const untilPattern = this._buildPattern(patternNode);

        return new TakeUntil(name, untilPattern);
    }

    private _saveConfigurableAnonymous(node: Node) {
        const nameNode = node.find(n => n.name === "name") as Node;
        const name = nameNode.value;
        const anonymousNode = node.find(n => n.name === "configurable-anonymous-pattern") as Node;
        const isOptional = node.children[1] != null;

        const anonymous = isOptional ? new Optional(name, this._buildPattern(anonymousNode.children[0])) : this._buildPattern(anonymousNode.children[0]);

        this._applyDecorators(node, anonymous);
        this._parseContext.patternsByName.set(name, anonymous);
    }

    private _buildComplexAnonymousPattern(node: Node) {
        const wrappedNode = node.children[1].name === "line-spaces" ? node.children[2] : node.children[1];
        return this._buildPattern(wrappedNode);
    }

    private async _resolveImports(ast: Node) {
        const importStatements = ast.findAll(n => {
            return n.name === "import-from" || n.name === "param-name-with-default-value";
        });

        for (const statement of importStatements) {
            if (statement.name === "import-from") {
                await this._processImport(statement);
            } else {
                this._processUseParams(statement);
            }
        }
    }

    private _resolveImportsSync(ast: Node) {
        const importStatements = ast.findAll(n => {
            return n.name === "import-from" || n.name === "param-name-with-default-value";
        });

        for (const statement of importStatements) {
            if (statement.name === "import-from") {
                this._processImportSync(statement);
            } else {
                this._processUseParams(statement);
            }
        }
    }

    private _processImportSync(importStatement: Node) {
        const parseContext = this._parseContext;
        const resourceNode = importStatement.find(n => n.name === "resource") as Node;
        const params = this._getParams(importStatement);
        const resource = resourceNode.value.slice(1, -1);
        const grammarFile = this._resolveImportSync(resource, this._originResource || null);
        const grammar = new Grammar({
            resolveImport: this._resolveImport,
            resolveImportSync: this._resolveImportSync,
            originResource: grammarFile.resource,
            params,
            decorators: this._parseContext.decorators
        });

        try {
            const patterns = grammar.parseString(grammarFile.expression);
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

    private async _processImport(importStatement: Node) {
        const parseContext = this._parseContext;
        const resourceNode = importStatement.find(n => n.name === "resource") as Node;
        const params = this._getParams(importStatement);
        const resource = resourceNode.value.slice(1, -1);
        const grammarFile = await this._resolveImport(resource, this._originResource || null);
        const grammar = new Grammar({
            resolveImport: this._resolveImport,
            originResource: grammarFile.resource,
            params,
            decorators: this._parseContext.decorators
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

    private _processUseParams(paramName: Node) {
        const defaultValueNode = paramName.find(n => n.name === "param-default");
        if (defaultValueNode === null) {
            return;
        }

        const nameNode = paramName.find(n => n.name === "param-name");
        const defaultNameNode = defaultValueNode.find(n => n.name === "default-param-name");

        if (nameNode == null || defaultNameNode == null) {
            return;
        }

        const name = nameNode.value;
        const defaultName = defaultNameNode.value;

        if (this._parseContext.paramsByName.has(name)) {
            return;
        }

        let pattern = this._parseContext.importedPatternsByName.get(defaultName);

        if (pattern == null) {
            pattern = new Reference(defaultName);
        }

        this._parseContext.importedPatternsByName.set(name, pattern);
    }

    private _applyDecorators(statementNode: Node, pattern: Pattern) {
        const decorators = this._parseContext.decorators;
        const bodyLine = statementNode.parent;

        if (bodyLine == null) {
            return;
        }

        let prevSibling = bodyLine.previousSibling();
        let decoratorNodes: Node[] = [];

        while (prevSibling != null) {
            if (prevSibling.find(n => n.name === "assign-statement")) {
                break;
            }
            decoratorNodes.push(prevSibling);
            prevSibling = prevSibling.previousSibling();
        }

        decoratorNodes = decoratorNodes.filter(n => n.find(n => n.name.includes("decorator")) != null);

        decoratorNodes.forEach((d) => {
            const nameNode = d.find(n => n.name === "decorator-name");

            if (nameNode == null || decorators[nameNode.value] == null) {
                return;
            }

            const nameDocorator = d.find(n => n.name === "name-decorator");

            if (nameDocorator != null) {
                decorators[nameNode.value](pattern);
                return;
            }

            const methodDecorator = d.find(n => n.name === "method-decorator");

            if (methodDecorator == null) {
                return;
            }

            methodDecorator.findAll(n => n.name.includes("space")).forEach(n => n.remove());
            const argsNode = methodDecorator.children[3];

            if (argsNode == null || argsNode.name === "close-paren") {
                decorators[nameNode.value](pattern);
            } else {
                decorators[nameNode.value](pattern, JSON.parse(argsNode.value));
            }
        });

    }

    private _getParams(importStatement: Node) {
        let params: Pattern[] = [];
        const paramsStatement = importStatement.find(n => n.name === "with-params-statement");

        if (paramsStatement != null) {
            const statements = paramsStatement.find(n => n.name === "body");

            if (statements != null) {
                const expression = statements.toString();
                const importedValues = Array.from(this
                    ._parseContext
                    .importedPatternsByName
                    .values()
                );

                const grammar = new Grammar({
                    params: [...importedValues, ...this._parseContext.paramsByName.values()],
                    originResource: this._originResource,
                    resolveImport: this._resolveImport,
                    decorators: this._parseContext.decorators
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
        const aliasPattern = this._getPattern(aliasName);

        // This solves the problem for an alias pointing to a reference.
        if (aliasPattern.type === "reference") {
            const reference = aliasPattern.clone(name);
            this._applyDecorators(statementNode, reference);
            this._parseContext.patternsByName.set(name, reference);
        } else {
            const alias = aliasPattern.clone(name);
            this._applyDecorators(statementNode, alias);
            this._parseContext.patternsByName.set(name, alias);
        }

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