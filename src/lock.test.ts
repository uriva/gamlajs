import {
  makeLockWithId,
  retry,
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

test("lock", async () => {
  const lockObj = { locked: false };
  const results1: number[] = [];
  const f = withLock(
    () =>
      retry(async () => {
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
  expect(results1).toStrictEqual([300, 100]);
  expect(results2).toStrictEqual([100, 300]);
});

test("lock by input", async () => {
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
  const f1 = withLockByInput<[string, number]>(
    (x: string) => x,
    lock,
    unlock,
    (_, ms) => pushToArrayAfterMs(results1)(ms),
  );
  const results2: number[] = [];
  const f2 = withLockByInput<[string, number]>(
    (x: string) => x,
    lock,
    unlock,
    (_, ms) => pushToArrayAfterMs(results2)(ms),
  );
  // Test locking on different inputs (Should not lock in this case).
  await Promise.all([f1("key1", 300), f1("key2", 100)]);
  // Test locking on same input.
  await Promise.all([f2("key1", 300), f2("key1", 100)]);
  expect(results1).toStrictEqual([100, 300]);
  expect(results2).toStrictEqual([300, 100]);
});

test("lock with exception", async () => {
  let locked = false;
  let shouldThrow = false;
  const unlock = async () => {
    await sleep(0.01);
    locked = false;
  };

  const func = withLock(
    () =>
      retry(() => {
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
    } catch (e) {
      return 0;
    }
  })([1, 1, 1, 1]);

  expect(result).toEqual([1, 0, 1, 0]);
});

test("sequentialized", async () => {
  const arr: number[] = [];
  const f = async (a: number) => {
    await sleep(a);
    arr.push(a);
  };
  const f_sec = sequentialized(f);
  await Promise.all([f_sec(100), f_sec(10)]);

  expect(arr).toStrictEqual([100, 10]);
});

test("throttle", async () => {
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
  expect(maxConcurrent).toEqual(1);
});
