import Literal from "../../patterns/value/Literal";
import OrValue from "../../patterns/value/OrValue";

const trueLiteral = new Literal("true", "true");
const falseLiteral = new Literal("false", "false");
const boolean = new OrValue("boolean", [
    trueLiteral,
    falseLiteral
]);

export default boolean;