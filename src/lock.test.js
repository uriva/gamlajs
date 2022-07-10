const {
  withLock,
  makeLockUnlockWithId,
  withLockByInput,
  sequentialized,
  throttle,
} = require("./lock");
const { sleep } = require("./time");
const { asyncMap } = require("./functional");
const { identity } = require("ramda");

const pushToArrayAfterMs = (arr) => async (key, ms) => {
  await sleep(ms);
  arr.push(ms);
};

test("test lock", async () => {
  const lockObj = {};

  const [lock, unlock] = makeLockUnlockWithId(
    async () => {
      await sleep(50);
      if (lockObj.locked) {
        return false;
      }
      lockObj.locked = true;
      return true;
    },
    async () => {
      await sleep(50);
      lockObj.locked = false;
      return true;
    }
  );

  const results1 = [];
  const f = withLock(lock, unlock, pushToArrayAfterMs(results1));

  expect.assertions(2);

  const results2 = [];
  await Promise.all([f("", 300), f("", 100)]);
  await Promise.all([
    pushToArrayAfterMs(results2)("", 300),
    pushToArrayAfterMs(results2)("", 100),
  ]);
  expect(results1).toStrictEqual([300, 100]);
  expect(results2).toStrictEqual([100, 300]);
});

test("test lock by input", async () => {
  const lockObj = {};

  const [lock, unlock] = makeLockUnlockWithId(
    async (id) => {
      await sleep(50);
      if (lockObj[id]) {
        return false;
      }
      lockObj[id] = true;
      return true;
    },
    async (id) => {
      await sleep(50);
      lockObj[id] = false;
    }
  );

  expect.assertions(2);
  const results1 = [];
  const f1 = withLockByInput(
    identity,
    lock,
    unlock,
    pushToArrayAfterMs(results1)
  );
  const results2 = [];
  const f2 = withLockByInput(
    identity,
    lock,
    unlock,
    pushToArrayAfterMs(results2)
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
  const [lock, unlock] = makeLockUnlockWithId(
    () => {
      if (locked) {
        return false;
      }
      locked = true;
      return locked;
    },
    async () => {
      await sleep(0.01);
      locked = false;
    }
  );

  const func = withLock(lock, unlock, (x) => {
    shouldThrow = !shouldThrow;
    if (!shouldThrow) {
      throw new Error("Error!");
    }
    return x;
  });

  const result = await asyncMap(
    async (x) => {
      try {
        return await func(x);
      } catch (e) {
        return 0;
      }
    },
    [1, 1, 1, 1]
  );

  expect(result).toEqual([1, 0, 1, 0]);
});

test("sequentialized", async () => {
  const arr = [];
  const f = async (a) => {
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

  const mapFn = async (x) => {
    enter();
    await sleep(0.01);
    exit();
    return x;
  };

  await asyncMap(throttle(1, mapFn))([1, 2, 3]);
  expect(maxConcurrent).toEqual(1);
});
