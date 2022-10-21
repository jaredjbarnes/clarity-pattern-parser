import {
  Literal,
  AndValue,
  OrValue,
} from "../../index";
import {whitespace} from './general';

const subtract = new Literal('subtract', '-');
const add = new Literal('add', '+');
const not = new Literal('not', '!');
const operatorUnary = new OrValue('operator-unary', [add, subtract, not]);

export const operatorAdd = new OrValue('operator-add', [add, subtract])

const multiply = new Literal('multiply', '*');
const divide = new Literal('divide', '/');
const modulus = new Literal('modulus', '%');
export const operatorMul = new OrValue('operator-mul', [multiply, divide, modulus]);

const equal = new Literal('equal', '==');
const notEqual = new Literal('not-equal', '!=');
const greaterThanOrEqual = new Literal('greater-than-or-equal', '>=');
const lessThanOrEqual = new Literal('less-than-or-equal', '<=');
const greaterThan= new Literal('greater-than-', '>');
const lessThan= new Literal('less-than-', '<');
export const operatorCompare = new OrValue('operator-compare', [equal, notEqual, greaterThanOrEqual, lessThanOrEqual, greaterThan, lessThan]);

const and = new Literal('and', 'and');
const andOperator = new AndValue('and-operator', [and, whitespace]);
const or = new Literal('or', 'or');
const orOperator = new AndValue('or-operator', [or, whitespace]);
export const operatorLogical = new OrValue('operator-logical', [andOperator, orOperator]);

export const operatorCoalesce = new Literal('operator-coalesce', '??');

export const operator = new OrValue('operator', [operatorUnary, operatorAdd, operatorMul, operatorCompare, operatorLogical, operatorCoalesce])
