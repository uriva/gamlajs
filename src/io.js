import {
  applySpec,
  ifElse,
  isNil,
  juxt,
  map,
  pipe,
  prop,
  tap,
  unless,
} from "ramda";
import { asyncExcepts, asyncPairRight, asyncPipe, stack } from "./functional";

const clearAndExecuteQueue = (getQueue, clearQueue, execute) =>
  pipe(
    getQueue,
    unless(
      isNil,
      pipe(
        applySpec({
          input: map(prop("input")),
          reject: pipe(map(prop("reject")), juxt),
          resolve: pipe(map(prop("resolve")), stack),
        }),
        ({ input, resolve, reject }) =>
          asyncExcepts(
            asyncPipe(tap(clearQueue), execute, resolve),
            reject
          )(input)
      )
    )
  );

/**
 * Queues the "execute" function until the condition is met or maxWaitTime has passed.
 * Once one of the above happens we flush the queue and run the execute functions
 */
export const batch = (keyFn, maxWaitTime, execute, condition) => {
  const queues = {};
  const maxWaitTimeout = {};

  return asyncPipe(
    asyncPairRight(keyFn),
    ([input, key]) =>
      new Promise((resolve, reject) => {
        queues[key] = queues[key] || [];
        queues[key].push({ resolve, reject, input });
        const clearQueue = clearAndExecuteQueue(
          () => queues[key],
          () => delete queues[key],
          execute
        );

        ifElse(condition, clearQueue, () => {
          clearTimeout(maxWaitTimeout[key]);
          maxWaitTimeout[key] = setTimeout(
            pipe(() => delete maxWaitTimeout[key], clearQueue),
            maxWaitTime
          );
        })(input);
      })
  );
};

export const singleToMultiple = (merge, split, f) => (tasks) =>
  asyncPipe(merge, f, (results) => split(tasks, results))(tasks);
