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
