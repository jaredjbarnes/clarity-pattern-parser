import { Node } from "../ast/Node";
export declare enum Association {
    left = 0,
    right = 1
}
export declare class PrecedenceTree {
    private _prefixPlaceholder;
    private _prefixNode;
    private _postfixPlaceholder;
    private _postfixNode;
    private _binaryPlaceholder;
    private _binaryNode;
    private _atomNode;
    private _orphanedAtom;
    private _precedenceMap;
    private _associationMap;
    constructor(precedenceMap?: Record<string, number>, associationMap?: Record<string, Association>);
    addPrefix(name: string, ...prefix: Node[]): void;
    addPostfix(name: string, ...postfix: Node[]): void;
    addBinary(name: string, ...delimiterNode: Node[]): void;
    private _getPrecedenceFromNode;
    private _getPrecedence;
    private _compileAtomNode;
    addAtom(node: Node): void;
    hasAtom(): boolean;
    commit(): Node | null;
    private reset;
}
