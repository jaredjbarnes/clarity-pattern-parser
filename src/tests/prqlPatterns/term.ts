import {
  Literal,
  AndValue,
  OrValue,
} from "../../index";
import ReferencePattern from "../../patterns/ReferencePattern";
import { range } from './range';
import { prqlLiteral } from './literal';
import { ident } from "./ident";

export const term = new OrValue('term', [range, prqlLiteral, ident, new ReferencePattern("nested-pipeline")]);
