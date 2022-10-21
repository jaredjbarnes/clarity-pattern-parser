import {
  Literal,
  AndValue,
  OrValue,
  OptionalValue,
} from "../../index";
import { ident } from './ident';

const rangeEdge = new OptionalValue(ident);
const dots = new Literal('dots', '..');
export const range = new AndValue('range', [rangeEdge, dots, rangeEdge]);
