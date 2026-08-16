import type { Pattern } from "./Pattern";
import { Association } from "./PrecedenceTree";
/**
 * Sorts an expression's alternatives into Pratt-parser roles and strips the
 * self-references out of each one.
 *
 * This is the step that lets a grammar be written the way a language spec reads.
 * An alternative is classified by where it refers to the expression itself:
 *
 *   atom     no self-reference          `integer`, `"(" expr ")"`
 *   prefix   self-reference last only   `"-" expr`
 *   postfix  self-reference first only  `expr "++"`
 *   infix    self-reference at both     `expr "+" expr`
 *
 * The operator sequence is then extracted with the self-references removed, so
 * the parse loop only ever matches the operator part and lets the precedence
 * tree assemble the operands. Precedence is declaration order — earlier binds
 * tighter — and association defaults to left unless the alternative is wrapped
 * in `RightAssociated`.
 */
export interface ClassifiedExpression {
    patterns: Pattern[];
    atomPatterns: Pattern[];
    prefixPatterns: Pattern[];
    prefixNames: string[];
    postfixPatterns: Pattern[];
    postfixNames: string[];
    infixPatterns: Pattern[];
    infixNames: string[];
    precedenceMap: Record<string, number>;
    associationMap: Record<string, Association>;
}
/**
 * @param patterns    the expression's original alternatives
 * @param expressionName  name a child must have to count as a self-reference
 * @param owner       the Expression that will own the extracted patterns
 */
export declare function classifyExpressionPatterns(patterns: Pattern[], expressionName: string, owner: Pattern): ClassifiedExpression;
