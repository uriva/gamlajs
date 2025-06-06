import {
  assertSpyCall,
  assertSpyCalls,
  spy,
} from "https://deno.land/std@0.213.0/testing/mock.ts";
import { assert, timeit, tryCatch } from "./debug.ts";

import { assertEquals, assertThrows } from "std-assert";
import { sleep } from "./time.ts";
import { throwerCatcherWithValue } from "./index.ts";
import { pipe } from "./composition.ts";

Deno.test("timeit", () => {
  const logger = (x: string) => console.log(x);
  const logSpy = spy(logger);
  timeit(
    (_, [n1, n2]) => logSpy(`took some time to run ${n1}^${n2}`),
    Math.pow,
  )(2, 1000);
  assertSpyCall(logSpy, 0, { args: ["took some time to run 2^1000"] });
  assertSpyCalls(logSpy, 1);
});

Deno.test("asyncTimeit", async () => {
  const logSpy = spy(console.log);
  await timeit(
    (_, [time]) => logSpy(`slept for ${time}ms`),
    sleep,
  )(100);
  assertSpyCall(logSpy, 0, { args: ["slept for 100ms"] });
  assertSpyCalls(logSpy, 1);
});

Deno.test("asyncTimeit with args", async () => {
  const logSpy = spy(console.log);
  const f = async ({ a, b, c }: Record<string, number>) => {
    await sleep(100);
    return a + b + c;
  };
  await timeit(
    (_1, _2, result) => logSpy(`slept and returned ${result}`),
    f,
  )({ a: 1, b: 2, c: 3 });
  assertSpyCall(logSpy, 0, { args: ["slept and returned 6"] });
  assertSpyCalls(logSpy, 1);
});

Deno.test("assert", () => {
  const err = "not greater than 7";
  const condition = (x: number) => x > 7;
  assertThrows(() => {
    assert(condition, err)(3);
  });
  assert(condition, err)(10);
});

const _assertTyping: number = pipe(
  (x: number) => x,
  assert((x: number) => x > 3, "bla"),
)(7);

Deno.test("assert async", async () => {
  const err = "not greater than 7";
  const condition = (x: number) => Promise.resolve(x > 7);
  let thrown = false;
  try {
    await assert(condition, err)(3);
  } catch (_) {
    thrown = true;
  }
  assertEquals(thrown, true);
  await assert(condition, err)(10);
});

Deno.test("tryCatch", () => {
  const f = (x: number) => {
    x = x + 3;
    // @ts-expect-error should throw
    return 7 + x.does.not.exist;
  };
  assertThrows(() => {
    f(3);
  });
  assertEquals(tryCatch((_e, _: number) => null)(f)(3), null);
});

Deno.test("tryCatch async", async () => {
  const f = (x: number) =>
    new Promise((resolve) => {
      x = x + 3;
      // @ts-expect-error should throw
      resolve(7 + x.does.not.exist);
    });
  try {
    await f(3);
    assertEquals(false, true);
  } catch {
    // Thrown successfully.
  }
  assertEquals(await tryCatch((_, _1: number) => null)(f)(3), null);
});

Deno.test("thrower catcher with value", async () => {
  const { thrower, catcher } = throwerCatcherWithValue<string>();
  const expectation = "hello";
  let result = "";
  const fAsync = (_: string) => {
    thrower(expectation);
    return Promise.resolve("bla");
  };
  const fAsyncCaught = catcher((x: string) => {
    result = x;
    return Promise.resolve(7);
  })(fAsync);
  const _value: string | number = await fAsyncCaught("input");
  assertEquals(result, expectation);
});

const { catcher } = throwerCatcherWithValue<string>();
const f = catcher((_: string) => 7)((_: string) => {
  return Promise.resolve("bla");
});
// @ts-expect-error detects bad type, should be a Promise<string | number>
const _badTyping: Promise<string> = f("hello");
// @ts-expect-error detects bad type, should be a Promise<string|number
const _detectAsync: string | number = f("hello there");
const _nonNotAsync: number | null = catcher(() => null)((_: string) => 1)(
  "hello",
);
const _: () => Promise<string> = tryCatch(() => "")(() => Promise.resolve(""));
