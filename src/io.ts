import { sha256 } from "@noble/hashes/sha2.js";
import { encodeHex } from "@std/encoding";
import stableHash from "stable-hash";
import { pipe } from "./composition.ts";
import { juxt, stack } from "./juxt.ts";
import { map } from "./map.ts";
import { applySpec } from "./mapping.ts";
import { prop, spread } from "./operator.ts";
import { sleep } from "./time.ts";
import type { AsyncFunction, ElementOf } from "./typing.ts";

type Executor<TaskInput, Output> = (_: TaskInput[]) => Promise<Output>;
const executeTasks = <TaskInput, Output>(
  execute: Executor<TaskInput, Output>,
) =>
  pipe(
    // @ts-expect-error reason: pipe can't figure out the typing here.
    applySpec({
      input: map(prop<Task<TaskInput, Output>>()("input")),
      reject: pipe(
        map(prop<Task<TaskInput, Output>>()("reject")),
        spread(juxt),
      ),
      resolve: pipe(
        map(prop<Task<TaskInput, Output>>()("resolve")),
        spread(stack),
      ),
    }),
    async ({ input, resolve, reject }: Task<TaskInput[], Output>) => {
      try {
        resolve(await execute(input));
      } catch (e) {
        reject(e);
      }
    },
  );

type Task<TaskInput, Output> = {
  resolve: (_: Output) => void;
  reject: (_: unknown) => void;
  input: TaskInput;
};

/**
 * Queues the `execute` function until the condition is met or `maxWaitTime` has passed.
 * Once one of the above happens we flush the queue and run the execute functions
 */
/** Batch inputs by key and flush by size/time predicate. */
export const batch = <
  TaskKey extends string | number | symbol,
  TaskInput,
  Output,
>(
  keyFn: (_: TaskInput) => TaskKey,
  maxWaitMilliseconds: number,
  execute: Executor<TaskInput, Output>,
  condition: (_: TaskInput[]) => boolean,
): (
  input: TaskInput,
) => Promise<ElementOf<Output>> => {
  const keyToTasks: Record<TaskKey, Task<TaskInput, Output>[]> = {} as Record<
    TaskKey,
    Task<TaskInput, Output>[]
  >;

  type Timeout = ReturnType<typeof setTimeout>;

  const keyToTimeout: Record<TaskKey, Timeout> = {} as Record<TaskKey, Timeout>;

  const clearAndExecute = (key: TaskKey) => {
    // @ts-expect-error not sure what's wrong here
    executeTasks(execute)(keyToTasks[key]);
    clearTimeout(keyToTimeout[key]);
    delete keyToTimeout[key];
    delete keyToTasks[key];
  };

  return (input: TaskInput): Promise<ElementOf<Output>> =>
    new Promise((resolve, reject) => {
      const key = keyFn(input);
      keyToTasks[key] = [
        ...((keyToTasks[key] || []) as Task<TaskInput, Output>[]),
        { resolve, reject, input },
      ] as Task<TaskInput, Output>[];
      if (
        pipe(
          map(prop<Task<TaskInput, Output>>()("input")),
          condition,
        )(keyToTasks[key])
      ) {
        clearAndExecute(key);
      } else {
        clearTimeout(keyToTimeout[key]);
        keyToTimeout[key] = setTimeout(
          () => clearAndExecute(key),
          maxWaitMilliseconds,
        );
      }
    });
};

const catchSpecificError = (error: Error) =>
// deno-lint-ignore no-explicit-any
<F extends AsyncFunction, G extends (...args: Parameters<F>) => any>(
  fallback: G,
  f: F,
): (...args: Parameters<F>) => ReturnType<F> | ReturnType<G> =>
// @ts-expect-error cannot infer
async (...xs: Parameters<F>) => {
  try {
    return await f(...xs);
  } catch (e) {
    if (e === error) return fallback(...xs);
    throw e;
  }
};

/** Utilities to timeout a promise and catch only that timeout error. */
export const timerCatcher = (): [
  (ms: number, f: AsyncFunction) => AsyncFunction,
  <F extends AsyncFunction, G extends (...args: Parameters<F>) => unknown>(
    fallback: G,
    f: F,
  ) => (...args: Parameters<F>) => ReturnType<F> | ReturnType<G>,
] => {
  const error = new Error("Timed out");
  const catcher = catchSpecificError(error);
  const thrower = timeoutHelper(error);
  return [thrower, catcher] as [typeof thrower, typeof catcher];
};

const timeoutHelper = (error: Error) =>
<F extends AsyncFunction>(
  ms: number,
  f: F,
): F =>
// @ts-expect-error ts cannot infer
(...args: Parameters<F>) =>
  new Promise((resolve, reject) => {
    let wasResolved = false;
    let rejected = false;
    const timer = setTimeout(() => {
      if (wasResolved) return;
      rejected = true;
      reject(error);
    }, ms);
    f(...args).then((x: Awaited<ReturnType<F>>) => {
      if (rejected) return;
      clearTimeout(timer);
      wasResolved = true;
      resolve(x);
    }).catch(reject);
  });

/** Wrap an async function with a timeout. */
export const timeout: <F extends AsyncFunction>(
  ms: number,
  f: F,
) => F = timeoutHelper(new Error("Timed out"));

export const conditionalRetry =
  // deno-lint-ignore no-explicit-any
  (predicate: (e: Error) => any) =>
  <F extends AsyncFunction>(waitMs: number, times: number, f: F): F =>
    // @ts-ignore cannot infer, error only in node not in deno
    times
      // @ts-ignore cannot infer, error only in deno not in node
      ? async (...x: Parameters<F>) => {
        try {
          return await f(...x);
        } catch (e) {
          if (!predicate(e as Error)) throw e;
          return sleep(waitMs).then(() =>
            conditionalRetry(predicate)(waitMs, times - 1, f)(...x)
          );
        }
      }
      : f;

/** Retry an async function a number of times with delay. */
export const retry = <F extends AsyncFunction>(
  waitMs: number,
  times: number,
  f: F,
): F => conditionalRetry(() => true)(waitMs, times, f);

type StableHashType<T> = (value: T) => string;

/** Stable JSON-like hash truncated to maxLength. */
export const hash = <T>(x: T, maxLength: number): string =>
  encodeHex(sha256(
    new TextEncoder().encode((stableHash as unknown as StableHashType<T>)(x)),
  )).substring(0, maxLength);
