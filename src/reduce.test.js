import { max, min, reduce } from "./reduce.js";

import { wrapPromise } from "./promise.js";

test("reduce", () => {
  expect(
    reduce(
      (acc, item) => acc + item,
      () => 0,
    )([1, 2, 3, 4, 5, 6]),
  ).toEqual(21);
});
test("min", () => {
  expect(min((x) => x)([4, 1, 2, 3])).toBe(1);
});

test("max async", () => {
  expect(max((x) => wrapPromise(x))([4, 1, 2, 3])).toBe(4);
});

test("reduce async", async () => {
  expect(
    await reduce(
      (acc, item) => wrapPromise(acc + item),
      () => 0,
    )([1, 2, 3, 4, 5, 6]),
  ).toEqual(21);
});

test("min", () => {
  expect(min((x) => x)([4, 1, 2, 3])).toBe(1);
});

test("max async", () => {
  expect(max((x) => wrapPromise(x))([4, 1, 2, 3])).toBe(4);
});
