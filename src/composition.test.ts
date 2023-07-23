import { complement, compose, identity, pipe } from "./composition.ts";

import { multiply } from "./math.ts";
import { not } from "./operator.ts";
import { wrapPromise } from "./promise.ts";

test("pipe with async functions", async () => {
  expect(
    await pipe(wrapPromise<number>, (input: number) => wrapPromise(input * 2))(
      2,
    ),
  ).toBe(4);
});

test("compose applies functions in correct order", () => {
  expect(compose((x: number) => x + 1, multiply(10))(1)).toBe(11);
});

test("complement", () => {
  expect(complement(identity)(true)).toBeFalsy();
  expect(complement(not)(true)).toBeTruthy();
});

test("pipe is able to mix sync and async functions", async () => {
  expect(
    await pipe(
      (x: number) => x + 1,
      (x: number) => wrapPromise(x),
      (x: number) => x + 2,
    )(1),
  ).toBe(4);
});
