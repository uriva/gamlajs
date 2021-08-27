import {
  adjust,
  apply,
  chain,
  concat,
  curry,
  filter,
  flip,
  fromPairs,
  groupBy,
  head,
  identity,
  includes,
  juxt,
  last,
  map,
  nth,
  pipe,
  reduce,
  tap,
  toPairs,
  uniq,
  xprod,
} from "ramda";

export const edgesToGraph = pipe(groupBy(nth(0)), map(pipe(map(nth(1)), uniq)));

export const groupByMany = (f) =>
  pipe(
    chain(pipe((element) => [f(element), [element]], apply(xprod))),
    edgesToGraph
  );

export const log = tap(console.log);

const resolveAll = (promises) => Promise.all(promises);

export const asyncIdentity = (input) => Promise.resolve(input);

export const asyncPipe =
  (...funcs) =>
  (input) =>
    reduce(async (acc, f) => f(await acc), Promise.resolve(input), funcs);

export const asyncFirst =
  (...funcs) =>
  async (...args) => {
    const results = await asyncPipe(
      map((f) => f(...args)),
      resolveAll,
      filter(identity)
    )(funcs);

    if (results.length) {
      return results[0];
    }
  };

export const asyncMap = curry((f, seq) => asyncPipe(map(f), resolveAll)(seq));

export const asyncJuxt =
  (funcs) =>
  (...args) =>
    // asyncPipe is unary so we apply.
    asyncPipe(juxt(map(apply, funcs)), resolveAll)(args);

export const asyncFilter = (pred) =>
  asyncPipe(
    asyncMap(async (arg) => [arg, await pred(arg)]),
    filter(last),
    map(head)
  );

export const keyMap = (fn) => pipe(toPairs, map(adjust(0, fn)), fromPairs);

export const sortAlphabetically = (array) =>
  array.sort((str1, str2) => str1.localeCompare(str2));

export const asyncReduce = (f, initial, seq) =>
  reduce(async (acc, item) => f(await acc, item), initial, seq);

// Zips arrays by the length of the first.
export const zip = (...arrays) =>
  arrays[0].map((_, i) => arrays.map((arr) => arr[i]));

const getTimestampMilliseconds = () => new Date().getTime();

export const timeit =
  (handler, f) =>
  async (...args) => {
    const started = getTimestampMilliseconds();
    const result = await f(...args);
    handler(getTimestampMilliseconds() - started, args, result);
    return result;
  };

export const asyncTap = (f) => async (x) => {
  await f(x);
  return x;
};

export const asyncPairRight = (f) => asyncJuxt([identity, f]);

export const asyncExcepts =
  (func, handler) =>
  async (...args) => {
    try {
      return await func(...args);
    } catch (err) {
      return handler(err);
    }
  };

export const stack = (functions) =>
  pipe(
    (values) => zip(functions, values),
    map(([f, x]) => f(x))
  );

export const asyncIfElse =
  (predicate, fTrue, fFalse) =>
  async (...args) => {
    if (await predicate(...args)) {
      return fTrue(...args);
    }
    return fFalse(...args);
  };

export const after = (f1) => (f2) => asyncPipe(f2, f1);
export const before = (f1) => (f2) => asyncPipe(f1, f2);
export const juxtCat = pipe(asyncJuxt, after(reduce(concat, [])));
export const mapCat = pipe(asyncMap, after(reduce(concat, [])));
export const contains = flip(includes);

export const type = (x) => typeof x;

export const testRegExp = (regexp) => (x) => regexp.test(x);

export const isValidRegExp = (str) => {
  try {
    new RegExp(str);
    return true;
  } catch (e) {
    return false;
  }
};
