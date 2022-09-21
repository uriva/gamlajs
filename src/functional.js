import {
  addIndex,
  adjust,
  complement,
  flip,
  fromPairs,
  identity,
  includes,
  nth,
  prop,
  toPairs,
  uniq,
} from "ramda";
import { after, pipe } from "./composition";
import { head, second, wrapArray } from "./array";
import { juxt, pairRight, stack } from "./juxt";

import { map } from "./map";
import { reduce } from "./reduce";

export const always = (x) => () => x;
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
    () => [],
  );

export const groupBy = pipe(after(wrapArray), groupByMany);

export const edgesToGraph = pipe(groupBy(nth(0)), map(pipe(map(nth(1)), uniq)));

export const spread = (f) => (x) => f(...x);

export const keyMap = (fn) => pipe(toPairs, map(adjust(0, fn)), fromPairs);

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

export const asyncExcepts =
  (func, handler) =>
  async (...args) => {
    try {
      return await func(...args);
    } catch (err) {
      return handler(err);
    }
  };

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

export const valMap = (f) => pipe(toPairs, map(stack(identity, f)), fromPairs);

// See MDN Object constructor.
const isObject = (obj) => obj === Object(obj);

export const mapTerminals = (terminalMapper) => (obj) =>
  Array.isArray(obj)
    ? map(mapTerminals(terminalMapper))(obj)
    : isObject(obj) && !(obj instanceof Function)
    ? valMap(mapTerminals(terminalMapper))(obj)
    : terminalMapper(obj);

export const applyTo =
  (...args) =>
  (f) =>
    f(...args);

export const applySpec =
  (spec) =>
  (...args) =>
    mapTerminals(applyTo(...args))(spec);

export const product = reduce(
  (a, b) => a.flatMap((x) => b.map((y) => [...x, y])),
  () => [[]],
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

export const filter = pipe(
  pairRight,
  map,
  after(pipe((array) => array.filter(second), map(head))),
);

export const remove = pipe(complement, filter);

export const explode = (...positions) =>
  pipe(
    addIndex(map)((x, i) =>
      complement(includedIn(positions))(i) ? wrapArray(x) : x,
    ),
    product,
  );

export const count = prop("length");
export const rate = (f) =>
  pipe(juxt(pipe(filter(f), count), count), ([x, y]) => x / y);

export const countTo = (x) => {
  const result = [];
  for (let i = 0; i < x; i++) result.push(i);
  return result;
};
