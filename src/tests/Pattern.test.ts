/** @jest-environment node */
import And from "../patterns/And";
import Or from "../patterns/Or";
import Literal from "../patterns/Literal";
import Repeat from "../patterns/Repeat";

describe("Pattern", () => {
  test("set parent.", () => {
    const parent = new Literal("pattern-type", "pattern");
    const child = new Literal("pattern-type", "pattern");

    child.parent = parent;
  });

  test("getTokens", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new And("full-name", [firstName, lastName]);

    let tokens = firstName.getTokens();
    expect(tokens.length).toBe(1);
    expect(tokens[0]).toBe("John");

    tokens = lastName.getTokens();
    expect(tokens.length).toBe(1);
    expect(tokens[0]).toBe("Doe");

    tokens = fullName.getTokens();
    expect(tokens.length).toBe(1);
    expect(tokens[0]).toBe("John");
  });

  test("getNextToken one deep.", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new And("full-name", [firstName, lastName]);

    const tokens = fullName.children[0].getNextTokens();
    expect(tokens.length).toBe(1);
    expect(tokens[0]).toBe("Doe");
  });

  test("getNextToken two deep.", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const otherLastName = new Literal("other-last-name", "Smith");
    const lastNames = new Or("last-names", [lastName, otherLastName]);
    const fullName = new And("full-name", [firstName, lastNames]);

    const tokens = fullName.children[0].getNextTokens();
    expect(tokens.length).toBe(2);
    expect(tokens[0]).toBe("Doe");
    expect(tokens[1]).toBe("Smith");
  });

  test("getNextToken three deep.", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const middleName = new Literal("middle-name", "Moses");
    const otherMiddleName = new Literal("other-middle-name", "Joshua");
    const middleNames = new Or("middle-names", [middleName, otherMiddleName]);
    const otherLastName = new Literal("other-last-name", "Smith");
    const lastNames = new Or("last-names", [lastName, otherLastName]);
    const fullName = new And("full-name", [firstName, middleNames, lastNames]);

    const tokens = fullName.children[1].children[1].getNextTokens();
    expect(tokens.length).toBe(2);
    expect(tokens[0]).toBe("Doe");
    expect(tokens[1]).toBe("Smith");
  });

  test("getNextToken end of patterns.", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const middleName = new Literal("middle-name", "Moses");
    const otherMiddleName = new Literal("other-middle-name", "Joshua");
    const middleNames = new Or("middle-names", [middleName, otherMiddleName]);
    const otherLastName = new Literal("other-last-name", "Smith");
    const lastNames = new Or("last-names", [lastName, otherLastName]);
    const fullName = new And("full-name", [firstName, middleNames, lastNames]);

    const tokens = fullName.children[2].children[1].getNextTokens();
    expect(tokens.length).toBe(0);
  });

  test("getNextToken end of patterns.", () => {
    const firstName = new Literal("first-name", "John");
    const lastName = new Literal("last-name", "Doe");
    const moses = new Literal("moses", "Moses");
    const joshua = new Literal("other-middle-name", "Joshua");
    const moreLastNames = new Or("more-last-names", [moses, joshua]);
    const otherLastName = new Literal("other-last-name", "Smith");
    const lastNames = new Or("last-names", [
      moreLastNames,
      lastName,
      otherLastName,
    ]);
    const fullName = new And("full-name", [firstName, lastNames]);

    const tokens = fullName.children[0].getNextTokens();
    expect(tokens.length).toBe(4);
    expect(tokens[0]).toBe("Moses");
    expect(tokens[1]).toBe("Joshua");
    expect(tokens[2]).toBe("Doe");
    expect(tokens[3]).toBe("Smith");
  });

  test("getNextTokens, with repeat.", () => {
    const firstName = new Literal("first-name", "John");
    const edward = new Literal("edward", "Edward");
    const middleName = new Repeat("middle-names", edward);
    const lastName = new Literal("lastName", "Doe");
    const fullName = new And("full-name", [firstName, middleName, lastName]);

    let tokens = fullName.children[0].getNextTokens();
    expect(tokens.length).toBe(1);
    expect(tokens[0]).toBe("Edward");

    tokens = fullName.children[1].children[0].getNextTokens();
    expect(tokens.length).toBe(2);
    expect(tokens[0]).toBe("Edward");
    expect(tokens[1]).toBe("Doe");
  });

  test("getNextTokens, with repeat and divider.", () => {
    const firstName = new Literal("first-name", "John");
    const edward = new Literal("edward", "Edward");
    const stewart = new Literal("stewart", "Stewart");
    const middleName = new Repeat("middle-names", edward, stewart);
    const lastName = new Literal("lastName", "Doe");
    const fullName = new And("full-name", [firstName, middleName, lastName]);

    let tokens = fullName.children[0].getNextTokens();
    expect(tokens.length).toBe(1);
    expect(tokens[0]).toBe("Edward");

    tokens = fullName.children[1].children[0].getNextTokens();
    expect(tokens.length).toBe(2);
    expect(tokens[0]).toBe("Stewart");
    expect(tokens[1]).toBe("Doe");

    tokens = fullName.children[1].children[1].getNextTokens();
    expect(tokens.length).toBe(1);
    expect(tokens[0]).toBe("Edward");
  });

  test("getNextTokens, has child and at the beginning.", () => {
    const firstName = new Literal("first-name", "John");
    const edward = new Literal("edward", "Edward");
    const stewart = new Literal("stewart", "Stewart");
    const middleName = new Repeat("middle-names", edward, stewart);
    const lastName = new Literal("lastName", "Doe");
    const fullName = new And("full-name", [firstName, middleName, lastName]);

    let tokens = fullName.getTokens();
    expect(tokens.length).toBe(1);
    expect(tokens[0]).toBe("John");
  });

  test("getNextTokens, has no child and is at the beginning.", () => {
    const firstName = new Literal("first-name", "John");

    let tokens = firstName.getTokens();
    expect(tokens.length).toBe(1);
    expect(tokens[0]).toBe("John");
  });

  test("getNextTokens, and with optional start.", () => {
    const firstName = new Literal("first-name", "John", true);
    const middleName = new Literal("middle-name", "Edward");
    const lastName = new Literal("last-name", "Doe");
    const fullName = new And("full-name", [firstName, middleName, lastName]);

    let tokens = fullName.getTokens();
    expect(tokens.length).toBe(2);
    expect(tokens[0]).toBe("John");
    expect(tokens[1]).toBe("Edward");
  });

  test("getNextTokens, and with optional middle.", () => {
    const firstName = new Literal("first-name", "John");
    const middleName = new Literal("middle-name", "Edward", true);
    const lastName = new Literal("last-name", "Doe");
    const fullName = new And("full-name", [firstName, middleName, lastName]);

    let tokens = fullName.children[0].getNextTokens();
    expect(tokens.length).toBe(2);
    expect(tokens[0]).toBe("Edward");
    expect(tokens[1]).toBe("Doe");

    tokens = fullName.children[1].getNextTokens();
    expect(tokens.length).toBe(1);
    expect(tokens[0]).toBe("Doe");

    tokens = fullName.children[2].getNextTokens();
    expect(tokens.length).toBe(0);
  });

  test("getNextTokens, and with optional last.", () => {
    const firstName = new Literal("first-name", "John");
    const middleName = new Literal("middle-name", "Edward");
    const lastName = new Literal("last-name", "Doe", true);
    const fullName = new And("full-name", [firstName, middleName, lastName]);

    let tokens = fullName.children[0].getNextTokens();
    expect(tokens.length).toBe(1);
    expect(tokens[0]).toBe("Edward");

    tokens = fullName.children[1].getNextTokens();
    expect(tokens.length).toBe(1);
    expect(tokens[0]).toBe("Doe");

    tokens = fullName.children[2].getNextTokens();
    expect(tokens.length).toBe(0);
  });

  test("getNextTokens, first two optional.", () => {
    const firstName = new Literal("first-name", "John", true);
    const middleName = new Literal("middle-name", "Edward", true);
    const lastName = new Literal("last-name", "Doe");
    const fullName = new And("full-name", [firstName, middleName, lastName]);

    let tokens = fullName.getTokens();
    expect(tokens.length).toBe(3);
    expect(tokens[0]).toBe("John");
    expect(tokens[1]).toBe("Edward");
    expect(tokens[2]).toBe("Doe");

    tokens = fullName.children[0].getNextTokens();
    expect(tokens.length).toBe(2);
    expect(tokens[0]).toBe("Edward");
    expect(tokens[1]).toBe("Doe");

    tokens = fullName.children[1].getNextTokens();
    expect(tokens.length).toBe(1);
    expect(tokens[0]).toBe("Doe");

    tokens = fullName.children[2].getNextTokens();
    expect(tokens.length).toBe(0);
  });

  test("getNextTokens, last two optional.", () => {
    const firstName = new Literal("first-name", "John");
    const middleName = new Literal("middle-name", "Edward", true);
    const lastName = new Literal("last-name", "Doe", true);
    const fullName = new And("full-name", [firstName, middleName, lastName]);

    let tokens = fullName.getTokens();
    expect(tokens.length).toBe(1);
    expect(tokens[0]).toBe("John");

    tokens = fullName.children[0].getNextTokens();
    expect(tokens.length).toBe(2);
    expect(tokens[0]).toBe("Edward");
    expect(tokens[1]).toBe("Doe");

    tokens = fullName.children[1].getNextTokens();
    expect(tokens.length).toBe(1);
    expect(tokens[0]).toBe("Doe");

    tokens = fullName.children[2].getNextTokens();
    expect(tokens.length).toBe(0);
  });

  test("getNextTokens, all three optional.", () => {
    const firstName = new Literal("first-name", "John", true);
    const middleName = new Literal("middle-name", "Edward", true);
    const lastName = new Literal("last-name", "Doe", true);

    const fullName = new And("full-name", [firstName, middleName, lastName]);

    let tokens = fullName.getTokens();
    expect(tokens.length).toBe(3);
    expect(tokens[0]).toBe("John");
    expect(tokens[1]).toBe("Edward");
    expect(tokens[2]).toBe("Doe");

    tokens = fullName.children[0].getNextTokens();
    expect(tokens.length).toBe(2);
    expect(tokens[0]).toBe("Edward");
    expect(tokens[1]).toBe("Doe");

    tokens = fullName.children[1].getNextTokens();
    expect(tokens.length).toBe(1);
    expect(tokens[0]).toBe("Doe");

    tokens = fullName.children[2].getNextTokens();
    expect(tokens.length).toBe(0);
  });
});
