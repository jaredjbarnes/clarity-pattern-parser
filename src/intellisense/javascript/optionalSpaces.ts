import { Optional } from "../../patterns/Optional";
import { Regex } from "../../patterns/Regex";

export const optionalSpaces = new Optional("optional-spaces", new Regex("optional-spaces", "\\s+"));