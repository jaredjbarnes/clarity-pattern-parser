/** @jest-environment node */
import Permutor from "../Permutor";

describe("Permutor", () => {
  test("Permutor: simple.", () => {
    const permutor = new Permutor();
    const array = [
      [0, 1],
      [0, 1],
      [0, 1],
    ];

    const result = permutor.permute(array);
    expect(result.join(",")).toBe("000,001,010,011,100,101,110,111");
  });

  test("Permutor: larger.", () => {
    const permutor = new Permutor();
    const array = [
      [0, 1, 2],
      [0, 1],
      [0, 1, 2, 3],
    ];

    const result = permutor.permute(array);
    expect(result.join(",")).toBe(
      "000,001,002,003,010,011,012,013,100,101,102,103,110,111,112,113,200,201,202,203,210,211,212,213"
    );
  });
});
