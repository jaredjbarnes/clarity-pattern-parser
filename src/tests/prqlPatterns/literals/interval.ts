import {
  Literal,
  AndValue,
  OrValue,
} from "../../../index";
import {numberLiteral} from './number'

const intervalKind = new OrValue('interval-kind', [
   new Literal("microseconds", "microseconds"),
   new Literal("milliseconds", "milliseconds"),
   new Literal("seconds", "seconds"),
   new Literal("minutes", "minutes"),
   new Literal("hours", "hours"),
   new Literal("days", "days"),
   new Literal("weeks", "weeks"),
   new Literal("months", "months"),
   new Literal("years", "years")
]);

export const interval = new AndValue('interval', [numberLiteral, intervalKind])
