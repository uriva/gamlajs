import { juxt, pairRight, stack } from "./juxt.ts";
import { prop, spread } from "./operator.ts";

import { applySpec } from "./mapping.ts";
import { map } from "./map.ts";
import { pipe } from "./composition.ts";

type Executor<TaskInput> = (_: TaskInput[]) => any;
const executeTasks = <TaskInput>(execute: Executor<TaskInput>) =>
  pipe(
    applySpec({
      input: map(prop<Task<TaskInput>, "input">("input")),
      reject: pipe(
        map(prop<Task<TaskInput>, "reject">("reject")),
        spread(juxt),
      ),
      resolve: pipe(
        map(prop<Task<TaskInput>, "resolve">("resolve")),
        spread(stack),
      ),
    }),
    async ({ input, resolve, reject }: Task<TaskInput[]>): Promise<any> => {
      try {
        resolve(await execute(input));
      } catch (e) {
        reject(e);
      }
    },
  );

type Task<TaskInput> = {
  resolve: (_: any) => void;
  reject: (_: any) => void;
  input: TaskInput;
};

/**
 * Queues the "execute" function until the condition is met or maxWaitTime has passed.
 * Once one of the above happens we flush the queue and run the execute functions
 */
export const batch = <TaskKey extends string | number | symbol, TaskInput>(
  keyFn: (_: TaskInput) => TaskKey,
  maxWaitMilliseconds: number,
  execute: Executor<TaskInput>,
  condition: (_: TaskInput[]) => boolean,
) => {
  const keyToTasks: Record<TaskKey, Task<TaskInput>[]> = {} as Record<
    TaskKey,
    Task<TaskInput>[]
  >;
  const keyToTimeout: Record<TaskKey, NodeJS.Timeout> = {} as Record<
    TaskKey,
    NodeJS.Timeout
  >;

  const clearAndExecute = (key: TaskKey) => {
    executeTasks(execute)(keyToTasks[key]);
    clearTimeout(keyToTimeout[key]);
    delete keyToTimeout[key];
    delete keyToTasks[key];
  };

  return pipe(
    pairRight<TaskInput, TaskKey>(keyFn),
    ([input, key]: [TaskInput, TaskKey]) =>
      new Promise((resolve, reject) => {
        keyToTasks[key] = [
          ...((keyToTasks[key] || []) as Task<TaskInput>[]),
          { resolve, reject, input },
        ] as Task<TaskInput>[];
        if (
          condition(
            map<Task<TaskInput>, TaskInput, false>(
              prop<Task<TaskInput>, "input">("input"),
            )(keyToTasks[key]),
          )
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

export const timeout =
  <Args extends any[], Output>(
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
      result.then((x: any) => {
        wasResolved = true;
        resolve(x);
      });
    });
