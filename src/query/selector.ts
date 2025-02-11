import { generateErrorMessage } from "../patterns/generate_error_message";
import { selectorParser } from "./selector_parser";
import { Node } from "../ast/Node";

const combinatorMap: Record<string, boolean> = {
    "adjacent": true,
    "after": true,
    "descendant": true,
    "direct-child": true
};

const operatorMap: Record<string, boolean> = {
    "equal": true,
    "not-equal": true,
    "starts-with": true,
    "ends-with": true,
    "contains": true,
    "greater-than-or-equal": true,
    "less-than-or-equal": true,
    "greater-than": true,
    "less-than": true
};

export class Selector {
    private _selectedNodes: Node[];
    private _selectorAst: Node;
    private _combinator: string | null;

    constructor(selector: string) {
        this._selectedNodes = [];
        this._combinator = null;

        const result = selectorParser.exec(selector);

        if (result.ast == null) {
            const message = generateErrorMessage(selectorParser, result.cursor);
            throw new Error(`[Invalid Selector] ${message}`);
        }

        this._selectorAst = result.ast;
    }

    find(nodes: Node[]) {
        this._selectedNodes = nodes;

        const ast = this._selectorAst;
        ast.walkUp((node) => {
            this._process(node);
        });

        return this._selectedNodes;
    }

    filter(nodes: Node[]) {
        if (nodes.length < 1) {
            return [];
        }

        const nodeMap = new Map();
        nodes.forEach(n => nodeMap.set(n, n));

        this._selectedNodes = [nodes[nodes.length - 1]];

        const ast = this._selectorAst;
        ast.walkUp((node) => {
            this._process(node);
        });

        return this._selectedNodes.filter(n => nodeMap.has(n));
    }

    not(nodes: Node[]) {
        if (nodes.length < 1) {
            return [];
        }

        this._selectedNodes = [nodes[nodes.length - 1]];

        const ast = this._selectorAst;
        ast.walkUp((node) => {
            this._process(node);
        });

        const nodeMap = new Map();
        this._selectedNodes.forEach(n => nodeMap.set(n, n));

        return nodes.filter(n => !nodeMap.has(n));
    }

    parents(nodes: Node[]) {
        if (nodes.length < 1) {
            return [];
        }

        this._selectedNodes = [nodes[nodes.length - 1]];

        const ast = this._selectorAst;
        ast.walkUp((node) => {
            this._process(node);
        });

        return this._selectedNodes.filter(n => n.findAncestor(a=>nodes.includes(a)) != null);
    }

    private _process(ast: Node) {
        const nodeName = ast.name;

        if (nodeName === "wild-card") {
            this._selectedNodes = this._processWildCard();
        }
        else if (nodeName === "or-selector") {
            this._selectedNodes = this._processOrSelector(ast);
        }
        else if (nodeName === "name-selector" || (nodeName === "name" && (ast.parent == null || ast.parent.name === "selector-expression"))) {
            this._selectedNodes = this._processNameSelector(ast);
        }
        else if (nodeName === "attribute-selector" && (ast.parent == null || ast.parent.name === "selector-expression")) {
            this._selectedNodes = this._processAttributeSelector(ast);
        }
        else if (combinatorMap[nodeName]) {
            this._combinator = nodeName;
        }
        else if (nodeName === "selector-expression") {
            this._combinator = null;
        }
    }

    private _processWildCard() {
        return this._selectedNodes.map(n => {
            return this._selectWithCombinator(n, () => true);
        }).flat();
    }

    private _processOrSelector(ast: Node) {
        const selectorNodes = ast.children.filter(n => n.name !== "comma");
        const set: Set<Node> = new Set();

        const selectors = selectorNodes.map(n => new Selector(n.toString()));

        selectors.map(s => {
            return s.find(this._selectedNodes.slice());
        }).flat().forEach((node) => {
            set.add(node);
        });

        return Array.from(set);
    }


    private _processNameSelector(ast: Node) {
        if (ast.children.length > 1) {
            return this._selectedNodes.map(n => {
                const name = ast.children[0].value;

                return this._selectWithCombinator(n, (node: Node) => {
                    return node.name === name && this._isAttributeMatch(node, ast);
                });

            }).flat();
        } else {
            return this._selectedNodes.map(n => {
                return this._selectWithCombinator(n, (node: Node) => node.name === ast.value);
            }).flat();
        }
    }

    private _processAttributeSelector(ast: Node) {
        return this._selectedNodes.map(n => {
            return this._selectWithCombinator(n, (node: Node) => {
                return this._isAttributeMatch(node, ast);
            });

        }).flat();
    }

    private _selectWithCombinator(node: Node, predicate: (node: Node) => boolean) {
        if (this._combinator === "adjacent") {
            const sibling = node.nextSibling();
            if (sibling == null) {
                return [];
            }

            if (predicate(sibling)) {
                return [sibling];
            } else {
                return [];
            }
        }
        else if (this._combinator === "after") {
            const parent = node.parent;

            if (parent == null) {
                return [];
            }

            const index = parent.findChildIndex(node);
            const after = parent.children.slice(index + 1);
            return after.filter(predicate);
        }
        else if (this._combinator === "direct-child") {
            return node.children.filter(predicate);
        }
        else if (this._combinator === "descendant" || this._combinator == null) {
            return node.findAll(predicate);
        } else {
            return [];
        }
    }

    private _isAttributeMatch(node: Node, ast: Node) {
        const name = this._getAttributeName(ast);
        const operator = this._getAttributeOperator(ast);
        const value = this._getAttributeValue(ast);
        const anyNode = node as any;

        if (anyNode[name] == null) {
            return false;
        }

        if (operator === "equal") {
            return anyNode[name] === value;
        } else if (operator === "not-equal") {
            return anyNode[name] !== value;
        } else if (operator === "starts-with") {
            return anyNode[name].toString().startsWith(value);
        } else if (operator === "ends-with") {
            return anyNode[name].toString().endsWith(value);
        } else if (operator === "contains") {
            return anyNode[name].toString().includes(value);
        } else if (operator === "greater-than-or-equal") {
            return anyNode[name] >= value;
        } else if (operator === "less-than-or-equal") {
            return anyNode[name] <= value;
        } else if (operator === "greater-than") {
            return anyNode[name] > value;
        } else if (operator === "less-than") {
            return anyNode[name] < value;
        }

        return false;
    }

    private _getAttributeName(ast: Node) {
        return (ast.find(n => n.name === "attribute-name") as Node).value;
    }

    private _getAttributeValue(ast: Node) {
        let valueNode: Node | null = ast.find(n => n.name === "single-quote-string-literal");

        if (valueNode != null) {
            return valueNode.value.slice(1, -1);
        } else {
            valueNode = ast.find(n => n.name === "value");
        }

        if (valueNode != null) {
            return valueNode.value;
        } else {
            valueNode = ast.find(n => n.name === "number");
        }

        return (valueNode as Node).value;
    }

    private _getAttributeOperator(ast: Node) {
        return (ast.find(n => operatorMap[n.name]) as Node).name;
    }

}