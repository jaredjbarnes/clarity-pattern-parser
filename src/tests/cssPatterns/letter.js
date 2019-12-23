import { AnyOfThese } from "../../index.js";

const letter = new AnyOfThese(
  "letter",
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
);

export default letter;
