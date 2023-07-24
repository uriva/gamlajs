import { sleep } from "./time.ts";

export const withLock =
  <Args extends any[]>(
    lock: () => void | Promise<void>,
    unlock: () => void | Promise<void>,
    f: (..._: Args) => any,
  ) =>
  async (...args: Args) => {
    await lock();
    try {
      const result = await f(...args);
      await unlock();
      return result;
    } catch (e) {
      await unlock();
      throw e;
    }
  };

export const retry = async (f: () => boolean | Promise<boolean>) => {
  while (!(await f())) {
    await sleep(50);
  }
};

export const makeLockWithId =
  <Key>(set: (_: Key) => boolean | Promise<boolean>) =>
  (id: Key) =>
    retry(() => set(id));

export const withLockByInput =
  <Args extends any[]>(
    argsToLockId: (..._: Args) => string,
    lock: (_: string) => Promise<void>,
    unlock: (_: string) => Promise<void>,
    f: (..._: Args) => any,
  ) =>
  (...args: Args) => {
    const lockId = argsToLockId(...args);
    return withLock(
      () => lock(lockId),
      () => unlock(lockId),
      f,
    )(...args);
  };
export const sequentialized = <Args extends any[]>(f: (..._: Args) => any) => {
  type QueueElement = [Args, (_: any) => void, (_: any) => void];
  const queue: QueueElement[] = [];
  const lock = { isLocked: false };

  return (...args: Args) =>
    // eslint-disable-next-line no-async-promise-executor
    new Promise(async (resolve, reject) => {
      queue.push([args, resolve, reject]);

      if (lock.isLocked) return;

      lock.isLocked = true;

      while (queue.length) {
        const [args, resolve, reject] = queue.shift() as QueueElement;
        try {
          resolve(await f(...args));
        } catch (e) {
          reject(e);
        }
      }

      lock.isLocked = false;
    });
};

export const throttle = <Args extends any[]>(
  maxParallelism: number,
  f: (..._: Args) => any,
) => {
  const lockObj = { count: 0 };
  return withLock<Args>(
    () =>
      retry(() => {
        if (lockObj.count < maxParallelism) {
          lockObj.count++;
          return true;
        }
        return false;
      }),
    () => {
      lockObj.count--;
    },
    f,
  );
};
