import {
  addIndex,
  adjust,
  complement,
  concat,
  filter,
  flip,
  fromPairs,
  identity,
  includes,
  last,
  nth,
  prop,
  reduce,
  toPairs,
  uniq,
} from "ramda";
import { after, pipe } from "./composition";
import { head, wrapArray } from "./array";
import { isPromise, promiseAll, wrapPromise } from "./promise";

export const groupByManyReduce = (keys, reducer, initial) => (it) => {
  const result = {};
  for (const x of it) {
    for (const key of keys(x)) {
      result[key] = reducer(key in result ? result[key] : initial(), x);
    }
  }
  return result;
};

export const groupByMany = (keys) =>
  groupByManyReduce(
    keys,
    (s, x) => {
      s.push(x);
      return s;
    },
    () => []
  );

export const groupBy = pipe(after(wrapArray), groupByMany);

export const map = (f) => (seq) => {
  const results = seq.map(f);
  return results.some(isPromise) ? Promise.all(results) : results;
};

export const edgesToGraph = pipe(groupBy(nth(0)), map(pipe(map(nth(1)), uniq)));

export const asyncFirst =
  (...funcs) =>
  async (...args) => {
    const results = await pipe(
      map((f) => f(...args)),
      promiseAll,
      filter(identity)
    )(funcs);

    if (results.length) {
      return results[0];
    }
  };
export const spread = (f) => (x) => f(...x);
export const juxt =
  (...fs) =>
  (...x) =>
    map((f) => f(...x))(fs);

export const asyncFilter = (pred) =>
  pipe(
    map(async (arg) => [arg, await pred(arg)]),
    filter(last),
    map(head)
  );

export const keyMap = (fn) => pipe(toPairs, map(adjust(0, fn)), fromPairs);

export const asyncReduce = (f, initial, seq) =>
  reduce(async (acc, item) => f(await acc, item), initial, seq);

// Zips arrays by the length of the first.
export const zip = (...arrays) =>
  arrays[0].map((_, i) => arrays.map((arr) => arr[i]));

const getTimestampMilliseconds = () => new Date().getTime();

export const asyncTimeit =
  (handler, f) =>
  async (...args) => {
    const started = getTimestampMilliseconds();
    const result = await f(...args);
    handler(getTimestampMilliseconds() - started, args, result);
    return result;
  };

export const timeit =
  (handler, f) =>
  (...args) => {
    const started = getTimestampMilliseconds();
    const result = f(...args);
    handler(getTimestampMilliseconds() - started, args, result);
    return result;
  };

export const asyncTap = (f) => async (x) => {
  await f(x);
  return x;
};

export const asyncPairRight = (f) => juxt(identity, f);

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

export const asyncStack = (functions) =>
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

export const asyncUnless = (predicate, fFalse) =>
  asyncIfElse(predicate, wrapPromise, fFalse);
export const asyncWhen = (predicate, fTrue) =>
  asyncIfElse(predicate, fTrue, wrapPromise);

export const juxtCat = pipe(juxt, after(reduce(concat, [])));
export const mapCat = pipe(map, after(reduce(concat, [])));
export const contains = flip(includes);

export const testRegExp = (regexp) => (x) => regexp.test(x);

export const isValidRegExp = (str) => {
  try {
    new RegExp(str);
    return true;
  } catch (e) {
    return false;
  }
};

export const asyncValMap = (f) =>
  pipe(toPairs, map(asyncStack([identity, f])), fromPairs);

// See MDN Object constructor.
const isObject = (obj) => obj === Object(obj);

export const asyncMapObjectTerminals = (terminalMapper) => (obj) => {
  if (Array.isArray(obj)) {
    return map(asyncMapObjectTerminals(terminalMapper))(obj);
  }

  if (isObject(obj) && !(obj instanceof Function)) {
    return asyncValMap(asyncMapObjectTerminals(terminalMapper))(obj);
  }

  return terminalMapper(obj);
};

// This function differs from ramda's by the fact it supports variadic functions.
export const applyTo =
  (...args) =>
  (f) =>
    f(...args);

export const asyncApplySpec =
  (spec) =>
  (...args) =>
    asyncMapObjectTerminals(applyTo(...args))(spec);

export const product = reduce(
  (a, b) => a.flatMap((x) => b.map((y) => [...x, y])),
  [[]]
);

export const sideEffect = (f) => (x) => {
  f(x);
  return x;
};

export const log = sideEffect(console.log);
export const logTable = sideEffect(console.table);
export const includedIn = (stuff) => (x) => stuff.includes(x);
export const logWith = (...x) => sideEffect((y) => console.log(...x, y));
export const pack = (...stuff) => stuff;

export const remove = pipe(complement, (f) => (arr) => arr.filter(f));

export const explode = (...positions) =>
  pipe(
    addIndex(map)((x, i) =>
      complement(includedIn(positions))(i) ? wrapArray(x) : x
    ),
    product
  );

export const count = prop("length");
export const mapcat = (f) => pipe(map(f), reduce(concat, []));
export const rate = (f) =>
  pipe(juxt(pipe(filter(f), count), count), ([x, y]) => x / y);

export const countTo = (x) => {
  const result = [];
  for (let i = 0; i < x; i++) result.push(i);
  return result;
};

export const valmap = (f) => (o) =>
  Object.fromEntries(Object.entries(o).map(([x, y]) => [x, f(y)]));

export const between =
  ([start, end]) =>
  (x) =>
    start <= x && x < end;
