import {
  AndComposite,
  AndValue,
  Literal,
  RegexValue,
} from "../../../index";
import { endExpression } from '../general'

const dateInner = new RegexValue('date-inner', '[0-9]{4,}-[0-9]{2,}-[0-9]{2,}');
const timeInner = new RegexValue('time-inner', '[0-9]{2,}([.:]*[0-9]*)*([+-][0-9:]*|Z)?')
const at = new Literal('@', '@');

export const date = new AndValue('date', [at, dateInner, endExpression])
export const time = new AndComposite('time', [at, timeInner])

const tLiteral = new Literal('T', 'T');

const timestampInner = new AndValue('timestamp-inner', [dateInner, tLiteral, timeInner])
export const timestamp = new AndValue('timestamp', [at, timestampInner, endExpression])
