import { Node } from "../ast/Node";
import { tokens } from "./decorators/tokens";
import { generateErrorMessage } from "../patterns/generate_error_message";

export interface GrammarFile {
    resource: string;
    expression: string;
}
import { Context } from "../patterns/Context";
import { Expression } from "../patterns/Expression";
import { Literal } from "../patterns/Literal";
import { Not } from "../patterns/Not";
import { Optional } from "../patterns/Optional";
import { Options } from "../patterns/Options";
import { Pattern } from "../patterns/Pattern";
import { Reference } from "../patterns/Reference";
import { Regex } from "../patterns/Regex";
import { Repeat, RepeatOptions } from "../patterns/Repeat";
import { RightAssociated } from "../patterns/RightAssociated";
import { Sequence } from "../patterns/Sequence";
import { Block } from "../patterns/Block";
import { TakeUntil } from "../patterns/TakeUntil";
import { grammar } from "./patterns/grammar"

let anonymousIndexId = 0;

function defaultImportResolver(_path: string, _basePath: string | null): Promise<GrammarFile> {
    throw new Error("No import resolver supplied.");
}

function defaultImportResolverSync(_path: string, _basePath: string | null): GrammarFile {
    throw new Error("No import resolver supplied.");
}

export type Decorator = (pattern: Pattern, arg?: string | boolean | number | null | Record<string, any> | any[]) => void;

const defaultDecorators: Record<string, Decorator> = {
    tokens: tokens
};

