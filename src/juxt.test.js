import { alljuxt, anyjuxt, juxt, juxtCat, pairRight } from "./juxt.js";

import { map } from "./map.js";
import { multiply } from "./math.js";
import { pipe } from "./composition.js";
import { wrapPromise } from "./promise.ts";

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

test("anyjuxt", () => {
  expect(
    anyjuxt(
      (x) => x > 7,
      (x) => x > 1,
    )(3),
  ).toBeTruthy();
  expect(
    anyjuxt(
      (x) => x > 7,
      (x) => x > 1,
    )(0),
  ).toBeFalsy();
});

test("alljuxt", () => {
  expect(
    alljuxt(
      (x) => x > 7,
      (x) => x > 1,
    )(10),
  ).toBeTruthy();
  expect(
    alljuxt(
      (x) => x > 7,
      (x) => x > 1,
    )(3),
  ).toBeFalsy();
});
