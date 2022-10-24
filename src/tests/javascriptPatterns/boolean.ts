import {Literal, Or} from "../../index";

const trueLiteral = new Literal("true", "true");
const falseLiteral = new Literal("false", "false");
const boolean = new Or("boolean", [
    trueLiteral,
    falseLiteral
]);

export default boolean;