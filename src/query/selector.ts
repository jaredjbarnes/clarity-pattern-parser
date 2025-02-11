import { generateErrorMessage } from "../patterns/generate_error_message";
import { selectorParser } from "./selector_parser";
import { Node } from "../ast/Node";

const combinatorMap: Record<string, boolean> = {
    adjacent: true,
    after: true,
    descendant: true,
    "direct-child": true
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

    executeOn(nodes: Node[]) {
        this._selectedNodes = nodes;

        const ast = this._selectorAst;

        ast.walkUp((node) => {
            this._process(node);
        });

        return this._selectedNodes;
    }

    private _process(ast: Node) {
        const nodeName = ast.name;

        if (nodeName === "wild-cart") {
            this._selectedNodes = this._selectedNodes.map(n => {
                return this._selectWithCombinator(n, () => true);
            }).flat();
        }
        else if (nodeName === "name-selector" || nodeName === "name") {

            if (ast.children.length > 1) {
                this._selectedNodes = this._selectedNodes.map(n => {
                    const attributeName = ast.find(n => n.name === "attribute-name") as Node;
                    const attributeValue = ast.find(n => n.name === "attribute-value") as Node;
                    const name = ast.children[0].value;

                    return this._selectWithCombinator(n, (node: Node) => {
                        if ((node as any)[attributeName.value] == null) {
                            return false;
                        }
                        return node.name === name &&
                            (node as any)[attributeName.value].toString() === attributeValue.value.toString();
                    });

                }).flat();
            } else {
                this._selectedNodes = this._selectedNodes.map(n => {
                    return this._selectWithCombinator(n, (node: Node) => node.name === ast.value);
                }).flat();
            }

        }
        else if (nodeName === "attribute-selector") {
            this._selectedNodes = this._selectedNodes.map(n => {
                const attributeName = ast.find(n => n.name === "attribute-name") as Node;
                const attributeValue = ast.find(n => n.name === "attribute-value") as Node;

                return this._selectWithCombinator(n, (node: Node) => {
                    if ((node as any)[attributeName.value] == null) {
                        return false;
                    }
                    return (node as any)[attributeName.value].toString() === attributeValue.value.toString();
                });

            }).flat();
        }
        else if (combinatorMap[nodeName]) {
            this._combinator = nodeName;
        }
        else if (nodeName === "selector-expression") {
            this._combinator = null;
        }
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
            const after = parent.children.slice(index);
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

}