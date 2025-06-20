import { coerce } from "./debug.ts";
import type { AsyncFunction, Func } from "./typing.ts";

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

type CallRecord = { timestamp: number; weight: number };
type TaskValue<F extends Func> = {
  args: Parameters<F>;
  resolve: (_: Awaited<ReturnType<F>>) => void;
  reject: (_: unknown) => void;
};

type RateLimitHistory = Map<string, CallRecord[]>;
type Running = Map<string, boolean>;

const processQueue = <F extends Func>(
  { queue, running, history, timeWindowMs, maxWeight, maxCalls, weight, f }:
    & RateLimitParmas<F>
    & { queue: TaskValue<F>[]; running: Running; history: RateLimitHistory },
) =>
async (k: string) => {
  if (queue.length === 0) return;
  // Only one processQueue per key at a time
  if (running.get(k)) return;
  running.set(k, true);
  while (queue.length) {
    const now = Date.now();
    let records = history.get(k) || [];
    // Remove old records
    records = records.filter((r) => now - r.timestamp < timeWindowMs);
    history.set(k, records);
    const calls = records.length;
    const totalWeight = records.reduce((a, r) => a + r.weight, 0);
    const { args, resolve, reject } = queue[0];
    const w = weight(...args);
    if (calls < maxCalls && totalWeight + w <= maxWeight) {
      // Allowed, execute
      records.push({ timestamp: now, weight: w });
      history.set(k, records);
      queue.shift();
      try {
        resolve(await f(...args));
      } catch (e) {
        reject(e);
      }
    } else {
      // Not allowed, wait until earliest record expires
      let waitMs = 1;
      if (records.length) {
        waitMs = Math.max(1, timeWindowMs - (now - records[0].timestamp));
      }
      await new Promise((res) => setTimeout(res, waitMs));
    }
  }
  running.delete(k);
};

type RateLimitParmas<F extends Func> = {
  maxCalls: number;
  maxWeight: number;
  timeWindowMs: number;
  weight: (...args: Parameters<F>) => number;
  key: (...args: Parameters<F>) => string;
  f: F;
};

export const rateLimit = <F extends AsyncFunction>(
  params: RateLimitParmas<F>,
): F => {
  const history = new Map<string, CallRecord[]>();
  const queues = new Map<string, TaskValue<F>[]>();
  const running = new Map<string, boolean>();
  return ((...args: Parameters<F>) => {
    const k = params.key(...args);
    if (!queues.has(k)) queues.set(k, []);
    return new Promise<Awaited<ReturnType<F>>>((resolve, reject) => {
      const queue = coerce(queues.get(k));
      queue.push({ args, resolve, reject });
      processQueue({ ...params, queue, history, running })(k);
    });
  }) as F;
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
