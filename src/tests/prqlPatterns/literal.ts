import {numberLiteral} from './literals/number';
import {stringLiteral} from './literals/string';
import {booleanLiteral, nullLiteral} from './literals/boolean';
import {interval} from './literals/interval';
import {date, time, timestamp} from './literals/date';
import { OrValue } from '../../index';

export const prqlLiteral = new OrValue('literal', [numberLiteral, stringLiteral, booleanLiteral, nullLiteral, interval, date, time, timestamp])
