import { And } from "../../patterns/And";
import { Reference } from "../../patterns/Reference";
import { name } from "./name";
import { propertyAccess } from "./propertyAccess";

export const objectAccess = new And("object-access", [
    name.clone("variable-name"),
    propertyAccess,
]);