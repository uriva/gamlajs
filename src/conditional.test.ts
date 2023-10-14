import { cond, ifElse, unless, when } from "./conditional.ts";

import { assertEquals } from "https://deno.land/std@0.174.0/testing/asserts.ts";
import { pipe } from "./index.ts";
import { wrapPromise } from "./promise.ts";

Deno.test("ifElse async", async () => {
  const testFunction = ifElse(
    (x) => wrapPromise(x === 2),
    (_) => true,
    (_) => false,
  );
  assertEquals(await testFunction(2), true);
  assertEquals(await testFunction(3), false);
});

Deno.test("unless async", async () => {
  const testFunction = unless(
    (x: number) => wrapPromise(x === 2),
    () => true,
  );
  assertEquals(await testFunction(2), 2);
  assertEquals(await testFunction(3), true);
});

Deno.test("when async", async () => {
  const testFunction = when(
    (x: number) => wrapPromise(x === 2),
    () => true,
  );
  assertEquals(await testFunction(2), true);
  assertEquals(await testFunction(3), 3);
});

Deno.test("cond", () => {
  const testFunction = cond([
    [(x: number) => x > 3, (x: number) => x + 1],
    [(x: number) => x < 3, (x: number) => x - 1],
  ]);
  assertEquals(testFunction(2), 1);
  assertEquals(testFunction(4), 5);
});

Deno.test("async cond", async () => {
  const testFunction = cond([
    [(x: number) => x > 3, (x: number) => Promise.resolve(x + 1)],
    [(x: number) => x < 3, (x: number) => x - 1],
  ]);
  const checkTyping: Promise<number> | number = testFunction(2);
  assertEquals(await checkTyping, 1);
  assertEquals(await testFunction(4), 5);
});

((_: Promise<boolean>) => {})(
  ifElse(
    (x) => wrapPromise(x === 2),
    (_) => true,
    (_) => false,
  )(2),
);

((_: Promise<string>) => {})(
  // @ts-expect-error typing mismatch
  ifElse(
    (x) => wrapPromise(x === 2),
    (_) => true,
    (_) => false,
  )(2),
);

pipe(
  // @ts-expect-error the function after needs to handle the `null` case.
  ifElse((x: number) => x > 7, (x: number) => x + 1, (_) => null),
  (x: number) => x,
);

const _ = async () => {
  const _1: number = when((x: number) => x < 3, (x: number) => x + 1)(4);
  const _2: number = await unless(
    (x: number) => Promise.resolve(x < 3),
    (x: number) => x + 1,
  )(4);
  // @ts-expect-error should infer typing
  const _3: string = await unless(
    (x: number) => Promise.resolve(x < 3),
    (x: number) => x + 1,
  )(4);
};

// Check if all constituents are sync, so is the `ifElse`.
((_: string) => {})(
  ifElse((x: number) => x === 2, (_: number) => "hi", (_: number) => "bye")(2),
);
