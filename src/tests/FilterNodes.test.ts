import element from "./htmlPatterns/element";
import { Cursor } from "../index";

describe("Filter Nodes", () => {
  test("Filter Nodes: Get open div node.", () => {
    const cursor = new Cursor(`<div><div><span></span></div></div>`);
    const node = element.parse(cursor);
    const matches = node?.filter((node) => {
      return node.value === "div" && node.name === "open-element-name";
    });

    expect(matches?.length).toBe(2);
    expect(matches?.every((n) => n.name === "open-element-name")).toBe(true);
    expect(matches?.every((n) => n.value === "div")).toBe(true);
  });

  test("Filter Nodes: Get div elements.", () => {
    const cursor = new Cursor(`<div><div><span></span></div></div>`);
    const node = element.parse(cursor);
    const matches = node?.filter((node) => {
      return (
        node.name === "element" &&
        node.children[1].name === "open-element-name" &&
        node.children[1].value === "div"
      );
    });

    expect(matches?.length).toBe(2);
    expect(matches?.every((n) => n.name === "element")).toBe(true);
  });
});
