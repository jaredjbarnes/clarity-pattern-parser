import Literal from "../../patterns/value/Literal";
import name from "../javascriptPatterns/name";
import number from "../javascriptPatterns/number";
import string from "../javascriptPatterns/string";
import OrComposite from "../../patterns/composite/OrComposite";
import AndComposite from "../../patterns/composite/AndComposite";


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

const value = new OrComposite("value", [
    number,
    string,
    name
]);

const operator = new OrComposite("operator", [
    equalTo,
    notEqualTo,
    isGreaterThan,
    isLessThan,
    isGreaterThanOrEqualTo,
    isLessThanOrEqualTo,
    startsWith,
    endsWith,
    contains
]);

const predicate = new AndComposite("predicate", [
    name,
    space,
    operator,
    space,
    value
]);

const match = new Literal("match", "Match records where");

const filter = new AndComposite("filter", [
    match,
    space,
    predicate
]);

export default filter;