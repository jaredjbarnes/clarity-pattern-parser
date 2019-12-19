import Cursor from "../src/Cursor.js";
import unit from "../src/tests/javascriptPatterns/unit.js";

const unitRegex = /(\\d*\\.?\\d+)\\s?(px|em|ex|%|in|cn|mm|pt|pc+)/gim;

const simpleUnit = "12px";
const cursor = new Cursor(simpleUnit);

const regexBeginTime = Date.now();

for (let x = 0; x < 100000; x++) {
  unitRegex.lastIndex = 0;
  const result = unitRegex.exec(simpleUnit);
}

const RegexEndTime = Date.now();
const regexDuration = RegexEndTime - regexBeginTime;

const cpBeginTime = Date.now();
for (let x = 0; x < 100000; x++) {
  cursor.index = 0;
  const result = unit.parse(cursor);
}
const cpEndTime = Date.now();
const cpDuration = cpEndTime - cpBeginTime;

console.log(regexDuration, cpDuration);

// const regex = /^[a-zA-Z]+|%/g

// const value = "9.99dfff";

// const match = regex.exec(value);
// window.match = match;
// console.log(match, regex.lastIndex);