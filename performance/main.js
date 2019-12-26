import Cursor from "../src/Cursor.js";
import cssValue from "../src/tests/cssPatterns/cssValue.js";

const simplecssValue = "10 linear-gradient(to left, #333, #333 50%, #eee 75%, #333 75%) rgba(0,0,0,1) #333 #555555 0px 0% 0deg 1em radial-gradient(at 40% 40%, rgba(187,202,218,1) 0%, rgba(187,202,218,1) 20%, rgba(187,202,218,1) 100%)";
const cursor = new Cursor(simplecssValue);

const cpBeginTime = Date.now();
for (let x = 0; x < 100000; x++) {
  cursor.index = 0;
  const result = cssValue.parse(cursor);
}
const cpEndTime = Date.now();
const cpDuration = cpEndTime - cpBeginTime;

console.log(cpDuration);

// const regex = /^[a-zA-Z]+|%/g

// const value = "9.99dfff";

// const match = regex.exec(value);
// window.match = match;
// console.log(match, regex.lastIndex);