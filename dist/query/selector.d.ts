import { Node } from "../ast/Node";
export declare class Selector {
    private _selectedNodes;
    private _selectorAst;
    private _combinator;
    constructor(selector: string);
    find(nodes: Node[]): Node[];
    filter(nodes: Node[]): Node[];
    not(nodes: Node[]): Node[];
    parents(nodes: Node[]): Node[];
    private _process;
    private _processWildCard;
    private _processOrSelector;
    private _processNameSelector;
    private _processAttributeSelector;
    private _selectWithCombinator;
    private _isAttributeMatch;
    private _getAttributeName;
    private _getAttributeValue;
    private _getAttributeOperator;
}
