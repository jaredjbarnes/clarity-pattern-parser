import {
  Literal,
  RepeatValue,
  OptionalValue,
  AndValue,
  RegexValue,
  OrValue,
  NotValue,
} from "../../index";
import LookAhead from "../../patterns/LookAhead";
import { operator, operatorAdd } from './operator';
import { keyword } from './general';

const identSeperator = new Literal('ident-seperator', ".");
const identStar = new Literal('ident-star', "*");
const notOperator = new LookAhead(new NotValue('not-operator', operator));
const notKeyword = new LookAhead(new NotValue('not-keyword', keyword));

export const identPartFirst = new RegexValue('ident-part-first', '([a-zA-Z$_])[a-zA-Z0-9_]*')
const identPartNext = new AndValue('ident-part-next', [identSeperator, new OrValue('ident-next-content', [identPartFirst, identStar])])
const optionalIdentPartNext = new OptionalValue(new RepeatValue('repeatable-ident-part-next', identPartNext));

export const ident = new AndValue('ident', [notOperator, notKeyword, identPartFirst, optionalIdentPartNext])
export const signedIdent = new AndValue('signed-ident', [operatorAdd, ident])
