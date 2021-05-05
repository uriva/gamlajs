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
  unset,
];

export const withLockByInput = (argsToLockId, lock, unlock, f) => (...args) => {
  const lockId = argsToLockId(...args);
  return withLock(
    () => lock(lockId),
    () => unlock(lockId),
    f
  )(...args);
};

export const sequentialized = (f) => {
  const queue = [];
  const lock = { isLocked: false };

  return (...args) =>
    new Promise(async (resolve, reject) => {
      // eslint-disable-line no-async-promise-executor
      queue.push([args, resolve, reject]);

      if (lock.isLocked) return;

      lock.isLocked = true;

      while (queue.length) {
        const [args, resolve, reject] = queue.shift();
        try {
          resolve(await f(...args));
        } catch (e) {
          reject(e);
        }
      }

      lock.isLocked = false;
    });
};
