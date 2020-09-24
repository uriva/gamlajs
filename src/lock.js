export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const withLock = (lock, unlock, f) => async (...args) => {
  await lock();
  const result = await f(...args);
  await unlock();
  return result;
};

export const makeLockUnlockWithId = (set, unset) => [
  async (id) => {
    while (!(await set(id))) {
      await sleep(50);
    }
  },
  (id) => unset(id),
];

export const withLockByInput = (argsToLockId, lock, unlock, f) => (...args) => {
  const lockId = argsToLockId(...args);
  return withLock(
    () => lock(lockId),
    () => unlock(lockId),
    f
  )(...args);
};
