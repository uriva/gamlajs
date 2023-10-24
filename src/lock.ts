import { AsyncFunction } from "./typing.ts";
import { sleep } from "./time.ts";

export const withLock = <Function extends AsyncFunction>(
  lock: (...task: Parameters<Function>) => void | Promise<void>,
  unlock: (...task: Parameters<Function>) => void | Promise<void>,
  f: Function,
): Function =>
  (async (...args: Parameters<Function>) => {
    await lock(...args);
    try {
      const result = await f(...args);
      await unlock(...args);
      return result;
    } catch (e) {
      await unlock(...args);
      throw e;
    }
  }) as Function;

export const keepTryingEvery50ms = async (
  f: () => boolean | Promise<boolean>,
) => {
  while (!(await f())) {
    await sleep(50);
  }
};

export const makeLockWithId =
  <Key>(set: (_: Key) => boolean | Promise<boolean>) => (id: Key) =>
    keepTryingEvery50ms(() => set(id));

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

const throttleByWeight = <Function extends AsyncFunction>(
  maxParallelism: number,
  weight: (...x: Parameters<Function>) => number,
  f: Function,
): Function => {
  let lockObj = 0;
  return withLock(
    (...task: Parameters<Function>) =>
      keepTryingEvery50ms(() => {
        if (lockObj < maxParallelism) {
          lockObj += weight(...task);
          return true;
        }
        return false;
      }),
    (...task: Parameters<Function>) => {
      lockObj -= weight(...task);
    },
    f,
  );
};

export const throttle = <Function extends AsyncFunction>(
  maxParallelism: number,
  f: Function,
) => throttleByWeight(maxParallelism, () => 1, f);

export const rateLimit = <Function extends AsyncFunction>(
  maxCalls: number,
  maxWeight: number,
  timeWindowMs: number,
  weight: (...args: Parameters<Function>) => number,
  f: Function,
): Function => {
  let history: { timestamp: number; weight: number }[] = [];
  return withLock(
    (...task: Parameters<Function>) =>
      keepTryingEvery50ms(() => {
        history = history.filter(({ timestamp }) =>
          timestamp > Date.now() - timeWindowMs
        );
        const currentWeight = weight(...task);
        if (currentWeight > maxWeight) {
          throw new Error(
            "A single task exceeds the weight per time window, and so will never run.",
          );
        }
        if (
          history.reduce((sum, { weight }) => sum + weight, 0) +
                currentWeight <=
            maxWeight &&
          history.length < maxCalls
        ) {
          history.push({ timestamp: Date.now(), weight: currentWeight });
          return true;
        }
        return false;
      }),
    () => {},
    f,
  );
};
