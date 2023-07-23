import { alljuxt, anyjuxt, juxt, juxtCat, pairRight } from "./juxt.ts";

import { map } from "./map.ts";
import { multiply } from "./math.ts";
import { pipe } from "./composition.ts";
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
      (x: number) => wrapPromise([x, x + 1]),
      (x: number) => wrapPromise([x + 2, x + 3]),
    )(1),
  ).toStrictEqual([1, 2, 3, 4]);
});

test("async pairRight", async () => {
  expect(await pairRight((x) => wrapPromise(x * 2))(5)).toStrictEqual([5, 10]);
});

test("anyjuxt", () => {
  expect(
    anyjuxt(
      (x: number) => x > 7,
      (x: number) => x > 1,
    )(3),
  ).toBeTruthy();
  expect(
    anyjuxt(
      (x: number) => x > 7,
      (x: number) => x > 1,
    )(0),
  ).toBeFalsy();
});

test("alljuxt", () => {
  expect(
    alljuxt(
      (x: number) => x > 7,
      (x: number) => x > 1,
    )(10),
  ).toBeTruthy();
  expect(
    alljuxt(
      (x: number) => x > 7,
      (x: number) => x > 1,
    )(3),
  ).toBeFalsy();
});
