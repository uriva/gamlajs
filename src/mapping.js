import { after, applyTo, pipe } from "./composition.js";
import { head, second, unique, wrapArray } from "./array.js";

import { map } from "./map.js";
import { stack } from "./juxt.js";

export const groupByManyReduce = (keys, reducer, initial) => (it) => {
  const result = {};
  for (const x of it) {
    for (const key of keys(x)) {
      result[key] = reducer(key in result ? result[key] : initial(), x);
    }
  }
  return result;
};

export const groupByReduce = (key, ...rest) =>
  groupByManyReduce(pipe(key, wrapArray), ...rest);

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

export const edgesToGraph = pipe(groupBy(head), map(pipe(map(second), unique)));

export const entryMap = (f) => pipe(Object.entries, map(f), Object.fromEntries);
export const valMap = (f) => entryMap(stack((x) => x, f));
export const keyMap = (f) => entryMap(stack(f, (x) => x));

// See MDN Object constructor.
const isObject = (obj) => obj === Object(obj);

export const mapTerminals = (terminalMapper) => (obj) =>
  Array.isArray(obj)
    ? map(mapTerminals(terminalMapper))(obj)
    : isObject(obj) && !(obj instanceof Function)
    ? valMap(mapTerminals(terminalMapper))(obj)
    : terminalMapper(obj);

export const applySpec =
  (spec) =>
  (...args) =>
    mapTerminals(applyTo(...args))(spec);

const objToGetterWithDefault = (d) => (obj) => (key) =>
  key in obj ? obj[key] : d;

const returnValueAfterNCalls = (n, constructor) =>
  n ? () => returnValueAfterNCalls(n - 1, constructor) : constructor();

export const index =
  (key, ...keys) =>
  (xs) => {
    if (!key) return xs;
    const result = {};
    for (const x of xs) {
      result[key(x)] = result[key(x)] || [];
      result[key(x)].push(x);
    }
    return objToGetterWithDefault(
      returnValueAfterNCalls(keys.length, () => []),
    )(valMap(index(...keys))(result));
  };
