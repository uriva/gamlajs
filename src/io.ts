import { juxt, pairRight, stack } from "./juxt.ts";
import { prop, spread } from "./operator.ts";

import { applySpec } from "./mapping.ts";
import { map } from "./map.ts";
import { pipe } from "./composition.ts";

type Executor<TaskInput, Output> = (_: TaskInput[]) => Promise<Output>;

const executeTasks = <TaskInput, Output>(
  execute: Executor<TaskInput, Output>,
) =>
  pipe(
    // @ts-ignore reason: pipe can't figure out the typing here.
    applySpec({
      input: map(prop<Task<TaskInput, Output>>()("input")),
      reject: pipe(
        map(prop<Task<TaskInput, Output>>()("reject")),
        // @ts-ignore reason: TODO - fix typing
        spread(juxt),
      ),
      resolve: pipe(
        map(prop<Task<TaskInput, Output>>()("resolve")),
        // @ts-ignore reason: TODO - fix typing
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
 * Queues the "execute" function until the condition is met or maxWaitTime has passed.
 * Once one of the above happens we flush the queue and run the execute functions
 */
export const batch = <
  TaskKey extends string | number | symbol,
  TaskInput,
  Output,
>(
  keyFn: (_: TaskInput) => TaskKey,
  maxWaitMilliseconds: number,
  execute: Executor<TaskInput, Output>,
  condition: (_: TaskInput[]) => boolean,
) => {
  const keyToTasks: Record<TaskKey, Task<TaskInput, Output>[]> = {} as Record<
    TaskKey,
    Task<TaskInput, Output>[]
  >;

  type Timeout = ReturnType<typeof setTimeout>;

  const keyToTimeout: Record<TaskKey, Timeout> = {} as Record<TaskKey, Timeout>;

  const clearAndExecute = (key: TaskKey) => {
    executeTasks(execute)(keyToTasks[key]);
    clearTimeout(keyToTimeout[key]);
    delete keyToTimeout[key];
    delete keyToTasks[key];
  };

  return pipe(
    pairRight(keyFn),
    ([input, key]: [TaskInput, TaskKey]) =>
      new Promise((resolve, reject) => {
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
      }),
  );
};

export const timeout = <Args extends unknown[], Output>(
  ms: number,
  fallback: (..._: Args) => Output | Promise<Output>,
  f: (..._: Args) => Promise<Output>,
) =>
(...args: Args): Promise<Output> =>
  new Promise((resolve) => {
    let wasResolved = false;
    setTimeout(() => {
      if (wasResolved) return;
      const result = fallback(...args);
      if (result instanceof Promise) result.then(resolve);
      else resolve(result);
    }, ms);
    const result = f(...args);
    result.then((x) => {
      wasResolved = true;
      resolve(x);
    });
  });