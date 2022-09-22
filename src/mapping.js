import { after, applyTo, pipe } from "./composition";
import { head, second, unique, wrapArray } from "./array";

import { map } from "./map";
import { stack } from "./juxt";

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
