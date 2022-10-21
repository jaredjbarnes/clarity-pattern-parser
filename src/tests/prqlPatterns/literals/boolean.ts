import {
  Literal,
  OrValue,
} from "../../../index";

const trueLiteral = new Literal('true', 'true');
const falseLiteral = new Literal('false', 'false');
export const booleanLiteral = new OrValue('boolean', [trueLiteral, falseLiteral]);
export const nullLiteral = new Literal('null', 'null');
