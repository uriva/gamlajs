import { juxt, pairRight, stack } from "./juxt.js";
import { prop, spread } from "./operator.ts";

import { applySpec } from "./mapping.js";
import { isPromise } from "./promise.js";
import { map } from "./map.js";
import { pipe } from "./composition.js";

export const asyncExcepts =
  (func, handler) =>
  async (...args) => {
    try {
      return await func(...args);
    } catch (err) {
      return handler(err);
    }
  };

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

export const timeout =
  (ms, fallback, f) =>
  (...args) =>
    new Promise((resolve) => {
      let wasResolved = false;
      setTimeout(() => {
        if (wasResolved) return;
        const result = fallback(...args);
        if (isPromise(result)) result.then(resolve);
        else resolve(result);
      }, ms);
      const result = f(...args);
      if (isPromise(result))
        result.then((x) => {
          wasResolved = true;
          resolve(x);
        });
      else resolve(result);
    });
