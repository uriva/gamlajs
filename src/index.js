import { apply, chain, groupBy, map, nth, pipe, tap, uniq, xprod } from "ramda";

export const edgesToGraph = pipe(groupBy(nth(0)), map(pipe(map(nth(1)), uniq)));

export const groupByMany = f =>
  pipe(
    chain(pipe(element => [f(element), [element]], apply(xprod))),
    edgesToGraph
  );

export const log = tap(console.log);

export const first = (funcs, default_value) => (...args) => {
  for (let i = 0; i < funcs.length; i++) {
    const result = apply(funcs, ...args);
    if (result !== default_value) {
      return result;
    }
  }
  return default_value;
};