import { explode, product, zip } from "./matrix";

test("zip", () => {
  expect(zip([1, 2, 3], [0, 0, 0])).toEqual([
    [1, 0],
    [2, 0],
    [3, 0],
  ]);
});

test("product", () => {
  expect(product([])).toEqual([[]]);
  expect(product([[], [1, 2, 3]])).toEqual([]);
  expect(
    product([
      ["a", "b"],
      [1, 2],
    ]),
  ).toEqual([
    ["a", 1],
    ["a", 2],
    ["b", 1],
    ["b", 2],
  ]);
});

test("explode", () => {
  expect(explode(1)(["a", [1, 2, 3], "b"])).toEqual([
    ["a", 1, "b"],
    ["a", 2, "b"],
    ["a", 3, "b"],
  ]);
});
