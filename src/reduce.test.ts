import { max, min, reduce } from "./reduce.ts";

import { wrapPromise } from "./promise.ts";

test("reduce", () => {
  const additionReducer = (acc: number, item: number) => acc + item;
  expect(
    reduce<number, number, false>(additionReducer, () => 0)([1, 2, 3, 4, 5, 6]),
  ).toEqual(21);
});
test("min", () => {
  expect(min<number>((x) => x)([4, 1, 2, 3])).toBe(1);
});

test("max async", () => {
  expect(max<number>((x) => wrapPromise(x))([4, 1, 2, 3])).toBe(4);
});

test("reduce async", async () => {
  const delayedAddition = (acc: number, item: number): Promise<number> =>
    wrapPromise(acc + item);
  expect(
    await reduce<number, number, true>(
      delayedAddition,
      () => 0,
    )([1, 2, 3, 4, 5, 6]),
  ).toEqual(21);
});

test("min", () => {
  expect(min<number>((x) => x)([4, 1, 2, 3])).toBe(1);
});

test("max async", () => {
  expect(max<number>((x) => wrapPromise(x))([4, 1, 2, 3])).toBe(4);
});

test("max call stack is not a limit on array size", () => {
  const bigArray = [];
  const size = 1000000;
  for (let i = 0; i < size; i++) {
    bigArray.push(i);
  }
  expect(max<number>((x) => x)(bigArray)).toBe(size - 1);
});
