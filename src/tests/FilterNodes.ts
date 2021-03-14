import assert from "assert";
import element from "./htmlPatterns/element";
import { Cursor } from "../index";

exports["Filter Nodes: Get open div node."] = () => {
  const cursor = new Cursor(`<div><div><span></span></div></div>`);
  const node = element.parse(cursor);
  const matches = node.filter(node => {
    return node.value === "div" && node.name === "open-element-name";
  });

  assert.equal(matches.length, 2);
  assert.equal(matches.every(n=>n.name === "open-element-name"), true);
  assert.equal(matches.every(n=>n.value === "div"), true);
};

exports["Filter Nodes: Get div elements."] = () => {
  const cursor = new Cursor(`<div><div><span></span></div></div>`);
  const node = element.parse(cursor);
  const matches = node.filter(node => {
    return (
      node.name === "element" &&
      node.children[1].name === "open-element-name" &&
      node.children[1].value === "div"
    );
  });

  assert.equal(matches.length, 2);
  assert.equal(matches.every(n=>n.name === "element"), true);
};
