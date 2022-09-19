import { compose, pipe } from "./composition";

import { multiply } from "./math";
import { wrapPromise } from "./promise";

test("test pipe", async () => {
  const result = await pipe(wrapPromise, (input) => Promise.resolve(input * 2))(
    2
  );
  expect.assertions(1);
  expect(result).toBe(4);
});

test("test compose", () => {
  const result = compose((x) => x + 1, multiply(10))(1);
  expect.assertions(1);
  expect(result).toBe(11);
});
