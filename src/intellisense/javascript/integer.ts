import { Regex } from "../../patterns/Regex";

const integer = new Regex("integer", "([1-9][0-9]*)|0");

export {
    integer
}