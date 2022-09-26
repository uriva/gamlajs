import { juxt, juxtCat, pairRight } from "./juxt";

import { map } from "./map";
import { multiply } from "./math";
import { pipe } from "./composition";
import { wrapPromise } from "./promise";

test("async juxt", async () => {
  expect(
    await juxt(wrapPromise, pipe(map(multiply(2)), wrapPromise))([2]),
  ).toEqual([[2], [4]]);
});

test("juxt non unary", () => {
  expect(
    juxt(
      (x, y) => x - y,
      (x, y) => x + y,
    )(3, 2),
  ).toEqual([1, 5]);
});

test("juxtCat", async () => {
  expect(
    await juxtCat(
      (x) => wrapPromise([x, x + 1]),
      (x) => wrapPromise([x + 2, x + 3]),
    )(1),
  ).toStrictEqual([1, 2, 3, 4]);
});

test("async pairRight", async () => {
  expect(await pairRight((x) => wrapPromise(x * 2))(5)).toStrictEqual([5, 10]);
});