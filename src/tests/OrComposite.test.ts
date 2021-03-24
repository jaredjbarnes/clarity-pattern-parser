import OrComposite from "../patterns/composite/OrComposite";
import Literal from "../patterns/value/Literal";
import OptionalValue from "../patterns/value/OptionalValue";
import { Cursor } from "../index";

describe("OrComposite", ()=>{
  test("Match.", () => {
    const john = new Literal("john", "John");
    const jane = new Literal("jane", "Jane");
    const cursor = new Cursor("John");
    const name = new OrComposite("name", [john, jane]);
  
    const node = name.parse(cursor);
  
    expect(node.name).toBe("john");
    expect(node.value).toBe("John");
  });
  
  test("No Match", () => {
    const john = new Literal("john", "John");
    const jane = new Literal("jane", "Jane");
    const cursor = new Cursor("Jeffrey");
    const name = new OrComposite("name", [john, jane]);
  
    const node = name.parse(cursor);
  
    expect(node).toBe(null);
    expect(cursor.getIndex()).toBe(0);
    expect(cursor.hasUnresolvedError()).toBe(true);
  });
  
  test("Supplied only one option.", () => {
    const john = new Literal("john", "John");
  
    expect(() => {
      new OrComposite("name", [john]);
    }).toThrow();
  });
  
  test("Optional Children.", () => {
    const john = new Literal("john", "John");
    const jane = new Literal("jane", "Jane");
  
    expect(() => {
      new OrComposite("name", [new OptionalValue(john), new OptionalValue(jane)]);
    }).toThrow();
  });
  
  test("parse with null cursor.", () => {
    const john = new Literal("john", "John");
    const jane = new Literal("jane", "Jane");
    const cursor = new Cursor("John");
    const name = new OrComposite("name", [john, jane]);
  
    const node = name.parse(cursor);
  
    expect(node.name).toBe("john");
    expect(node.value).toBe("John");
  });
  
  test("clone.", () => {
    const john = new Literal("john", "John");
    const jane = new Literal("jane", "Jane");
  
    const name = new OrComposite("name", [john, jane]);
    const clone = name.clone("name2");
  
    expect(clone.name).toBe("name2");
    expect(clone.children.length).toBe(2);
    expect(clone.children[0].name).toBe("john");
    expect(clone.children[1].name).toBe("jane");
  });
  
});
