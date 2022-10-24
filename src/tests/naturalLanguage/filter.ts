import { Literal, Or, And } from "../../index";
import name from "../javascriptPatterns/name";
import number from "../javascriptPatterns/number";
import string from "../javascriptPatterns/string";

const space = new Literal("space", " ");
const equalTo = new Literal("=", "is");
const notEqualTo = new Literal("!=", "is not");
const isGreaterThan = new Literal(">", "is greater than");
const isLessThan = new Literal("<", "is less than");
const isGreaterThanOrEqualTo = new Literal(">=", "is greater or the same as");
const isLessThanOrEqualTo = new Literal("<=", "is less than or the same as");
const startsWith = new Literal("starts-with", "starts with");
const endsWith = new Literal("ends-with", "ends with");
const contains = new Literal("contains", "has");

const value = new Or("value", [number, string, name]);

const operator = new Or("operator", [
  equalTo,
  notEqualTo,
  isGreaterThan,
  isLessThan,
  isGreaterThanOrEqualTo,
  isLessThanOrEqualTo,
  startsWith,
  endsWith,
  contains,
]);

const predicate = new And("predicate", [name, space, operator, space, value]);

const match = new Literal("match", "Match records where");

const filter = new And("filter", [match, space, predicate]);

export default filter;
