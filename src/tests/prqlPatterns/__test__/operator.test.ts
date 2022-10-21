import Cursor from '../../../Cursor';
import {operator} from '../operator';

describe("Prql Operators", () => {
  test("Unary", () => {
    expect(operator.parse(new Cursor('+'))).not.toBeNull();
    expect(operator.parse(new Cursor('-'))).not.toBeNull();
    expect(operator.parse(new Cursor('!'))).not.toBeNull();
  })

  test("Mul", () => {
    expect(operator.parse(new Cursor('*'))).not.toBeNull();
    expect(operator.parse(new Cursor('/'))).not.toBeNull();
    expect(operator.parse(new Cursor('%'))).not.toBeNull();
  })

  test("Compare", () => {
    expect(operator.parse(new Cursor('>'))).not.toBeNull();
    expect(operator.parse(new Cursor('<'))).not.toBeNull();
    expect(operator.parse(new Cursor('=='))).not.toBeNull();
    expect(operator.parse(new Cursor('>='))).not.toBeNull();
    expect(operator.parse(new Cursor('<='))).not.toBeNull();
    expect(operator.parse(new Cursor('!='))).not.toBeNull();
  })

  test("Logical", () => {
    expect(operator.parse(new Cursor('and '))).not.toBeNull();
    expect(operator.parse(new Cursor('or '))).not.toBeNull();

    expect(operator.parse(new Cursor('and'))).toBeNull();
    expect(operator.parse(new Cursor('or'))).toBeNull();
  })

  test('Coallesce', () => {
    expect(operator.parse(new Cursor('??'))).not.toBeNull();
  })
})
