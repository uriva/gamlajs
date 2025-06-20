import { assert, assertEquals } from "std-assert";
import { rateLimit, sequentialized, throttle } from "./lock.ts";

import { map } from "./map.ts";
import { sleep } from "./time.ts";

const pushToArrayAfterMs = (arr: number[]) => async (ms: number) => {
  await sleep(ms);
  arr.push(ms);
};

Deno.test("lock", async () => {
  const results1: number[] = [];
  const f = throttle(1)(pushToArrayAfterMs(results1));
  const results2: number[] = [];
  await Promise.all([f(300), f(100)]);
  await Promise.all([
    pushToArrayAfterMs(results2)(300),
    pushToArrayAfterMs(results2)(100),
  ]);
  assertEquals(results1, [300, 100]);
  assertEquals(results2, [100, 300]);
});

Deno.test("lock with exception", async () => {
  let shouldThrow = false;
  const func = throttle(1)(
    (x) => {
      shouldThrow = !shouldThrow;
      if (!shouldThrow) {
        throw new Error("Error!");
      }
      return x;
    },
  );
  const result = await map(async (x) => {
    try {
      return await func(x);
    } catch (_) {
      return 0;
    }
  })([1, 1, 1, 1]);
  assertEquals(result, [1, 0, 1, 0]);
});

Deno.test("sequentialized", async () => {
  const arr: number[] = [];
  const f = async (a: number) => {
    await sleep(a);
    arr.push(a);
  };
  const f_sec = sequentialized(f);
  await Promise.all([f_sec(100), f_sec(10)]);

  assertEquals(arr, [100, 10]);
});

Deno.test("throttle", async () => {
  let maxConcurrent = 0;
  let insideNow = 0;
  const enter = () => {
    insideNow++;
    maxConcurrent = Math.max(maxConcurrent, insideNow);
  };
  const exit = () => {
    insideNow--;
  };
  const mapFn = async (x: number) => {
    enter();
    await sleep(0.01);
    exit();
    return x;
  };
  const maxParallelism = 1;
  await map(throttle(maxParallelism)(mapFn))([1, 2, 3]);
  assertEquals(maxConcurrent, maxParallelism);
});

Deno.test("rate limiter by # calls", async () => {
  const timeWindowMs = 1000;
  const rateLimitedFunction = rateLimit({
    maxCalls: 2,
    maxWeight: 100,
    timeWindowMs,
    weight: (args: number) => args,
    f: (value: number) => Promise.resolve(value),
    key: () => "testKey",
  });
  const tasks = [5, 3, 10];
  const startTime = Date.now();
  assertEquals(await Promise.all(tasks.map(rateLimitedFunction)), tasks);
  assert(Date.now() - startTime >= timeWindowMs);
});

Deno.test("rate limiter by weight", async () => {
  const timeWindowMs = 1000;
  const rateLimitedFunction = rateLimit({
    maxCalls: 3,
    maxWeight: 15,
    timeWindowMs,
    weight: (args: number) => args,
    key: () => "testKey",
    f: (value: number) => Promise.resolve(value),
  });
  const tasks = [5, 3, 10];
  const startTime = Date.now();
  assertEquals(await Promise.all(tasks.map(rateLimitedFunction)), tasks);
  assert(Date.now() - startTime >= timeWindowMs);
});
