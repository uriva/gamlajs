import { AsyncFunction } from "./typing.ts";
import { sleep } from "./time.ts";

export const withLock = <Function extends AsyncFunction>(
  lock: () => void | Promise<void>,
  unlock: () => void | Promise<void>,
  f: Function,
) =>
async (
  ...args: Parameters<Function>
): Promise<Awaited<ReturnType<Function>>> => {
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
  <Key>(set: (_: Key) => boolean | Promise<boolean>) => (id: Key) =>
    retry(() => set(id));

export const withLockByInput = <Function extends AsyncFunction>(
  argsToLockId: (..._: Parameters<Function>) => string,
  lock: (_: string) => Promise<void>,
  unlock: (_: string) => Promise<void>,
  f: Function,
) =>
(...args: Parameters<Function>) => {
  const lockId = argsToLockId(...args);
  return withLock(
    () => lock(lockId),
    () => unlock(lockId),
    f,
  )(...args);
};
export const sequentialized = <Function extends AsyncFunction>(f: Function) => {
  type QueueElement = [
    Parameters<Function>,
    (_: Awaited<ReturnType<Function>>) => void,
    // deno-lint-ignore no-explicit-any
    (_: any) => void,
  ];
  const queue: QueueElement[] = [];
  const lock = { isLocked: false };
  return (...args: Parameters<Function>) =>
    // deno-lint-ignore no-async-promise-executor
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

export const throttle = <Function extends AsyncFunction>(
  maxParallelism: number,
  f: Function,
) => {
  const lockObj = { count: 0 };
  return withLock(
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
