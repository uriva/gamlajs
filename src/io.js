import { apply, head, last, map, zip } from "ramda";
import { asyncPipe } from "./functional";

const applyPair = ([f, args]) => f(args);

const executeQueue = (f, merge, split) => (tasks) => {
  const args = merge(map(last, tasks));
  asyncPipe(
    apply(f),
    (results) => split(args, results),
    zip(map(head, tasks)),
    map(applyPair)
  )(args);
};

/**
 * Transforms f and batches calls to f in 100ms intervals.
 * @param argsToKey(arg1, arg2...) Invoked with f's arguments expected to return a textual key.
 * @param merge([[call1Args], [call2Args],...])
 *    Invoked with an array of arguments.
 *    Each element in the array is a list of arguments that was passed in for a specific call to f.
 *    Expected to merge all function calls into a single argument list f will be invoked with.
 * @param split(args, results)
 *    Invoked with the original call list (similar to merge) and the results.
 *    Expected to return a list of length `args.length` where each element
 *    represents the results to return to a single caller.
 * @param f
 *    The function to add batching ability to.
 * @returns {function(...[*]): Promise<unknown>}
 */
export const batch = (argsToKey, merge, split, f) => {
  const queues = {};
  const execute = executeQueue(f, merge, split);

  return (...args) =>
    new Promise((resolve) => {
      const key = argsToKey(...args);
      queues[key] = queues[key] || [];
      if (!queues[key].length) {
        setTimeout(() => {
          execute(queues[key]);
          delete queues[key];
        }, 100);
      }
      queues[key].push([resolve, args]);
    });
};
