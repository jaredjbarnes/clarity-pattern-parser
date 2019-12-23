import cssValue from "./cssPatterns/cssValue.js";
import values from "./cssPatterns/values.js";
import { Cursor } from "../index.js";

exports["Css: unit"] = () => {
  const cursor = new Cursor("10% 10%");
  const result = cssValue.parse(cursor);
};

exports["Css: radial-gradient"] = () => {
  const cursor = new Cursor(
    "radial-gradient(at 40% 40%, rgba(187,202,218,1) 0%, rgba(187,202,218,1) 20%, rgba(187,202,218,1) 100%)"
  );
  const result = cssValue.parse(cursor);
};

exports["Css: rgba"] = () => {
  const cursor = new Cursor("rgba(0,0,0,0)");
  const result = cssValue.parse(cursor);
};

exports["Css: method mutliple values"] = () => {
  const cursor = new Cursor("rgba(first 0px third)");
  const result = cssValue.parse(cursor);
};

exports["Css: nested methods"] = () => {
  const cursor = new Cursor("outer-method(inner-method(0), 0)");
  const result = cssValue.parse(cursor);
};

exports["Css: nested methods with trailing value"] = () => {
  const cursor = new Cursor("outer-method(inner-method(0,0), 0)");
  const result = cssValue.parse(cursor);
};

exports["Css: spaced values"] = () => {
  const cursor = new Cursor("method(arg1 0%, arg2, 10%) 0%");
  const result = values.parse(cursor);
};

exports["Css: spaced values within method"] = () => {
  const cursor = new Cursor("method(inner-method(0,0,0,0) 0%, arg2, 10%)");
  const result = values.parse(cursor);
};

exports["Css: spaced values"] = () => {
  const cursor = new Cursor(
    "inner-method(0,0,0,0) inner-method(0,0,0,0) 0px 10px 0%"
  );
  const result = values.parse(cursor);
};

exports["Css: complex spaced values"] = () => {
  const cursor = new Cursor(
    "#222 linear-gradient(to left, #333, #333 50%, #eee 75%, #333 75%) linear-gradient(to bottom, #555, #555 50%, #eee 75%, #555 75%)"
  );
  const node = values.parse(cursor);
};
