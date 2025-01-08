import { sleep } from "./time.ts";
import type { AsyncFunction } from "./typing.ts";

const withLock = <F extends AsyncFunction>(
  lock: (...task: Parameters<F>) => void | Promise<void>,
  unlock: (...task: Parameters<F>) => void | Promise<void>,
  f: F,
): F =>
  (async (...args: Parameters<F>) => {
    await lock(...args);
    try {
      return await f(...args);
    } finally {
      await unlock(...args);
    }
  }) as F;

export const keepTryingEvery50ms = async (
  f: () => boolean | Promise<boolean>,
) => {
  while (!(await f())) {
    await sleep(50);
  }
};

export const sequentialized = <F extends AsyncFunction>(f: F) => {
  type QueueElement = [
    Parameters<F>,
    (_: Awaited<ReturnType<F>>) => void,
    // deno-lint-ignore no-explicit-any
    (_: any) => void,
  ];
  const queue: QueueElement[] = [];
  const lock = { isLocked: false };
  return (...args: Parameters<F>) =>
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

export const rateLimit = <F extends AsyncFunction>(
  maxCalls: number,
  maxWeight: number,
  timeWindowMs: number,
  weight: (...args: Parameters<F>) => number,
  f: F,
): F => {
  let history: { timestamp: number; weight: number }[] = [];
  return withLock(
    (...task: Parameters<F>) =>
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

const semaphore = (max: number) => {
  let counter = 0;
  const waiting: (() => void)[] = [];
  const take = () => {
    if (waiting.length > 0 && counter < max) {
      counter++;
      waiting.shift()!();
    }
  };
  const acquire = () => {
    if (counter < max) {
      counter++;
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      waiting.push(resolve);
    });
  };
  const release = () => {
    counter--;
    take();
  };
  return { acquire, release } satisfies {
    acquire: () => Promise<void>;
    release: () => void;
  };
};

export const throttle = (max: number) => {
  const { acquire, release } = semaphore(max);
  // @ts-expect-error too complex
  return <F extends AsyncFunction>(f: F): F => async (...args) => {
    await acquire();
    try {
      return await f(...args);
    } finally {
      release();
    }
  };
};
