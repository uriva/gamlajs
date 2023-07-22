import { max, min, reduce } from "./reduce.js";

import { wrapPromise } from "./promise.ts";

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

test("max call stack is not a limit on array size", () => {
  const bigArray = [];
  const size = 1000000;
  for (let i = 0; i < size; i++) {
    bigArray.push(i);
  }
  expect(max((x) => x)(bigArray)).toBe(size - 1);
});
