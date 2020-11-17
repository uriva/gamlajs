import { apply, equals, head, last, length, map, zip } from "ramda";
import { asyncPipe } from "./functional";

/**
 * Batches calls to `executeQueues` at a specified interval.
 * @param argsToKey(arg1, arg2...) Invoked with f's arguments expected to return a textual key.
 * @param interval Interval in ms to wait for subsequent calls.
 * @param executeQueue - Invoked with a list of tasks. A task is a pair of [ resolve, [args] ].
 * @returns {function(...[*]): Promise}
 */
export const batch = (argsToKey, interval, executeQueue) => {
  const queues = {};

  return (...args) =>
    new Promise((resolve) => {
      const key = argsToKey(...args);
      queues[key] = queues[key] || [];
      queues[key].push([resolve, args]);

      if (equals(length(queues[key]), 1)) {
        setTimeout(() => {
          executeQueue(queues[key]);
          delete queues[key];
        }, interval);
      }
    });
};

const applyPair = ([f, args]) => f(args);

/* Transform `f` into a function that receives a list of tasks and executes them in a single call to `f`.
 *   Where a task is the pair [ resolve, [args] ].
 * @param merge([[call1Args], [call2Args],...])
 *    Invoked with an array of arguments.
 *    Each element in the array is a list of arguments that was passed in for a specific call to `f`.
 *    Expected to merge all function calls into a single argument list `f` will be invoked with.
 * @param split(args, results)
 *    Invoked with the original call list (similar to merge) and the results.
 *    Expected to return a list of length `args.length` where each element
 *    represents the results to return to a single caller.
 * @param f
 *    The function to transform.
 */
export const singleToMultiple = (merge, split, f) => (tasks) => {
  const args = merge(map(last, tasks));
  asyncPipe(
    apply(f),
    (results) => split(args, results),
    zip(map(head, tasks)),
    map(applyPair)
  )(args);
};
