import Literal from "../../patterns/value/Literal.js";
import OrValue from "../../patterns/value/OrValue.js";

const trueLiteral = new Literal("true", "true");
const falseLiteral = new Literal("false", "false");
const boolean = new OrValue("boolean", [
    trueLiteral,
    falseLiteral
]);

export default boolean;