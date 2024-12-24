import { Sequence } from "../../patterns/Sequence";
import { Reference } from "../../patterns/Reference";
import { name } from "./name";
import { propertyAccess } from "./propertyAccess";

export const objectAccess = new Sequence("object-access", [
    name.clone("variable-name"),
    propertyAccess,
]);