import { Sequence } from "../../patterns/Sequence";
import { name } from "./name";
import { propertyAccess } from "./propertyAccess";

export const objectAccess = new Sequence("object-access", [
    name.clone("variable-name"),
    propertyAccess,
]);