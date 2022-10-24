import { Literal, And, Or } from "../../index";

const pat = new Literal("pat", "Pat");
const dan = new Literal("dan", "Dan");
const store = new Literal("store", "store");
const bank = new Literal("bank", "bank");

const big = new Literal("big", "big");
const small = new Literal("small", "small");

const space = new Literal("space", " ");

const wentTo = new Literal("went-to", "went to");
const visited = new Literal("visited", "visited");

const a = new Literal("a", "a");
const the = new Literal("the", "the");

const noun = new Or("noun", [pat, dan]);
const location = new Or("location", [store, bank]);
const verb = new Or("verb", [wentTo, visited]);
const adjective = new Or("adjective", [big, small]);
const article = new Or("article", [a, the]);

const sentence = new And("sentence", [
  noun,
  space,
  verb,
  space,
  article,
  space,
  adjective,
  space,
  location,
]);

export default sentence;
