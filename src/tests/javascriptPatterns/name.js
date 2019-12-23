import RegexValue from "../../patterns/value/RegexValue.js";

// const letter = new AnyOfThese("letter", "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
// const digit = new AnyOfThese("digit", "0987654321");
// const underbar = new Literal("underbar", "_");
// const character = new OrValue("character", [
//     letter,
//     digit,
//     underbar
// ]);

// const characterSequence = new RepeatValue("character-sequence", character);
// const optionalCharacter = new OptionalValue(characterSequence);

// const name = new AndValue("name", [
//     letter,
//     optionalCharacter
// ]);

const name = new RegexValue("name", "[a-zA-Z]+[a-zA-Z0-9_]*");

export default name;