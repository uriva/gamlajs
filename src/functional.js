import { after, complement, pipe } from "./composition";
import { head, second, unique, wrapArray } from "./array";
import { juxt, pairRight, stack } from "./juxt";

import { map } from "./map";
import { prop } from "./operator";
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

export const edgesToGraph = pipe(groupBy(head), map(pipe(map(second), unique)));

export const spread = (f) => (x) => f(...x);

export const entryMap = (f) => pipe(Object.entries, map(f), Object.fromEntries);
export const valMap = (f) => entryMap(stack((x) => x, f));
export const keyMap = (f) => entryMap(stack(f, (x) => x));

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

export const testRegExp = (regexp) => (x) => regexp.test(x);

export const isValidRegExp = (str) => {
  try {
    new RegExp(str);
    return true;
  } catch (e) {
    return false;
  }
};

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
    reduce(
      ({ index, result }, current) => {
        result.push(positions.includes(index) ? current : wrapArray(current));
        return { index: index + 1, result };
      },
      () => ({ index: 0, result: [] }),
    ),
    prop("result"),
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
