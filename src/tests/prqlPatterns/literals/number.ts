import {
  Literal,
  AndValue,
  OptionalValue,
} from "../../../index";
import { asciiDigits } from "../general";
import { operatorAdd } from "../operator";

const optionalAddOperator = new OptionalValue(operatorAdd);

const period = new Literal('period', '.');
const decimalSuffix = new AndValue('decimal', [period, asciiDigits]);
const optionalDecimalSuffix = new OptionalValue(decimalSuffix);

export const numberLiteral = new AndValue('number', [optionalAddOperator, asciiDigits, optionalDecimalSuffix]);