// Node names that are operators/whitespace and should be filtered during building
const skipNodes: Record<string, boolean> = {
    "+": true,
    "|": true,
    "<|>": true,
    "optionalWS": true,
    "optionalLS": true,
    "ws": true,
    "ls": true,
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
    private _params: Pattern[];
    private _originResource?: string | null;
    private _resolveImport: (resource: string, originResource: string | null) => Promise<GrammarFile>;
    private _resolveImportSync: (resource: string, originResource: string | null) => GrammarFile;

    constructor(options: GrammarOptions = {}) {
        this._options = options;
        this._params = options.params || [];
        this._originResource = options.originResource || null;
        this._parseContext = new ParseContext(this._params, options.decorators || {});
        this._resolveImport = options.resolveImport == null ? defaultImportResolver : options.resolveImport;
        this._resolveImportSync = options.resolveImportSync == null ? defaultImportResolverSync : options.resolveImportSync;
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

    // --- Static convenience methods ---

    static parse(expression: string, options?: GrammarOptions) {
        const g = new Grammar(options);
        return g.parse(expression);
    }

    static import(path: string, options?: GrammarOptions) {
        const g = new Grammar(options);
        return g.import(path);
    }

    static parseString(expression: string, options?: GrammarOptions) {
        const g = new Grammar(options);
        return g.parseString(expression);
    }

    // --- Parsing ---

    private _tryToParse(cpat: string): Node {
        const { ast, cursor } = grammar.exec(cpat, true);

        if (ast == null) {
            const message = generateErrorMessage(grammar, cursor);
            throw new Error(`[Invalid Grammar] ${message}`);
        }

        return ast;
    }

    // --- Expression Flattening (Phase 2) ---

    private _flattenExpressionsRecursive(node: Node) {
        // Process children first (bottom-up)
        for (const child of node.children) {
            this._flattenExpressionsRecursive(child);
        }

        switch (node.name) {
            case "sequenceExpr":
            case "optionsExpr":
            case "greedyOptionsExpr":
                this._unwrapNode(node.name, node);
                break;
        }
    }

    private _unwrapNode(type: string, node: Node) {
        for (let x = 0; x < node.children.length; x++) {
            const child = node.children[x];

            if (child.name === type) {
                node.spliceChildren(x, 1, ...child.children);
                x--;
            }
        }
    }

    // --- Pattern Record ---

    private _buildPatternRecord() {
        const patterns: Record<string, Pattern> = {};
        const allPatterns = Array.from(this._parseContext.patternsByName.values());

        this._parseContext.patternsByName.forEach((p, name) => {
            patterns[name] = new Context(name, p, allPatterns.filter(o => o !== p));
        });

        return patterns;
    }

    // --- Pattern Building (Phase 3) ---

    private _buildPatterns(ast: Node) {
        const statementsNode = ast.find(n => n.name === "statements");

        if (statementsNode == null) {
            return;
        }

        const allStatements = statementsNode.children;

        // First pass: build pattern assignments
        for (let i = 0; i < allStatements.length; i++) {
            const statementNode = allStatements[i];

            if (statementNode.name === "patternAssignment") {
                const nameNode = statementNode.find(n => n.name === "patternName") as Node;
                const name = nameNode.value;

                // Find the pattern expression (the RHS of the assignment)
                const patternExprNode = statementNode.children.find(n =>
                    n.name !== "patternName" && !skipNodes[n.name] && n.name !== "assign"
                );

                if (patternExprNode == null) {
                    continue;
                }

                // Flatten nested binary expressions
                this._flattenExpressionsRecursive(patternExprNode);

                let pattern = this._buildPattern(name, patternExprNode);

                // For alias assignments (RHS is just a patternIdentifier), rename to the assignment name
                if (patternExprNode.name === "patternIdentifier" && pattern.name !== name) {
                    pattern = pattern.clone(name);
                }

                this._applyDecorators(i, allStatements, pattern);
                this._parseContext.patternsByName.set(name, pattern);
            } else if (statementNode.name === "exportPattern") {
                const exportName = statementNode.value;
                const pattern = this._getPattern(exportName).clone();
                this._parseContext.patternsByName.set(exportName, pattern);
            }
        }
    }

    private _buildPattern(name: string, node: Node): Pattern {
        switch (node.name) {
            case "literal": {
                // Use the literal's content as the name when in anonymous position
                const litName = name.startsWith("anonymous-pattern-") ? this._resolveStringValue(node.value) : name;
                return this._buildLiteral(litName, node);
            }
            case "regex": {
                // Use the regex's content as the name when in anonymous position
                const regName = name.startsWith("anonymous-pattern-") ? node.value.slice(1, -1) : name;
                return this._buildRegex(regName, node);
            }
            case "sequenceExpr":
                return this._buildSequence(name, node);
            case "optionsExpr":
                return this._buildOptions(name, node);
            case "greedyOptionsExpr":
                return this._buildGreedyOptions(name, node);
            case "repeatExpr":
                return this._buildRepeat(name, node);
            case "patternGroupExpr":
                return this._buildPatternGroup(name, node);
            case "notExpr":
                return this._buildNot(name, node);
            case "optionalExpr":
                return this._buildOptional(name, node);
            case "rightAssociationExpr":
                return this._buildRightAssociation(node);
            case "patternIdentifier": {
                // Use the pattern's own name for references (important for Expression recursion detection)
                // The caller (_buildPatterns) renames for alias assignments
                return this._getPattern(node.value).clone();
            }
            case "takeUntilExpr":
                return this._buildTakeUntil(name, node);
            case "blockDelimiter":
                throw new Error(`Block delimiter [${this._extractBlockDelimiterValue(node)}] must be used at both the start and end of a sequence. Example: ["{"] + content + ["}"]`);
        }

        throw new Error(`Couldn't build node: ${node.name}.`);
    }

    private _buildLiteral(name: string, node: Node) {
        return new Literal(name, this._resolveStringValue(node.value));
    }

    private _buildRegex(name: string, node: Node) {
        const value = node.value.slice(1, node.value.length - 1);
        return new Regex(name, value);
    }

    private _buildSequence(name: string, node: Node) {
        const patternChildren = node.children.filter(n => !skipNodes[n.name]);

        const first = patternChildren[0];
        const last = patternChildren[patternChildren.length - 1];

        if (first.name === "blockDelimiter" && last.name === "blockDelimiter" && patternChildren.length >= 2) {
            const openLiteral = new Literal("open", this._extractBlockDelimiterValue(first));
            const closeLiteral = new Literal("close", this._extractBlockDelimiterValue(last));

            const contentNodes = patternChildren.slice(1, -1);
            const contentPatterns = contentNodes.map(n =>
                this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, n)
            );

            return new Block(name, openLiteral, contentPatterns, closeLiteral);
        }

        const patterns = patternChildren.map(n => this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, n));
        return new Sequence(name, patterns);
    }

    private _extractBlockDelimiterValue(node: Node): string {
        const literalNode = node.children.find(n => n.name === "literal");
        if (literalNode == null) {
            throw new Error("Block delimiter missing literal value.");
        }
        return this._resolveStringValue(literalNode.value);
    }

    private _buildOptions(name: string, node: Node) {
        const patternChildren = node.children.filter(n => !skipNodes[n.name]);
        const patterns = patternChildren.map(n => {
            return this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, n);
        });

        const hasRecursivePattern = patterns.some(p => this._isRecursive(name, p));
        if (hasRecursivePattern) {
            try {
                return new Expression(name, patterns);
            } catch { }
        }

        return new Options(name, patterns);
    }

    private _buildGreedyOptions(name: string, node: Node) {
        const patternChildren = node.children.filter(n => !skipNodes[n.name]);
        const patterns = patternChildren.map(n => this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, n));
        return new Options(name, patterns, true);
    }

    private _buildRepeat(name: string, node: Node) {
        let isOptional = false;

        // Find the main pattern (first non-structural child inside parens)
        const patternNode = node.children.find(n =>
            !skipNodes[n.name] && n.name !== "(" && n.name !== ")" &&
            n.name !== "repeatOptions" && n.name !== "optionalDelimiter" &&
            n.name !== "delimiter" && n.name !== "oneOrMore" &&
            n.name !== "zeroOrMore" && n.name !== "repeatBounds"
        );

        if (patternNode == null) {
            throw new Error(`Repeat pattern missing inner pattern.`);
        }

        const pattern = this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, patternNode);

        const options: RepeatOptions = {
            min: 1,
            max: Infinity
        };

        // Handle delimiter
        const delimiterNode = node.find(n => n.name === "delimiter");
        if (delimiterNode != null) {
            const delimPatternNode = delimiterNode.children.find(n =>
                !skipNodes[n.name] && n.name !== "," && n.name !== "optionalTrim" && n.name !== "trim"
            );
            if (delimPatternNode != null) {
                options.divider = this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, delimPatternNode);
            }

            const trimFlag = delimiterNode.find(n => n.name === "trim");
            if (trimFlag != null) {
                options.trimDivider = true;
            }
        }

        // Handle quantifier / bounds
        const repeatOptionsNode = node.find(n => n.name === "oneOrMore" || n.name === "zeroOrMore" || n.name === "repeatBounds");

        if (repeatOptionsNode != null) {
            if (repeatOptionsNode.name === "oneOrMore") {
                options.min = 1;
                options.max = Infinity;
            } else if (repeatOptionsNode.name === "zeroOrMore") {
                isOptional = true;
                options.min = 0;
                options.max = Infinity;
            } else if (repeatOptionsNode.name === "repeatBounds") {
                const integers = repeatOptionsNode.findAll(n => n.name === "integer");
                const hasComma = repeatOptionsNode.find(n => n.name === ",") != null;

                if (integers.length === 2) {
                    // {min, max}
                    options.min = Number(integers[0].value);
                    options.max = Number(integers[1].value);
                } else if (integers.length === 1 && hasComma) {
                    // Check position to determine {min,} or {,max}
                    const commaNode = repeatOptionsNode.find(n => n.name === ",") as Node;
                    const intNode = integers[0];
                    if (intNode.startIndex < commaNode.startIndex) {
                        // {min,}
                        options.min = Number(intNode.value);
                        options.max = Infinity;
                    } else {
                        // {,max}
                        options.min = 0;
                        options.max = Number(intNode.value);
                    }
                } else if (integers.length === 1 && !hasComma) {
                    // {exact}
                    const count = Number(integers[0].value);
                    options.min = count;
                    options.max = count;
                }
            }
        }

        if (isOptional) {
            return new Optional(name, new Repeat(`inner-optional-${name}`, pattern, options));
        }

        return new Repeat(name, pattern, options);
    }

    private _buildPatternGroup(_name: string, node: Node) {
        const innerNode = node.children.find(n =>
            !skipNodes[n.name] && n.name !== "(" && n.name !== ")"
        );

        if (innerNode == null) {
            throw new Error("Empty pattern group.");
        }

        return this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, innerNode);
    }

    private _buildNot(_name: string, node: Node) {
        const innerNode = node.children.find(n => !skipNodes[n.name] && n.name !== "not");

        if (innerNode == null) {
            throw new Error("Not pattern missing inner pattern.");
        }

        const inner = this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, innerNode);
        return new Not(`not-${inner.name}`, inner);
    }

    private _buildOptional(_name: string, node: Node) {
        const innerNode = node.children.find(n => !skipNodes[n.name] && n.name !== "?");

        if (innerNode == null) {
            throw new Error("Optional pattern missing inner pattern.");
        }

        const inner = this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, innerNode);
        return new Optional(`optional-${inner.name}`, inner);
    }

    private _buildRightAssociation(node: Node) {
        const innerNode = node.children.find(n => !skipNodes[n.name] && n.name !== "right");

        if (innerNode == null) {
            throw new Error("RightAssociation pattern missing inner pattern.");
        }

        return new RightAssociated(this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, innerNode));
    }

    private _buildTakeUntil(name: string, node: Node) {
        // The last meaningful child is the until pattern
        const patternChildren = node.children.filter(n =>
            !skipNodes[n.name] && n.name !== "anyChar" && n.name !== "upTo" && n.name !== "wall"
        );

        const untilPatternNode = patternChildren[patternChildren.length - 1];

        if (untilPatternNode == null) {
            throw new Error("TakeUntil pattern missing terminator pattern.");
        }

        const untilPattern = this._buildPattern(`anonymous-pattern-${anonymousIndexId++}`, untilPatternNode);
        return new TakeUntil(name, untilPattern);
    }

    // --- Helpers ---

    private _resolveStringValue(value: string) {
        return value.replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\b/g, '\b')
            .replace(/\\f/g, '\f')
            .replace(/\\v/g, '\v')
            .replace(/\\0/g, '\0')
            .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/\\u([0-9A-Fa-f]{4})/g, (_, hex: string) => String.fromCharCode(parseInt(hex, 16)))
            .replace(/\\(.)/g, '$1').slice(1, -1);
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

    private _isRecursive(name: string, pattern: Pattern) {
        if (pattern.type === "right-associated") {
            pattern = pattern.children[0];
        }
        return this._isRecursivePattern(name, pattern);
    }

    private _isRecursivePattern(name: string, pattern: Pattern) {
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
            (firstChild.name === name || lastChild.name === name);
    }

    // --- Decorators ---

    private _applyDecorators(statementIndex: number, allStatements: readonly Node[], pattern: Pattern) {
        const decorators = this._parseContext.decorators;
        let decoratorNodes: Node[] = [];

        // Walk backwards from the statement to find preceding decorator statements
        // Note: statements Repeat includes newLine divider nodes between statements
        for (let i = statementIndex - 1; i >= 0; i--) {
            const prev = allStatements[i];
            if (prev.name === "decorationStatement" || prev.name === "methodDecorationStatement" || prev.name === "nameDecorationStatement") {
                decoratorNodes.push(prev);
            } else if (prev.name === "comment" || prev.name === "newLine") {
                // Comments and newline dividers can appear between decorators and the statement
                continue;
            } else {
                break;
            }
        }

        for (const d of decoratorNodes) {
            const actualDecorator = d.name === "decorationStatement" ? d.children[0] : d;
            const nameNode = actualDecorator.find(n => n.name === "decorationName");

            if (nameNode == null || decorators[nameNode.value] == null) {
                continue;
            }

            if (actualDecorator.name === "nameDecorationStatement") {
                decorators[nameNode.value](pattern);
            } else if (actualDecorator.name === "methodDecorationStatement") {
                const jsonValueNode = actualDecorator.find(n => n.name === "jsonArray" || n.name === "jsonObject" || n.name === "jsonString" || n.name === "jsonNumber" || n.name === "jsonBoolean" || n.name === "jsonNull");

                if (jsonValueNode == null) {
                    decorators[nameNode.value](pattern);
                } else {
                    decorators[nameNode.value](pattern, JSON.parse(jsonValueNode.value));
                }
            }
        }
    }

    // --- Import Handling ---

    private async _resolveImports(ast: Node) {
        const importStatements = ast.findAll(n => {
            return n.name === "importStatement" || n.name === "useParamsStatement";
        });

        for (const statement of importStatements) {
            if (statement.name === "importStatement") {
                await this._processImport(statement);
            } else {
                this._processUseParams(statement);
            }
        }
    }

    private _resolveImportsSync(ast: Node) {
        const importStatements = ast.findAll(n => {
            return n.name === "importStatement" || n.name === "useParamsStatement";
        });

        for (const statement of importStatements) {
            if (statement.name === "importStatement") {
                this._processImportSync(statement);
            } else {
                this._processUseParams(statement);
            }
        }
    }

    private _processImportSync(importStatement: Node) {
        const parseContext = this._parseContext;
        const resourceNode = importStatement.find(n => n.name === "resource") as Node;

        if (resourceNode == null) {
            throw new Error("Invalid import statement: resource is required");
        }

        const params = this._getWithParams(importStatement);
        const resource = resourceNode.value.slice(1, -1);
        const grammarFile = this._resolveImportSync(resource, this._originResource || null);
        const g = new Grammar({
            resolveImport: this._resolveImport,
            resolveImportSync: this._resolveImportSync,
            originResource: grammarFile.resource,
            params,
            decorators: this._parseContext.decorators
        });

        try {
            const patterns = g.parseString(grammarFile.expression);
            this._processImportNames(importStatement, patterns, parseContext, resource);
        } catch (e: any) {
            throw new Error(`Failed loading expression from: "${resource}". Error details: "${e.message}"`);
        }
    }

    private async _processImport(importStatement: Node) {
        const parseContext = this._parseContext;
        const resourceNode = importStatement.find(n => n.name === "resource") as Node;

        if (resourceNode == null) {
            throw new Error("Invalid import statement: resource is required");
        }

        const params = this._getWithParams(importStatement);
        const resource = resourceNode.value.slice(1, -1);
        const grammarFile = await this._resolveImport(resource, this._originResource || null);
        const g = new Grammar({
            resolveImport: this._resolveImport,
            originResource: grammarFile.resource,
            params,
            decorators: this._parseContext.decorators
        });

        try {
            const patterns = await g.parse(grammarFile.expression);
            this._processImportNames(importStatement, patterns, parseContext, resource);
        } catch (e: any) {
            throw new Error(`Failed loading expression from: "${resource}". Error details: "${e.message}"`);
        }
    }

    private _processImportNames(importStatement: Node, patterns: Record<string, Pattern>, parseContext: ParseContext, resource: string) {
        // Find all imported names (could be aliases or plain names)
        const importedPatternsNode = importStatement.find(n => n.name === "importedPatterns");
        if (importedPatternsNode == null) return;

        const patternNamesNode = importedPatternsNode.find(n => n.name === "patternNames");
        if (patternNamesNode == null) return;

        for (const child of patternNamesNode.children) {
            if (child.name === "importAlias") {
                const nameNode = child.find(n => n.name === "patternName") as Node;
                const aliasNode = child.find(n => n.name === "importNameAlias") as Node;
                const importName = nameNode.value;
                const alias = aliasNode.value;

                if (parseContext.importedPatternsByName.has(alias)) {
                    throw new Error(`'${alias}' was already used within another import.`);
                }

                const pattern = patterns[importName];
                if (pattern == null) {
                    throw new Error(`Couldn't find pattern with name: ${importName}, from import: ${resource}.`);
                }

                parseContext.importedPatternsByName.set(alias, pattern.clone(alias));
            } else if (child.name === "patternName") {
                const importName = child.value;

                if (parseContext.importedPatternsByName.has(importName)) {
                    throw new Error(`'${importName}' was already used within another import.`);
                }

                const pattern = patterns[importName];
                if (pattern == null) {
                    throw new Error(`Couldn't find pattern with name: ${importName}, from import: ${resource}.`);
                }

                parseContext.importedPatternsByName.set(importName, pattern);
            }
            // Skip comma divider nodes
        }
    }

    private _getWithParams(importStatement: Node) {
        let params: Pattern[] = [];
        const withParamsNode = importStatement.find(n => n.name === "withParamsExpr");

        if (withParamsNode != null) {
            const statementsNode = withParamsNode.find(n => n.name === "withParamStatements");

            if (statementsNode != null) {
                const expression = statementsNode.value;
                const importedValues = this._parseContext.getImportedPatterns();

                const g = new Grammar({
                    params: [...importedValues, ...this._parseContext.paramsByName.values()],
                    originResource: this._originResource,
                    resolveImport: this._resolveImport,
                    resolveImportSync: this._resolveImportSync,
                    decorators: this._parseContext.decorators
                });

                const patterns = g.parseString(expression);
                params = Array.from(Object.values(patterns));
            }
        }

        return params;
    }

    private _processUseParams(useParamsStatement: Node) {
        const patternsNode = useParamsStatement.find(n => n.name === "useParamPatterns");

        if (patternsNode == null) {
            return;
        }

        // Each child is a paramNameWithDefault: patternName + optionalParamDefault
        const paramNodes = patternsNode.findAll(n => n.name === "paramNameWithDefault");

        for (const paramNode of paramNodes) {
            const nameNode = paramNode.find(n => n.name === "patternName");
            if (nameNode == null) continue;

            const name = nameNode.value;

            // If already provided via params option, skip
            if (this._parseContext.paramsByName.has(name)) {
                continue;
            }

            // Check for default value: use params { value = default-value }
            const defaultNode = paramNode.find(n => n.name === "defaultParamName");

            if (defaultNode != null) {
                const defaultName = defaultNode.value;
                let pattern = this._parseContext.importedPatternsByName.get(defaultName);

                if (pattern == null) {
                    pattern = new Reference(defaultName);
                }

                this._parseContext.importedPatternsByName.set(name, pattern);
            }
        }
    }
}
