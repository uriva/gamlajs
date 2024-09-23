import {
  complement,
  compose,
  identity,
  pipe,
  sideEffect,
} from "./composition.ts";

import { assertEquals } from "std-assert";
import { multiply } from "./math.ts";
import { not } from "./operator.ts";
import { wrapPromise } from "./promise.ts";
import type { AsyncFunction } from "./typing.ts";
import { sleep } from "./time.ts";

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

pipe(
  (x: string) => x,
  (x: string) => Promise.resolve(x),
  (x: string) => x,
)("a").then();

// Check generics work as well.
const _1 = <T, Fn extends (x: T) => number>(f: Fn) => {
  pipe((x: T) => x, f);
};

// limitation of type system
// const _2 = <Fn extends (x: string) => number>(f: Fn) => {
//   // @ts-expect-error first function does not match second
//   pipe((x: number) => x, f);
// };

Deno.test("side effect", () => {
  assertEquals(sideEffect((x) => console.log(x))(7), 7);
});

Deno.test("side effect order of runs", async () => {
  const runOrder: string[] = [];
  const f = async (x: number) => {
    await sleep(1);
    runOrder.push("f");
    return x;
  };
  const g = async (x: number) => {
    await sleep(0);
    runOrder.push("g");
    return x;
  };
  // Check it keeps type.
  const sideEffectF: typeof f = sideEffect(f);
  assertEquals(await pipe(sideEffectF, g)(7), 7);
  assertEquals(runOrder, ["f", "g"]);
});
