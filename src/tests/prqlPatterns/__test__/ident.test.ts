import { ident, signedIdent } from '../ident';
import Cursor from '../../../Cursor';

describe("Prql Ident", () => {
  test("Without clarifying identification", () => {
    expect(ident.parse(new Cursor('employees'))).not.toBeNull();
    expect(ident.parse(new Cursor('_employees'))).not.toBeNull();
    expect(ident.parse(new Cursor('_e_f'))).not.toBeNull();
    expect(ident.parse(new Cursor('$friends'))).not.toBeNull();
    expect(ident.parse(new Cursor('$123'))).not.toBeNull();
    expect(ident.parse(new Cursor('$123'))).not.toBeNull();
    expect(ident.parse(new Cursor('table_salad'))).not.toBeNull();
  });

  test("With clarifying identification", () => {
    expect(ident.parse(new Cursor('employees.agents'))).not.toBeNull();
    expect(ident.parse(new Cursor('employees.*'))).not.toBeNull();
    expect(ident.parse(new Cursor('employees.agents.*'))).not.toBeNull();
    expect(ident.parse(new Cursor('e.a.*.*.*.*'))).not.toBeNull();
  });

  test("Invalid identifiers", () => {
    expect(ident.parse(new Cursor('+'))).toBeNull();
    expect(ident.parse(new Cursor('-'))).toBeNull();
    expect(ident.parse(new Cursor('table '))).toBeNull();
  })

  test("Signed ident", () => {
    expect(signedIdent.parse(new Cursor('+employees'))).not.toBeNull();
    expect(signedIdent.parse(new Cursor('-_employees'))).not.toBeNull();
    expect(signedIdent.parse(new Cursor('-_e_f'))).not.toBeNull();
    expect(signedIdent.parse(new Cursor('-$friends'))).not.toBeNull();
    expect(signedIdent.parse(new Cursor('+$123'))).not.toBeNull();
    expect(signedIdent.parse(new Cursor('+$123'))).not.toBeNull();
    expect(signedIdent.parse(new Cursor('+table_salad'))).not.toBeNull();

    expect(signedIdent.parse(new Cursor('+employees.agents.*'))).not.toBeNull();
    expect(signedIdent.parse(new Cursor('-e.a.*.*.*.*'))).not.toBeNull();
  });

  test("Invalid signed ident", () => {
    expect(signedIdent.parse(new Cursor('employees'))).toBeNull();
    expect(signedIdent.parse(new Cursor('_employees'))).toBeNull();
    expect(signedIdent.parse(new Cursor('_e_f'))).toBeNull();
    expect(signedIdent.parse(new Cursor('$friends'))).toBeNull();
    expect(signedIdent.parse(new Cursor('$123'))).toBeNull();
    expect(signedIdent.parse(new Cursor('$123'))).toBeNull();
  })
});

