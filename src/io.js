import {
  applySpec,
  isNil,
  juxt,
  map,
  pipe,
  prop,
  tap,
  unless,
  when,
} from "ramda";
import { asyncExcepts, asyncPairRight, asyncPipe, stack } from "./functional";

export const executeConditionally = (executeQueue, condition) => (
  clear,
  resolveAll
) => pipe(tap(clear), when(condition, asyncPipe(executeQueue, resolveAll)));

export const batch = (keyFn, waitTime, execute) => {
  const queues = {};

  return asyncPipe(
    asyncPairRight(keyFn),
    ([input, key]) =>
      new Promise((resolve, reject) => {
        queues[key] = queues[key] || [];
        queues[key].push({ resolve, reject, input });

        setTimeout(
          pipe(
            () => queues[key],
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
                    execute(() => delete queues[key], resolve),
                    reject
                  )(input)
              )
            )
          ),
          waitTime
        );
      })
  );
};

export const singleToMultiple = (merge, split, f) => (tasks) =>
  asyncPipe(merge, f, (results) => split(tasks, results))(tasks);
