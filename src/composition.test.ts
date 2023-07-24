import { complement, compose, identity, pipe } from "./composition.ts";

import { multiply } from "./math.ts";
import { not } from "./operator.ts";
import { wrapPromise } from "./promise.ts";
import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";

Deno.test("pipe with async functions", async () => {
  assertEquals(
    await pipe(wrapPromise<number>, (input: number) => wrapPromise(input * 2))(
      2,
    ),
    4,
  );
});

Deno.test("compose applies functions in correct order", () => {
  assertEquals(compose((x: number) => x + 1, multiply(10))(1), 11);
});

Deno.test("complement", () => {
  assertEquals(complement(identity)(true), false);
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
