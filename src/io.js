import { applySpec, asyncExcepts, spread } from "./functional";
import { juxt, pairRight, stack } from "./juxt";

import { map } from "./map";
import { pipe } from "./composition";
import { prop } from "./operator";

const executeTasks = (execute) =>
  pipe(
    applySpec({
      input: map(prop("input")),
      reject: pipe(map(prop("reject")), spread(juxt)),
      resolve: pipe(map(prop("resolve")), spread(stack)),
    }),
    ({ input, resolve, reject }) =>
      asyncExcepts(pipe(execute, resolve), reject)(input),
  );

/**
 * Queues the "execute" function until the condition is met or maxWaitTime has passed.
 * Once one of the above happens we flush the queue and run the execute functions
 */
export const batch = (keyFn, maxWaitMilliseconds, execute, condition) => {
  const keyToTasks = {};
  const keyToTimeout = {};

  const clearAndExecute = (key) => {
    executeTasks(execute)(keyToTasks[key]);
    clearTimeout(keyToTimeout[key]);
    delete keyToTimeout[key];
    delete keyToTasks[key];
  };

  return pipe(
    pairRight(keyFn),
    ([input, key]) =>
      new Promise((resolve, reject) => {
        keyToTasks[key] = [
          ...(keyToTasks[key] || []),
          { resolve, reject, input },
        ];
        if (condition(map(prop("input"))(keyToTasks[key]))) {
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
