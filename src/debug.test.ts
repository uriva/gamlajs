import { assert, asyncTimeit, timeit } from "./debug.ts";
import {
  assertSpyCall,
  assertSpyCalls,
  spy,
} from "https://deno.land/std@0.195.0/testing/mock.ts";

import { assertThrows } from "https://deno.land/std@0.174.0/testing/asserts.ts";
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
  await asyncTimeit(
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
  await asyncTimeit(
    (_1, _2, result) => logSpy(`slept and returned ${result}`),
    f,
  )({ a: 1, b: 2, c: 3 });
  assertSpyCall(logSpy, 0, { args: ["slept and returned 6"] });
  assertSpyCalls(logSpy, 1);
});

Deno.test("assert", () => {
  const err = "not greater than 7";
  assertThrows(() => {
    assert((x: number) => x > 7, err)(3);
  });
  assert((x: number) => x > 7, err)(10);
});
