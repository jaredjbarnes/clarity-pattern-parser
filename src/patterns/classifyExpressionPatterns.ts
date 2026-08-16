import type { Pattern } from "./Pattern";
import { Association } from "./PrecedenceTree";
import type { Reference } from "./Reference";
import { Sequence } from "./Sequence";

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
export function classifyExpressionPatterns(
  patterns: Pattern[],
  expressionName: string,
  owner: Pattern
): ClassifiedExpression {
  const result: ClassifiedExpression = {
    patterns: [],
    atomPatterns: [],
    prefixPatterns: [],
    prefixNames: [],
    postfixPatterns: [],
    postfixNames: [],
    infixPatterns: [],
    infixNames: [],
    precedenceMap: {},
    associationMap: {},
  };

  const isSelfReference = (pattern: Pattern) =>
    pattern != null && pattern.name === expressionName;

  const unwrap = (pattern: Pattern) => unwrapAssociation(pattern, owner);

  patterns.forEach((pattern, index) => {
    const unwrapped = unwrap(pattern);
    const firstChild = unwrapped.children[0];
    const lastChild = unwrapped.children[unwrapped.children.length - 1];
    const startsWithSelf = isSelfReference(firstChild);
    const endsWithSelf = isSelfReference(lastChild);
    const selfReferenceCount = unwrapped.children.filter(isSelfReference).length;

    if (!startsWithSelf && !endsWithSelf) {
      const atom = pattern.clone();
      atom.parent = owner;

      result.atomPatterns.push(atom);
      result.patterns.push(atom);
      return;
    }

    const name = extractName(pattern);

    if (endsWithSelf && selfReferenceCount === 1) {
      const prefix = new Sequence(
        `${unwrapped.name}-prefix`,
        unwrapped.children.slice(0, -1)
      );
      prefix.parent = owner;

      result.precedenceMap[name] = index;
      result.prefixPatterns.push(prefix);
      result.prefixNames.push(name);
      result.patterns.push(prefix);
      return;
    }

    if (startsWithSelf && selfReferenceCount === 1) {
      const postfix = new Sequence(
        `${unwrapped.name}-postfix`,
        unwrapped.children.slice(1)
      );
      postfix.parent = owner;

      result.precedenceMap[name] = index;
      result.postfixPatterns.push(postfix);
      result.postfixNames.push(name);
      result.patterns.push(postfix);
      return;
    }

    if (startsWithSelf && endsWithSelf && unwrapped.children.length > 2) {
      const infix = new Sequence(
        `${unwrapped.name}-delimiter`,
        unwrapped.children.slice(1, -1)
      );
      infix.parent = owner;

      result.precedenceMap[name] = index;
      result.infixPatterns.push(infix);
      result.infixNames.push(name);
      result.associationMap[name] =
        pattern.type === "right-associated" ? Association.right : Association.left;
      result.patterns.push(infix);
    }
  });

  return result;
}

function extractName(pattern: Pattern): string {
  if (pattern.type === "right-associated") {
    return pattern.children[0].name;
  }

  return pattern.name;
}

/**
 * Sees through the two wrappers an alternative may arrive in: the
 * `RightAssociated` marker, and a `Reference` that has to be resolved before its
 * children can be inspected. Resolving a reference needs a parent to search up
 * from, hence `owner`; the temporary link is removed again afterwards.
 */
function unwrapAssociation(pattern: Pattern, owner: Pattern): Pattern {
  let unwrapped = pattern;

  if (unwrapped.type === "right-associated") {
    unwrapped = unwrapped.children[0];
  }

  if (unwrapped.type === "reference") {
    unwrapped.parent = owner;
    unwrapped = (unwrapped as Reference).getReferencePatternSafely();
    unwrapped.parent = null;
  }

  return unwrapped;
}
