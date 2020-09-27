const {
  sleep,
  withLock,
  makeLockUnlockWithId,
  withLockByInput,
} = require("./lock");
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
