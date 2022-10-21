import {
  AndValue,
    OptionalValue,
  RecursivePattern,
} from "../../index";
import { operatorAdd, operatorCoalesce, operatorCompare, operatorLogical, operatorMul } from './operator';
import { term } from './term';

const mulOperatorAndExpression = new AndValue('mul-and-expr-mul', [operatorMul, new RecursivePattern('expr-mul')]);
const exprMulOptional = new OptionalValue(mulOperatorAndExpression);
export const exprMul = new AndValue('expr-mul', [term, exprMulOptional]);

const addOperatorAndExpression = new AndValue('add-and-expr-add', [operatorAdd, new RecursivePattern('expr-add')]);
const exprAddOptional = new OptionalValue(addOperatorAndExpression);
export const exprAdd = new AndValue('expr-add', [exprMul, exprAddOptional]);

const compareOperatorAndExpression = new AndValue('compare-and-expr-add', [operatorCompare, exprAdd]);
const exprCompareOptional = new OptionalValue(compareOperatorAndExpression);
export const exprCompare = new AndValue('expr-compare', [exprAdd, exprCompareOptional]);

const coalesceOperatorAndExpression = new AndValue('coalesce-and-expr-coalesce', [operatorCoalesce, new RecursivePattern('expr-coalesce')]);
const exprCoalesceOptional = new OptionalValue(coalesceOperatorAndExpression);
export const exprCoalesce = new AndValue('expr-coalesce', [exprCompare, exprCoalesceOptional]);

const logicalOperatorAndExpression = new AndValue('operator-logical-and-expr', [operatorLogical, new RecursivePattern('expr')]);
const exprOptional = new OptionalValue(logicalOperatorAndExpression);
export const expr = new AndValue('expr', [exprCoalesce, exprOptional]);
