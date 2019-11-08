import Literal from "../../patterns/value/Literal.js";
import OrValue from "../../patterns/value/OrValue.js";
import RepeatValue from "../../patterns/value/RepeatValue.js";
import AndValue from "../../patterns/value/AndValue.js";
import AnyOfThese from "../../patterns/value/AnyofThese.js";
import OptionalValue from "../../patterns/value/OptionalValue.js";

const letter = new AnyOfThese("letter", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
const digit = new AnyOfThese("digit", "0987654321");
const underbar = new Literal("underbar", "_");
const character = new OrValue("character", [
    letter,
    digit,
    underbar
]);

const characterSequence = new RepeatValue("character-sequence", character);
const optionalCharacter = new OptionalValue(characterSequence);

const name = new AndValue("name", [
    letter,
    optionalCharacter
]);

export default name;