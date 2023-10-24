import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.174.0/testing/asserts.ts";
import {
  keepTryingEvery50ms,
  makeLockWithId,
  rateLimit,
  sequentialized,
  throttle,
  withLock,
  withLockByInput,
} from "./lock.ts";

import { map } from "./map.ts";
import { sleep } from "./time.ts";

const pushToArrayAfterMs = (arr: number[]) => async (ms: number) => {
  await sleep(ms);
  arr.push(ms);
};

Deno.test("lock", async () => {
  const lockObj = { locked: false };
  const results1: number[] = [];
  const f = withLock(
    () =>
      keepTryingEvery50ms(async () => {
        await sleep(50);
        if (lockObj.locked) {
          return false;
        }
        lockObj.locked = true;
        return true;
      }),
    async () => {
      await sleep(50);
      lockObj.locked = false;
    },
    pushToArrayAfterMs(results1),
  );
  const results2: number[] = [];
  await Promise.all([f(300), f(100)]);
  await Promise.all([
    pushToArrayAfterMs(results2)(300),
    pushToArrayAfterMs(results2)(100),
  ]);
  assertEquals(results1, [300, 100]);
  assertEquals(results2, [100, 300]);
});

Deno.test("lock by input", async () => {
  const lockObj: Record<string, boolean> = {};

  const unlock = async (id: string) => {
    await sleep(50);
    lockObj[id] = false;
  };
  const lock = makeLockWithId(async (id: string) => {
    await sleep(50);
    if (lockObj[id]) return false;
    lockObj[id] = true;
    return true;
  });
  const results1: number[] = [];
  const f1 = withLockByInput(
    (x: string) => x,
    lock,
    unlock,
    (_, ms) => pushToArrayAfterMs(results1)(ms),
  );
  const results2: number[] = [];
  const f2 = withLockByInput(
    (x: string) => x,
    lock,
    unlock,
    (_, ms) => pushToArrayAfterMs(results2)(ms),
  );
  // Test locking on different inputs (Should not lock in this case).
  await Promise.all([f1("key1", 300), f1("key2", 100)]);
  // Test locking on same input.
  await Promise.all([f2("key1", 300), f2("key1", 100)]);
  assertEquals(results1, [100, 300]);
  assertEquals(results2, [300, 100]);
});

Deno.test("lock with exception", async () => {
  let locked = false;
  let shouldThrow = false;
  const unlock = async () => {
    await sleep(0.01);
    locked = false;
  };

  const func = withLock(
    () =>
      keepTryingEvery50ms(() => {
        if (locked) return false;
        locked = true;
        return locked;
      }),
    unlock,
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

  await map(throttle(1, mapFn))([1, 2, 3]);
  assertEquals(maxConcurrent, 1);
});

Deno.test("rate limiter by # calls", async () => {
  const timeWindowMs = 1000;
  const rateLimitedFunction = rateLimit(
    2,
    100,
    timeWindowMs,
    (args: number) => args,
    (value: number) => Promise.resolve(value),
  );
  const results = [];
  const tasks = [5, 3, 10];
  const startTime = Date.now();
  for (const task of tasks) {
    results.push(await rateLimitedFunction(task));
  }
  const endTime = Date.now();
  assertEquals(results, tasks);
  assert(endTime - startTime >= timeWindowMs);
});

Deno.test("rate limiter by weight", async () => {
  const timeWindowMs = 1000;
  const rateLimitedFunction = rateLimit(
    3,
    15,
    timeWindowMs,
    (args: number) => args,
    (value: number) => Promise.resolve(value),
  );
  const results = [];
  const tasks = [5, 3, 10];
  const startTime = Date.now();
  for (const task of tasks) {
    results.push(await rateLimitedFunction(task));
  }
  const endTime = Date.now();
  assertEquals(results, tasks);
  assert(endTime - startTime >= timeWindowMs);
});
