import { after, applyTo, before, identity, pipe } from "./composition.js";
import { head, second, wrapArray } from "./array.ts";

import { Map } from "immutable";
import { filter } from "./filter.js";
import { map } from "./map.js";
import { reduce } from "./reduce.js";
import { stack } from "./juxt.js";

export const wrapObject = (key) => (value) => ({ [key]: value });

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

export const addEntry = (key, value) => (obj) => ({
  ...obj,
  [key]: value,
});

export const groupBy = pipe(after(wrapArray), groupByMany);

export const edgesToGraph = pipe(
  groupByReduce(
    head,
    (s, edge) => {
      s.add(edge[1]);
      return s;
    },
    () => new Set(),
  ),
);

const onEntries = (transformation) =>
  pipe(Object.entries, transformation, Object.fromEntries);

export const entryMap = pipe(map, onEntries);
export const entryFilter = pipe(filter, onEntries);

export const valFilter = pipe(before(second), entryFilter);
export const keyFilter = pipe(before(head), entryFilter);

export const valMap = (f) => entryMap(stack(identity, f));
export const keyMap = (f) => entryMap(stack(f, identity));

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

const setter = (obj, key, value) => obj.set(key, value);

const getter = (constructor) => (obj, key) =>
  replaceIfUndefined(obj.get(key), constructor());

const nonterminalGetter = getter(() => Map());

const dbReducer =
  ({
    keys: [key, ...keys],
    reducer,
    terminalGetter,
    setter,
    nonterminalGetter,
  }) =>
  (state, current) =>
    setter(
      state,
      key(current),
      keys.length
        ? dbReducer({
            keys,
            reducer,
            terminalGetter,
            setter,
            nonterminalGetter,
          })(nonterminalGetter(state, key(current)), current)
        : reducer(terminalGetter(state, key(current)), current),
    );

const replaceIfUndefined = (value, replacement) =>
  value === undefined ? replacement : value;

const query =
  (leafConstructor) =>
  (index) =>
  ([key, ...keys]) =>
    keys.length
      ? query(leafConstructor)(nonterminalGetter(index, key))(keys)
      : getter(leafConstructor)(index, key);

export const index = ({ keys, reducer, leafConstructor }) => ({
  build: () => Map(),
  query: query(leafConstructor),
  insert: (index, xs) =>
    reduce(
      dbReducer({
        keys,
        reducer,
        nonterminalGetter,
        terminalGetter: getter(leafConstructor),
        setter,
      }),
      () => index,
    )(xs),
});
