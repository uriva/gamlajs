import {
  assertSpyCall,
  assertSpyCalls,
  spy,
} from "https://deno.land/std@0.213.0/testing/mock.ts";
import { assert, timeit, tryCatch } from "./debug.ts";

import { assertEquals, assertThrows } from "std-assert";
import { sleep } from "./time.ts";

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
    return (7 + x.does.not.exist);
  };
  assertThrows(() => {
    f(3);
  });
  assertEquals(tryCatch(f, () => null)(3), null);
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
  assertEquals(await tryCatch(f, () => null)(3), null);
});

const _: () => Promise<string> = tryCatch(() => Promise.resolve(""), () => "");
