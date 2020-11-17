import {
  apply,
  equals,
  head,
  last,
  length,
  map,
  prop,
  tap,
  unapply,
  zip,
} from "ramda";
import { asyncJuxt, asyncPairRight, asyncPipe } from "./functional";

/**
 * Batches calls to `executeQueues` at a specified interval.
 * @param argsToKey(arg1, arg2...) Invoked with f's arguments expected to return a textual key.
 * @param waitTime Interval in ms to wait for subsequent calls.
 * @param executeQueue - Invoked with a list of tasks. A task is a pair of [ resolve, [args] ].
 * @returns {function(...[*]): Promise}
 */
export const batch = (argsToKey, waitTime, executeQueue) => {
  const queues = {};

  return unapply(
    asyncPipe(
      asyncPairRight(apply(argsToKey)),
      ([args, key]) =>
        new Promise((resolve) => {
          queues[key] = queues[key] || [];
          queues[key].push([resolve, args]);

          if (equals(length(queues[key]), 1)) {
            setTimeout(() => {
              asyncPipe(
                prop(key),
                tap(() => delete queues[key]),
                asyncJuxt([map(head), asyncPipe(map(last), executeQueue)]),
                apply(zip),
                map(applyPair)
              )(queues);
            }, waitTime);
          }
        })
    )
  );
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
export const singleToMultiple = (merge, split, f) => (tasks) =>
  asyncPipe(merge, apply(f), (results) => split(tasks, results))(tasks);
