import { complement, compose, identity, pipe } from "./composition.ts";

import { multiply } from "./math.ts";
import { not } from "./operator.ts";
import { wrapPromise } from "./promise.ts";
import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
import { AsyncFunction } from "./typing.ts";

Deno.test("pipe with async functions", async () => {
  assertEquals(
    await pipe(wrapPromise<number>, (input: number) => wrapPromise(input * 2))(
      2,
    ),
    4,
  );
});

Deno.test("compose applies functions in correct order", () => {
  assertEquals(
    compose((x: number) => x + 1, multiply(10))(1),
    11,
  );
});

Deno.test("complement", () => {
  assertEquals(complement(identity<boolean>)(true), false);
  assertEquals(complement(not)(true), true);
});

Deno.test("pipe is able to mix sync and async functions", async () => {
  assertEquals(
    await pipe(
      (x: number) => x + 1,
      (x: number) => wrapPromise(x),
      (x: number) => x + 2,
    )(1),
    4,
  );
});

pipe(
  // @ts-expect-error: first function returns a number, second expects a string
  (x: number) => x + 1,
  (x: string) => x.length,
);

pipe(
  (x: string) => x + "a",
  (x: string) => x.length,
);

pipe((x: number) => x + 1)(1);

// @ts-expect-error: string given to a number expecting function
pipe((x: number) => x + 1)("asd");

pipe(
  (x: string) => Promise.resolve(x + "a"),
  (x: string) => x.length,
);

pipe(
  // @ts-expect-error: keeps type check even within a promise
  (x: string) => Promise.resolve(x + "a"),
  (x: number) => x + 1,
);

// @ts-expect-error: infers correctly if the pipe is async
((_: AsyncFunction) => {})(pipe((x: boolean) => !!x, not));
((_: AsyncFunction) => {})(pipe((x: boolean) => Promise.resolve(!!x), not));
