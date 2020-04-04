import element, { attribute } from "./htmlPatterns/element";
import { Cursor } from "../index.js";
import assert from "assert";

exports["Html: element"] = () => {
  const cursor = new Cursor("<div></div>");
  const result = element.parse(cursor);
};

exports["Html: element nested"] = () => {
  const cursor = new Cursor("<div><p><span></span></p></div>");
  const result = element.parse(cursor);
};

exports["Html: element with attributes"] = () => {
  const cursor = new Cursor('<div prop="value"></div>');
  const result = element.parse(cursor);
};

exports["Html: multiple children"] = () => {
    const cursor = new Cursor(`<div prop="value">
        Text
        <span>Hello</span>
        <span>World!</span>
    </div>`);
    const result = element.parse(cursor);

    const possibilities = element.getPossibilities();
  };

exports["Attributes: "] = () => {
  const cursor = new Cursor('prop="boo"');
  const result = attribute.parse(cursor);
};
