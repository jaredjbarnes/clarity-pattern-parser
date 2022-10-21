import Cursor from '../../../Cursor';
import { prqlLiteral } from '../literal';

describe("Prql Literals Parsing", () => {
  test("Numbers", () => {
    expect(prqlLiteral.parse(new Cursor('123'))).not.toBeNull();
    expect(prqlLiteral.parse(new Cursor('123.1009'))).not.toBeNull();
    expect(prqlLiteral.parse(new Cursor('+123.1009'))).not.toBeNull();
    expect(prqlLiteral.parse(new Cursor('-123.1009'))).not.toBeNull();
  });

  test("Booleans", () => {
    expect(prqlLiteral.parse(new Cursor('true'))).not.toBeNull();
    expect(prqlLiteral.parse(new Cursor('false'))).not.toBeNull();

    expect(prqlLiteral.parse(new Cursor('truth'))).toBeNull();
  })

  test("Interval", () => {
    expect(prqlLiteral.parse(new Cursor('154.2microseconds'))).not.toBeNull();
    expect(prqlLiteral.parse(new Cursor('4hours'))).not.toBeNull();
    expect(prqlLiteral.parse(new Cursor('2years'))).not.toBeNull();
  })

  test("Strings", () => {
    expect(prqlLiteral.parse(new Cursor('"test string"'))).not.toBeNull();
    expect(prqlLiteral.parse(new Cursor("'great string'"))).not.toBeNull();

    expect(prqlLiteral.parse(new Cursor("'great string\""))).toBeNull();
    expect(prqlLiteral.parse(new Cursor("'great string\""))).toBeNull();
  })

  test("Dates", () => {
    expect(prqlLiteral.parse(new Cursor('@2022-12-31T16:54:32.123456Z'))).not.toBeNull();
    expect(prqlLiteral.parse(new Cursor('@2022-21-13'))).not.toBeNull();
    expect(prqlLiteral.parse(new Cursor('@14'))).not.toBeNull();
    expect(prqlLiteral.parse(new Cursor('@14:15'))).not.toBeNull();
    expect(prqlLiteral.parse(new Cursor('@14:15:64'))).not.toBeNull();
    expect(prqlLiteral.parse(new Cursor('@14:15:64'))).not.toBeNull();
  })

  test("Null", () => {
    expect(prqlLiteral.parse(new Cursor('null'))).not.toBeNull();
  })
})
