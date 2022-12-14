import { complement, compose, identity, pipe, uncurry } from "./composition.js";

import { multiply } from "./math.js";
import { not } from "./operator.js";
import { wrapPromise } from "./promise.js";

test("pipe with async functions", async () => {
  expect(await pipe(wrapPromise, (input) => wrapPromise(input * 2))(2)).toBe(4);
});

test("compose applies functions in correct order", () => {
  expect(compose((x) => x + 1, multiply(10))(1)).toBe(11);
});

test("complement", () => {
  expect(complement(identity)(true)).toBeFalsy();
  expect(complement(not)(true)).toBeTruthy();
});

test("pipe is able to mix sync and async functions", async () => {
  expect(
    await pipe(
      (x) => x + 1,
      (x) => wrapPromise(x),
      (x) => x + 2,
    )(1),
  ).toBe(4);
});

test("uncurry", () => {
  const f = (x) => (y) => (z) => x + y + z;
  expect(uncurry(f)(1, 2, 3)).toEqual(6);
});
