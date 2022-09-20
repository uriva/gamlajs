import { compose, pipe } from "./composition";

import { multiply } from "./math";
import { wrapPromise } from "./promise";

test("pipe with async functions", async () => {
  expect(await pipe(wrapPromise, (input) => wrapPromise(input * 2))(2)).toBe(4);
});

test("compose applies functions in correct order", () => {
  expect(compose((x) => x + 1, multiply(10))(1)).toBe(11);
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
