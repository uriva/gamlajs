import { applySpec, juxt, map, pipe, prop, tap } from "ramda";
import { asyncExcepts, asyncPairRight, asyncPipe, stack } from "./functional.js";

const clearAndExecuteTasks = (clearTasks, execute) =>
  pipe(
    tap(clearTasks),
    applySpec({
      input: map(prop("input")),
      reject: pipe(map(prop("reject")), juxt),
      resolve: pipe(map(prop("resolve")), stack),
    }),
    ({ input, resolve, reject }) =>
      asyncExcepts(asyncPipe(execute, resolve), reject)(input)
  );

/**
 * Queues the "execute" function until the condition is met or maxWaitTime has passed.
 * Once one of the above happens we flush the queue and run the execute functions
 */
export const batch = (keyFn, maxWaitMilliseconds, execute, condition) => {
  const keyToTasks = {};
  const keyToTimeoutObject = {};

  const clearTasks = (key) => () => {
    clearTimeout(keyToTimeoutObject[key]);
    delete keyToTimeoutObject[key];
    delete keyToTasks[key];
  };

  const clearAndExecute = (key) =>
    clearAndExecuteTasks(clearTasks(key), execute)(keyToTasks[key]);

  return asyncPipe(
    asyncPairRight(keyFn),
    ([input, key]) =>
      new Promise((resolve, reject) => {
        keyToTasks[key] = [
          ...(keyToTasks[key] || []),
          { resolve, reject, input },
        ];

        if (condition(map(prop("input"), keyToTasks[key]))) {
          clearAndExecute(key);
        } else {
          clearTimeout(keyToTimeoutObject[key]);
          keyToTimeoutObject[key] = setTimeout(
            () => clearAndExecute(key),
            maxWaitMilliseconds
          );
        }
      })
  );
};

export const singleToMultiple = (merge, split, f) => (tasks) =>
  asyncPipe(merge, f, (results) => split(tasks, results))(tasks);
