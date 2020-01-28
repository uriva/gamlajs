import {
  apply,
  chain,
  groupBy,
  map,
  nth,
  pipe,
  tap,
  uniq,
  xprod,
  filter,
  reduce,
  identity
} from "ramda";

export const edgesToGraph = pipe(groupBy(nth(0)), map(pipe(map(nth(1)), uniq)));

export const groupByMany = f =>
  pipe(
    chain(pipe(element => [f(element), [element]], apply(xprod))),
    edgesToGraph
  );

export const log = tap(console.log);

export const asyncIdentity = async input => await Promise.resolve(input);

export const asyncPipe = (...funcs) => input =>
  reduce(async (acc, f) => f(await acc), Promise.resolve(input), funcs);

export const asyncFirst = (...funcs) => async (...args) => {
  const results = await asyncPipe(
    map(f => f(...args)),
    promises => new Promise(resolve => Promise.all(promises).then(resolve)),
    filter(identity)
  )(funcs);

  if (results.length) {
    return results[0];
  }
};
